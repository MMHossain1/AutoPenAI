import datetime
import json
import math
import time
import os
import urllib.parse
from dotenv import load_dotenv

from zapv2 import ZAPv2

# from codecarbon import EmissionsTracker

# from ..db.models import User
from ..db.models import Scan, User
from ..db.repos import ScanRepo
from ..AI.llm import compute_risk_level

load_dotenv()


_RISK_ORDER = {"Informational": 0, "Low": 1, "Medium": 2, "High": 3}
_CONFIDENCE_ORDER = {"Low": 1, "Medium": 2, "High": 3, "Confirmed": 4}

# Exponentially increasing weights ensure high-severity findings dominate the score.
# Informational alerts are excluded (weight 0) since they represent noise, not risk.
_SEVERITY_WEIGHTS = {"Informational": 0.0, "Low": 1.0, "Medium": 5.0, "High": 25.0}


def compute_risk_metrics(alerts: list) -> dict:
    counts = {"High": 0, "Medium": 0, "Low": 0, "Informational": 0}
    confidence_totals = {"High": 0, "Medium": 0, "Low": 0, "Informational": 0}
    critical_count = 0

    for alert in alerts:
        risk = alert.get("risk", "Informational")
        r = _RISK_ORDER.get(risk, 0)
        c = _CONFIDENCE_ORDER.get(alert.get("confidence"), 1)
        counts[risk] += 1
        confidence_totals[risk] += c
        if r == 3 and c >= 3:
            critical_count += 1

    # Log-dampen each severity bucket's count so that many low-severity alerts
    # cannot inflate the score past what a handful of high-severity alerts would produce.
    # avg_conf captures quality (confidence) without letting quantity run away.
    total_score = 0.0
    for risk_level, weight in _SEVERITY_WEIGHTS.items():
        count = counts[risk_level]
        if count > 0:
            avg_conf = confidence_totals[risk_level] / count
            total_score += weight * math.log1p(count) * avg_conf

    # Normalise to 0-100. The raw formula is unbounded, so cap at 100.
    # Thresholds below (75/50/25) are calibrated against the raw scale.
    total_score = min(round(total_score, 2), 100.0)

    if total_score > 75:
        level = "Critical"
    elif total_score > 50:
        level = "High"
    elif total_score > 25:
        level = "Medium"
    else:
        level = "Low"

    return {
        "total_risk_score": total_score,
        "overall_risk_level": level,
        "critical_alert_count": critical_count,
        "high_risk_count": counts["High"],
        "medium_risk_count": counts["Medium"],
        "low_risk_count": counts["Low"],
    }


def ensure_scheme(url: str) -> str:
    """Prepend https:// if the URL has no scheme, so ZAP can accept it."""
    parsed = urllib.parse.urlparse(url)
    if not parsed.scheme:
        url = "https://" + url
    return url


def rewrite_docker_localhost(url: str) -> str:
    # Only translate localhost if we are actually running inside a Docker container
    if not os.path.exists('/.dockerenv'):
        return url

    try:
        parsed = urllib.parse.urlparse(url)
        if parsed.hostname in ("localhost", "127.0.0.1", "0.0.0.0"):
            return url.replace(parsed.hostname, "host.docker.internal", 1)
    except Exception:
        pass
    return url


