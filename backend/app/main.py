from typing import Annotated, Optional
import json
import os
from dotenv import load_dotenv
from datetime import timedelta

from jwt import decode, InvalidTokenError
from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, field_validator
from .service.scan_client import ScanClient
from .service.user_client import (
    UserClient,
    UserAlreadyExistsError,
    InvalidCredentialsError,
)
from .db.database import init_db, get_db
from .db.repos import ScanRepo, UserRepo, AISummaryRepo
from .db.models import User, PageParams, Domain
from .service.jwt import create_access_token, SECRET_KEY, ALGORITHM

from sqlalchemy.orm import Session

from contextlib import asynccontextmanager
from enum import Enum
from .AI.llm import ensure_model_available, stream_llm, stream_chat_llm
from .AI.prompts import (
    NON_TECHNICAL_SUMMARISER_AGENT_PROMPT,
    TECHNICAL_SUMMARISER_AGENT_PROMPT,
    CHAT_AGENT_PROMPT,
)

# from codecarbon import EmissionsTracker

load_dotenv()

ACCESS_TOKEN_EXPIRE_MINUTES = 1440

db_session = Annotated[Session, Depends(get_db)]


def get_scan_repo(db: db_session) -> ScanRepo:
    return ScanRepo(db)


def get_user_repo(db: db_session) -> UserRepo:
    return UserRepo(db)


def get_ai_summary_repo(db: db_session) -> AISummaryRepo:
    return AISummaryRepo(db)


scan_repo = Annotated[ScanRepo, Depends(get_scan_repo)]
user_repo = Annotated[UserRepo, Depends(get_user_repo)]
ai_summary_repo = Annotated[AISummaryRepo, Depends(get_ai_summary_repo)]


def get_scan_client(scanRepo: scan_repo) -> ScanClient:
    _scan_client.scanRepo = scanRepo
    return _scan_client


def get_user_client(userRepo: user_repo) -> UserClient:
    _user_client.userRepo = userRepo
    return _user_client


_scan_client: ScanClient
_user_client: UserClient

scan_client = Annotated[ScanClient, Depends(get_scan_client)]
user_client = Annotated[UserClient, Depends(get_user_client)]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], userClient: user_client
):
    try:
        payload = decode(token, key=SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(401, "Could not validate credentials")
    except InvalidTokenError:
        raise HTTPException(401, "Could not validate credentials")

    user = userClient.get_user(username=username)
    if user is None:
        raise HTTPException(401, "Could not validate credentials")
    return user


# Makes sure a model is ready before letting the app run
@asynccontextmanager
async def lifespan(app: FastAPI):
    global _scan_client, _user_client
    ensure_model_available()
    init_db()
    _scan_client = ScanClient(zap_apiKey=os.getenv("ZAP_API_KEY"))
    _user_client = UserClient()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScanRequest(BaseModel):
    url: str
    apiKey: str | None = None
    project_title: str | None = None
    project_description: str | None = None


class scriptUpload(BaseModel):
    script_name: str
    script_type: str
    script_engine: str
    file_name: str
    charset: str | None = None


class SummaryType(str, Enum):
    technical = "technical"
    non_technical = "non-technical"


class SumRequest(BaseModel):
    url: str
    summary_type: SummaryType = SummaryType.non_technical
    scan_id: Optional[int] = None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    url: str
    messages: list[ChatMessage]
    summary_type: SummaryType = SummaryType.non_technical


class ScriptUpload(BaseModel):
    script_name: str
    script_type: str
    script_engine: str
    file_name: str
    charset: str | None = None


class Project(BaseModel):
    domain: str
    title: str
    description: Optional[str] = None

    @field_validator("description")
    @classmethod
    def description_max_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 500:
            raise ValueError("Description cannot exceed 500 characters")
        return v


class ProjectUpdate(BaseModel):
    domain_id: int
    title: str
    description: Optional[str] = None

    @field_validator("description")
    @classmethod
    def description_max_length(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 500:
            raise ValueError("Description cannot exceed 500 characters")
        return v


@app.post("/register")
def register(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], userClient: user_client
):
    try:
        new_user = userClient.createUser(form_data.username, form_data.password)

        return {
            "message": "registered",
            "username": new_user.username,
        }
    except UserAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/login")
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], userClient: user_client
):
    try:
        existing_user = userClient.login(form_data.username, form_data.password)
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": existing_user.username}, expires_delta=access_token_expires
        )

        return {
            "message": "login successful",
            "token": access_token,
        }
    except InvalidCredentialsError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/logout")
