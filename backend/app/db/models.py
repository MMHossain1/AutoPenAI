from typing import Any, Generic, TypeVar, Annotated, List, Optional

from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy import String, Identity, ForeignKey, DateTime, Float, Integer, Text, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql.json import JSONB

from .database import Base

import datetime

from pydantic import BaseModel, Field


class PageParams(BaseModel):
    page: Annotated[int, Field(strict=True, ge=1)] = 1
    size: Annotated[int, Field(strict=True, ge=1, le=100)] = 10


T = TypeVar("T")


class PagedResponse(BaseModel, Generic[T]):
    total: int
    page: int
    size: int
    result: List[T]


class ScanSummary(BaseModel):
    scanid: int
    date: datetime.datetime
    target_url: str
    user_id: int
    scan_type: str = "active"
    total_risk_score: Optional[float] = None
    overall_risk_level: Optional[str] = None
    critical_alert_count: Optional[int] = None
    high_risk_count: Optional[int] = None
    medium_risk_count: Optional[int] = None
    low_risk_count: Optional[int] = None

    class Config:
        from_attributes = True


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Identity(), primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    domains: Mapped[list["Domain"]] = relationship(cascade="all, delete-orphan")
    scans: Mapped[list["ScanHistory"]] = relationship(cascade="all, delete-orphan")


class ScanHistory(Base):
    __tablename__ = "scan_history"
    scanid: Mapped[int] = mapped_column(Identity(), primary_key=True)
    date: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    scan_log: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    target_url: Mapped[str] = mapped_column(String, nullable=False)
    domain_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("domains.domain_id", ondelete="SET NULL"), nullable=True, index=True
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scan_type: Mapped[str] = mapped_column(String(10), nullable=False, server_default="active")
    total_risk_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    overall_risk_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    critical_alert_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    high_risk_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    medium_risk_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    low_risk_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


class Domain(Base):
    __tablename__ = "domains"
    domain_id: Mapped[int] = mapped_column(Identity(), primary_key=True)
    domain: Mapped[str] = mapped_column(String, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scans: Mapped[list["ScanHistory"]] = relationship(
        "ScanHistory",
        foreign_keys="[ScanHistory.domain_id]",
        cascade="save-update, merge, delete",
    )


class AISummary(Base):
    __tablename__ = "ai_summaries"
    __table_args__ = (
        UniqueConstraint("scan_id", "summary_type", name="uq_scan_summary_type"),
    )
    id: Mapped[int] = mapped_column(Identity(), primary_key=True)
    scan_id: Mapped[int] = mapped_column(
        ForeignKey("scan_history.scanid", ondelete="CASCADE"), nullable=False, index=True
    )
    summary_type: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


# Backward-compatible alias for existing imports/tests
Scan = ScanHistory