class ScanClient:
    def __init__(
        self,
        scanRepo: ScanRepo | None = None,
        zap_apiKey: str = os.getenv("ZAP_API_KEY"),
    ):
        self.scanRepo = scanRepo
        self.zap_apiKey = zap_apiKey
        zap_base = os.getenv("ZAP_BASE_URL", "http://localhost:8080")
        self.zap = ZAPv2(
            apikey=zap_apiKey,
            proxies={"http": zap_base, "https": zap_base},
        )
        self.active_scan: dict | None = None
        self.last_scan_id: int | None = None

    """
    Start ZAP spider scan on the target URL.
    """
    def spider(self, url: str, ajax: bool = False):
        url = rewrite_docker_localhost(url)
        # Seed the URL into ZAP's sites tree so the active scan can find it,
        # even if the spider finds no additional links.
        self.zap.core.access_url(url, followredirects='true')
        if (ajax):
            self.zap.ajaxSpider.scan(url)
            while self.zap.ajaxSpider.status == "running":
                time.sleep(2)
        else:
            scanID = self.zap.spider.scan(url)
            if not str(scanID).isdigit():
                raise RuntimeError(f"ZAP failed to start spider: '{scanID}'")
            while int(self.zap.spider.status(scanID)) < 100:
                time.sleep(1)

    """
    Start ZAP passive scan (spider only) on the target URL.
    ZAP's passive scanner runs automatically as the spider crawls, collecting alerts
    without sending any active probes to the target.
    """
    def pscan(self, url: str, useAJAX: bool = False):
        url = ensure_scheme(url)
        url = rewrite_docker_localhost(url)
        try:
            self.spider(url, useAJAX)
            if self.active_scan is not None:
                self.active_scan["zap_scan_id"] = "passive"
                self.active_scan["status"] = "done"
                active = self.active_scan
                scan = self.buildScan(active["url"], active.get("verbose", True), "passive")
                self.storeScan(scan, active["user"], active.get("project_title"), active.get("project_description"))
        except Exception:
            if self.active_scan is not None:
                self.active_scan["status"] = "error"
            raise

    """
    Start ZAP active scan on the target URL.

    """
    def ascan(self, url: str, useAJAX: bool = False):
        # tracker = EmissionsTracker()
        # tracker.start()
        url = ensure_scheme(url)
        url = rewrite_docker_localhost(url)
        try:
            self.spider(url, useAJAX)
            self.zap.ascan.set_option_delay_in_ms(100)
            self.zap.ascan.set_option_thread_per_host(3)
            scan_id = self.zap.ascan.scan(url)
            if not str(scan_id).isdigit():
                raise RuntimeError(f"ZAP failed to start active scan: '{scan_id}'")
            if self.active_scan is not None:
                self.active_scan["zap_scan_id"] = scan_id
                self.active_scan["status"] = "scanning"

            while int(self.zap.ascan.status(scan_id)) < 100:
                if self.active_scan is None or self.active_scan.get("status") == "stopped":
                    self.active_scan = None
                    return
                time.sleep(3)

            if self.active_scan is not None:
                active = self.active_scan
                scan = self.buildScan(active["url"], active.get("verbose", True), active.get("scan_type", "active"))
                self.storeScan(scan, active["user"], active.get("project_title"), active.get("project_description"))
                self.last_scan_id = scan.scanid
                self.active_scan = None
        except Exception:
            if self.active_scan is not None:
                self.active_scan["status"] = "error"
            raise
        # finally:
        #     emissions = tracker.stop()
        #     print(f"CodeCarbon active scan emissions: {emissions} kg CO2eq")

    """
    Starts an active scan on target URL.

    Returns:
        generator generating progress and alert data
    """
    def stream_alerts(self, scanId: str, url: str):
        url = ensure_scheme(url)
        url = rewrite_docker_localhost(url)

        if scanId == "passive":
            # Passive scan: spider already completed, stream all collected alerts at once
            alerts = self.zap.core.alerts(baseurl=url)
            for alert in alerts:
                yield {"alert": alert}
            yield {"total": len(alerts)}
            return

        if not str(scanId).isdigit():
            raise RuntimeError(f"ZAP failed to start active scan: '{scanId}'")

        sent_count = 0
        page_size = 20

        while int(self.zap.ascan.status(scanId)) < 100:
            progress = self.zap.ascan.status(scanId)
            yield {"progress": progress}

            new_alerts = self.zap.core.alerts(
                baseurl=url, start=sent_count, count=page_size
            )
            for alert in new_alerts:
                yield {"alert": alert}
                sent_count += 1

            time.sleep(2)

        while True:
            new_alerts = self.zap.core.alerts(
                baseurl=url, start=sent_count, count=page_size
            )
            if not new_alerts:
                break
            for alert in new_alerts:
                yield {"alert": alert}
                sent_count += 1

        print("Active Scan completed")
        yield {"total": sent_count}

    """
    Retrieves alerts from the ZAP active scan, filtering by minimum risk and confidence level

    :param risk_level: "Informational, Low, Medium, High" or 0,1,2,3
    :param confidence_level: "Low, Medium, High" or 1,2,3

    Returns:
        All alerts with risk >= risk_level and confidence >= confidence_level
    """

    def ascanResults(
        self, url: str, risk_level="Low", confidence_level="Low", verbose: bool = False
    ):
        url = ensure_scheme(url)
        url = rewrite_docker_localhost(url)
        order = {"Informational": 0, "Low": 1, "Medium": 2, "High": 3}
        alerts = self.zap.core.alerts(baseurl=url)
        output = []

        # Input validation
        if type(risk_level) is int and type(confidence_level) is int:
            if (
                risk_level > 3
                or risk_level < 0
                or confidence_level > 3
                or confidence_level < 1
            ):
                raise ValueError("risk/confidence level must be 0-3")
            else:
                risk_value = risk_level
                confidence_value = confidence_level
        elif order.get(risk_level) is None or order.get(confidence_level) is None:
            raise ValueError(
                "risk/confidence level must be 'Informational', 'Low', 'Medium', or 'High'"
            )
        else:
            risk_value = order.get(risk_level)
            confidence_value = order.get(confidence_level)

        # Filtering
        if not verbose:
            keys_to_include = {"name", "risk", "description", "nodeName"}
            for alert in alerts:
                if (order.get(alert.get("risk")) >= risk_value) and (
                    order.get(alert.get("confidence")) >= confidence_value
                ):
                    formatted_alert = {
                        key: alert.get(key, "") for key in keys_to_include
                    }
                    output.append(formatted_alert)

        elif verbose:
            for alert in alerts:
                if (order.get(alert.get("risk")) >= risk_value) and (
                    order.get(alert.get("confidence")) >= confidence_value
                ):
                    output.append(alert)
        return output

    """
    Retrieves alerts from the ZAP active scan, filtering by minimum risk and confidence level

    :param risk_level: "Informational, Low, Medium, High" or 0,1,2,3
    :param confidence_level: "Low, Medium, High" or 1,2,3

    Returns:
        All alerts with risk >= risk_level and confidence >= confidence_level in JSON format
    """

    def ascanResultsJSON(
        self, url: str, risk_level="Low", confidence_level="Low", verbose: bool = False
    ):
        return json.dumps(self.ascanResults(url, risk_level, confidence_level, verbose))

    """
    Given a list of alerts, retains only name, risk, etc. info

    :param alertList: use ascanResults

    Returns:
        A list of alerts (each a dictionary) with name,
        risk, description, nodeName and id information
    """

    def ascanFormatAI(self, alertList):
        if not isinstance(alertList, list) or len(alertList) == 0:
            return None

        output = []
        keys_to_include = {"name", "risk", "description", "nodeName", "id"}

        for alert in alertList:
            formatted_alert = {key: alert.get(key, "") for key in keys_to_include}
            output.append(formatted_alert)

        return json.dumps(output)

    def getAlertCountsByRisk(self, url: str) -> dict:
        url = ensure_scheme(url)
        url = rewrite_docker_localhost(url)
        counts = {"High": 0, "Medium": 0, "Low": 0, "Informational": 0}
        for alert in self.zap.core.alerts(baseurl=url):
            risk = alert.get("risk", "Informational")
            if risk in counts:
                counts[risk] += 1
        return counts

    def clearAlerts(self):
        self.zap.core.delete_all_alerts()

    def stop(self):
        if self.active_scan is not None:
            self.active_scan["status"] = "stopped"
        self.zap.spider.stop_all_scans()
        self.zap.ajaxSpider.stop()
        self.zap.ascan.stop_all_scans()

    def buildScan(self, url: str, verbose: bool = False, scan_type: str = "active") -> Scan:
        alerts = self.ascanResults(url=url, risk_level="Low", confidence_level="Low", verbose=verbose)
        heuristic = compute_risk_metrics(alerts)
        slim_alerts = [
            {"name": a.get("name", ""), "risk": a.get("risk", ""), "confidence": a.get("confidence", "")}
            for a in alerts
        ]
        try:
            ai_metrics = compute_risk_level(json.dumps(slim_alerts))
        except Exception as e:
            print(f"AI risk scoring failed, falling back to heuristic: {e}")
            ai_metrics = {
                "total_risk_score": heuristic["total_risk_score"],
                "overall_risk_level": heuristic["overall_risk_level"],
            }
        metrics = {**heuristic, **ai_metrics}
        return Scan(
            date=datetime.datetime.now(datetime.timezone.utc),
            scan_log=alerts,
            target_url=url,
            scan_type=scan_type,
            **metrics,
        )

    def storeScan(
            self,
            scan: Scan,
            user: User,
            project_title: str | None = None,
            project_description: str | None = None):
        self.scanRepo.saveScan(scan, user, project_title, project_description)
        return scan

    def uploadZAPScript(
        self,
        script_name: str,
        script_type: str,
        script_engine: str,
        file_name: str,
    ):
        self.zap.script.load(script_name, script_type, script_engine, file_name)