def logout():
    return {"message": "logged out"}


@app.post("/user/proj")
def createProject(
    userRepo: user_repo,
    currentUser: Annotated[User, Depends(get_current_user)],
    proj: Project
):
    try:
        domain = Domain(
            domain=proj.domain,
            title=proj.title,
            description=proj.description,
            user_id=currentUser.id,
        )
        return userRepo.saveDomain(domain)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/user/proj")
def updateProject(
    userRepo: user_repo,
    currentUser: Annotated[User, Depends(get_current_user)],
    proj: ProjectUpdate
):
    try:
        domain = userRepo.getDomain(proj.domain_id)
        if domain is None:
            raise HTTPException(status_code=404, detail="Project not found")
        if domain.user_id != currentUser.id:
            raise HTTPException(status_code=403, detail="You do not have permission to edit this project")
        return userRepo.updateDomain(domain, proj.title, proj.description)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/user/proj")
def deleteProject(
    userRepo: user_repo,
    currentUser: Annotated[User, Depends(get_current_user)],
    proj_id: int
):
    try:
        domain = userRepo.getDomain(proj_id)
        if domain is None:
            raise HTTPException(status_code=404, detail="Project not found")
        if domain.user_id != currentUser.id:
            raise HTTPException(status_code=403, detail="You do not have permission to edit this project")
        userRepo.deleteDomain(domain)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/user/scan")
def getScans(
    scanRepo: scan_repo,
    currentUser: Annotated[User, Depends(get_current_user)],
    params: PageParams,
):
    try:
        return scanRepo.getScansByUser(currentUser.id, params)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/user/proj")
