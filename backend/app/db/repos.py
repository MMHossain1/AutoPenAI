from .models import User, ScanHistory, Domain, AISummary, PagedResponse, PageParams, ScanSummary
from sqlalchemy.orm import Session
from sqlalchemy import select, func


class UserRepo:

    def __init__(self, session: Session):
        self.session = session

    def saveUser(self, user: User):
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def searchByUsername(self, username: str):
        query = select(User).where(User.username == username)
        return self.session.scalar(query)

    def saveDomain(self, domain: Domain) -> Domain:
        self.session.add(domain)
        self.session.commit()
        self.session.refresh(domain)
        return domain

    def getDomain(self, domain_id: int) -> Domain | None:
        return self.session.get(Domain, domain_id)

    def updateDomain(self, domain: Domain, title: str, description: str | None) -> Domain:
        domain.title = title
        domain.description = description
        self.session.commit()
        self.session.refresh(domain)
        return domain

    def deleteDomain(self, domain: Domain):
        self.session.delete(domain)
        self.session.commit()


class ScanRepo:

    def __init__(self, session: Session):
        self.session = session

    def saveScan(
            self,
            scan: ScanHistory,
            user: User,
            project_title: str | None = None,
            project_description: str | None = None):
        domain = self.session.scalar(
            select(Domain).where(Domain.domain == scan.target_url, Domain.user_id == user.id)
        )
        if domain is None:
            domain = Domain(
                domain=scan.target_url,
                title=project_title or scan.target_url,
                description=project_description,
                user_id=user.id,
            )
            self.session.add(domain)
            self.session.flush()
        scan.domain_id = domain.domain_id
        scan.user_id = user.id
        self.session.add(scan)
        self.session.commit()
        self.session.refresh(scan)
        return scan

    def searchByScanID(self, scanID: int):
        return self.session.get(ScanHistory, scanID)

    def getScansByDomain(self, domain_id: int):
        domain = self.session.get(Domain, domain_id)
        if domain is None:
            return []
        return domain.scans

    def getRiskMetricsByProject(self, domain_id: int) -> list:
        rows = self.session.execute(
            select(ScanHistory.date, ScanHistory.total_risk_score, ScanHistory.overall_risk_level)
            .where(ScanHistory.domain_id == domain_id)
            .order_by(ScanHistory.date)
        ).all()
        return [
            {"date": row.date, "risk_score": row.total_risk_score, "risk_label": row.overall_risk_level}
            for row in rows
        ]

    def getScansByUser(self, user_id: int, pageParams: PageParams):
        query = select(ScanHistory.scanid,
                       ScanHistory.date,
                       ScanHistory.target_url,
                       ScanHistory.user_id,
                       ScanHistory.scan_type,
                       ScanHistory.total_risk_score,
                       ScanHistory.overall_risk_level,
                       ScanHistory.critical_alert_count,
                       ScanHistory.high_risk_count,
                       ScanHistory.medium_risk_count,
                       ScanHistory.low_risk_count
                       ).where(ScanHistory.user_id == user_id).order_by(ScanHistory.date.desc())
        total = self.session.scalar(select(func.count()).select_from(query.subquery()))
        rows = self.session.execute(
            query.offset((pageParams.page - 1) * pageParams.size).limit(pageParams.size)
        ).all()

        return PagedResponse(
            total=total,
            page=pageParams.page,
            size=pageParams.size,
            result=[ScanSummary.model_validate(row._asdict()) for row in rows]
        )


class AISummaryRepo:

    def __init__(self, session: Session):
        self.session = session

    def get_summary(self, scan_id: int, summary_type: str) -> AISummary | None:
        query = select(AISummary).where(
            AISummary.scan_id == scan_id,
            AISummary.summary_type == summary_type,
        )
        return self.session.scalar(query)

    def save_summary(self, scan_id: int, summary_type: str, content: str) -> AISummary:
        existing = self.get_summary(scan_id, summary_type)
        if existing is not None:
            existing.content = content
            self.session.commit()
            self.session.refresh(existing)
            return existing
        summary = AISummary(
            scan_id=scan_id,
            summary_type=summary_type,
            content=content,
        )
        self.session.add(summary)
        self.session.commit()
        self.session.refresh(summary)
        return summary