def getProjects(currentUser: Annotated[User, Depends(get_current_user)]):
    try:
        return currentUser.domains
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/proj/scans")
def getProjectScans(
    id: int, _: Annotated[str, Depends(oauth2_scheme)], scanRepo: scan_repo
):
    try:
        return scanRepo.getScansByDomain(id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/proj/{id}/last-scan")
def getLastScan(id: int, _: Annotated[str, Depends(oauth2_scheme)], userRepo: user_repo):
    try:
        dom = userRepo.getDomain(id)
        lastScan = dom.scans[len(dom.scans) - 1]
        print(lastScan.date)
        return lastScan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/proj/risk-metrics")
def getProjectRiskMetrics(
    id: int, _: Annotated[str, Depends(oauth2_scheme)], scanRepo: scan_repo
):
    try:
        return scanRepo.getRiskMetricsByProject(id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/scan/active")
def activeScan(
    payload: ScanRequest,
    background: BackgroundTasks,
    scanClient: scan_client,
    current_user: Annotated[User, Depends(get_current_user)],
    useAjax: bool = False,
    verbose: bool = True,
):
    try:
        scanClient.clearAlerts()
        scanClient.active_scan = {
            "zap_scan_id": None,
            "status": "spidering",
            "url": payload.url,
            "user": current_user,
            "project_title": payload.project_title,
            "project_description": payload.project_description,
            "verbose": verbose,
            "scan_type": "active",
        }
        background.add_task(scanClient.ascan, payload.url, useAjax)
        return {"status": "spidering"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/scan/passive")
def passiveScan(
    payload: ScanRequest,
    background: BackgroundTasks,
    scanClient: scan_client,
    current_user: Annotated[User, Depends(get_current_user)],
    useAjax: bool = False,
    verbose: bool = True,
):
    try:
        scanClient.clearAlerts()
        scanClient.active_scan = {
            "zap_scan_id": None,
            "status": "spidering",
            "url": payload.url,
            "user": current_user,
            "project_title": payload.project_title,
            "project_description": payload.project_description,
            "verbose": verbose,
            "scan_type": "passive",
        }
        background.add_task(scanClient.pscan, payload.url, useAjax)
        return {"status": "spidering"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/scan/status")
def activeScanStatus(scanClient: scan_client):
    try:
        if scanClient.active_scan is None:
            if scanClient.last_scan_id is not None:
                return {"running": False, "status": "done", "scan_id": scanClient.last_scan_id}
            return {"running": False, "status": "idle"}
        active = scanClient.active_scan
        if active["status"] == "spidering":
            return {"running": True, "status": "spidering", "url": active["url"]}
        if active["status"] == "error":
            scanClient.active_scan = None
            return {"running": False, "status": "error"}
        if active.get("scan_type") == "passive":
            # Spider completed; passive alerts are already collected
            scanClient.active_scan = None
            return {"running": False, "status": "done", "zap_scan_id": "passive", "progress": 100, "url": active["url"]}
        progress = int(scanClient.zap.ascan.status(active["zap_scan_id"]))
        return {
            "running": progress < 100,
            "status": "scanning" if progress < 100 else "done",
            "zap_scan_id": active["zap_scan_id"],
            "progress": progress,
            "url": active["url"],
        }
    except Exception:
        scanClient.active_scan = None
        return {"running": False, "status": "error"}


@app.get("/scan/stream")
def streamActiveScan(
    zap_scan_id: str,
    url: str,
    scanClient: scan_client,
    _: Annotated[User, Depends(get_current_user)],
):
    try:
        def generateSSE():
            try:
                for output in scanClient.stream_alerts(zap_scan_id, url):
                    if "alert" in output:
                        yield f"data: {json.dumps({'type': 'alert', 'alert': output['alert']})}\n\n"
                    elif "progress" in output:
                        yield f"data: {json.dumps({'type': 'progress', 'progress': output['progress']})}\n\n"
                    elif "total" in output:
                        yield f"data: {json.dumps({'type': 'done', 'total': output['total']})}\n\n"
            except RuntimeError as e:
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

        return StreamingResponse(
            generateSSE(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/scan/alerts/counts")
def alertCounts(
    url: str,
    scanClient: scan_client,
    _: Annotated[User, Depends(get_current_user)],
):
    try:
        return scanClient.getAlertCountsByRisk(url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/scan/active/clear")
def clearAlerts(scanClient: scan_client):
    try:
        scanClient.clearAlerts()
        return {"message": "active scan alerts cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/scan/stop")
def stopScan(scanClient: scan_client):
    try:
        scanClient.stop()
        return {"message": "scan stopped"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/scan/{scan_id}")
def getScanDetail(
    scan_id: int,
    scanRepo: scan_repo,
    current_user: Annotated[User, Depends(get_current_user)],
):
    from .db.models import ScanSummary
    scan = scanRepo.searchByScanID(scan_id)
    if scan is None:
        raise HTTPException(status_code=404, detail="Scan not found")
    if scan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return ScanSummary.model_validate(scan)


@app.get("/scan/{scan_id}/alerts")
def getScanAlerts(
    scan_id: int,
    scanRepo: scan_repo,
    current_user: Annotated[User, Depends(get_current_user)],
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    risk: str = "",
):
    scan = scanRepo.searchByScanID(scan_id)
    if scan is None:
        raise HTTPException(status_code=404, detail="Scan not found")
    if scan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    alerts: list = scan.scan_log if isinstance(scan.scan_log, list) else []
    if risk:
        alerts = [a for a in alerts if a.get("risk", "") == risk]

    total = len(alerts)
    start = (page - 1) * size
    return {"total": total, "page": page, "size": size, "result": alerts[start: start + size]}


@app.post("/ai/sum")
def alertsSummary(scanClient: scan_client, request: SumRequest, summaryRepo: ai_summary_repo):
    # tracker = EmissionsTracker()
    # tracker.start()

    try:
        alerts = scanClient.ascanResults(url=request.url)
        formatted = scanClient.ascanFormatAI(alerts)

        if formatted is None:

            def no_results():
                msg = {
                    "type": "token",
                    "content": "No vulnerabilities were found for the provided URL.",
                }
                yield f"data: {json.dumps(msg)}\n\n"
                yield f"data: {json.dumps({'type': 'done'})}\n\n"

            return StreamingResponse(
                no_results(),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
            )

        if request.summary_type == SummaryType.technical:
            system_prompt = TECHNICAL_SUMMARISER_AGENT_PROMPT
        else:
            system_prompt = NON_TECHNICAL_SUMMARISER_AGENT_PROMPT

        scan_id = request.scan_id
        summary_type_str = request.summary_type.value

        def generate_sse():
            collected_tokens: list[str] = []
            try:
                for token in stream_llm(
                    f"{formatted}, OUTPUT IN MARKDOWN FORMAT", system=system_prompt
                ):
                    collected_tokens.append(token)
                    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
                yield f"data: {json.dumps({'type': 'done'})}\n\n"

                if scan_id is not None:
                    full_content = "".join(collected_tokens)
                    summaryRepo.save_summary(scan_id, summary_type_str, full_content)
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

        return StreamingResponse(
            generate_sse(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ai/summary")
def getSavedSummary(
    scan_id: int,
    summary_type: SummaryType,
    summaryRepo: ai_summary_repo,
    _: Annotated[User, Depends(get_current_user)],
):
    summary = summaryRepo.get_summary(scan_id, summary_type.value)
    if summary is None:
        raise HTTPException(status_code=404, detail="No saved summary found for this scan")
    return {
        "scan_id": summary.scan_id,
        "summary_type": summary.summary_type,
        "content": summary.content,
        "created_at": summary.created_at.isoformat(),
    }


class StoreSummaryRequest(BaseModel):
    scan_id: int
    summary_type: SummaryType
    content: str


@app.post("/ai/summary")
def storeSummary(
    request: StoreSummaryRequest,
    summaryRepo: ai_summary_repo,
    _: Annotated[User, Depends(get_current_user)],
):
    summary = summaryRepo.save_summary(request.scan_id, request.summary_type.value, request.content)
    return {
        "scan_id": summary.scan_id,
        "summary_type": summary.summary_type,
        "content": summary.content,
        "created_at": summary.created_at.isoformat(),
    }


@app.post("/ai/chat")
def aiChat(scanClient: scan_client, request: ChatRequest):
    try:
        alerts = scanClient.ascanResults(url=request.url)
        formatted = scanClient.ascanFormatAI(alerts)

        scan_context = (
            formatted
            if formatted
            else "No vulnerabilities were found for the provided URL."
        )

        ollama_messages = [
            {
                "role": "user",
                "content": f"Here are the scan results for {request.url}:\n\n{scan_context}",
            },
            {
                "role": "assistant",
                "content": "I have the scan results. What would you like to know?",
            },
        ]
        for msg in request.messages:
            ollama_messages.append({"role": msg.role, "content": msg.content})

        def generate_sse():
            try:
                for token in stream_chat_llm(ollama_messages, system=CHAT_AGENT_PROMPT):
                    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
                yield f"data: {json.dumps({'type': 'done'})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

        return StreamingResponse(
            generate_sse(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/script/upload")
def uploadScript(scanClient: scan_client, script: ScriptUpload):
    scanClient.uploadZAPScript(
        script.script_name,
        script.script_type,
        script.script_engine,
        script.file_name,
    )
