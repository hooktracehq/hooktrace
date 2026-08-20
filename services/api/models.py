from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import JSON

import uuid

from .database import Base


# ============================================================
# USER
# ============================================================


class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )

    email = Column(
        Text,
        unique=True,
        nullable=False,
    )

    api_key = Column(
        Text,
        unique=True,
        nullable=False,
    )

    password_hash = Column(Text)

    provider = Column(
        Text,
        default="local",
    )

    provider_id = Column(Text)

    avatar_url = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # --------------------------------------------------------
    # Relationships
    # --------------------------------------------------------

    routes = relationship(
        "WebhookRoute",
        back_populates="user",
    )

    replay_jobs = relationship(
        "ReplayJob",
        back_populates="user",
    )


# ============================================================
# WEBHOOK ROUTE
# ============================================================


class WebhookRoute(Base):
    __tablename__ = "webhook_routes"

    id = Column(
        Integer,
        primary_key=True,
    )

    token = Column(
        String,
        nullable=False,
    )

    route = Column(
        String,
        nullable=False,
    )

    secret = Column(String)

    mode = Column(
        String,
        default="dev",
    )

    # Legacy / route-level targets.
    # These are kept because they already exist in the
    # current database and older routes may still use them.
    dev_target = Column(String)

    prod_target = Column(String)

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # --------------------------------------------------------
    # Relationships
    # --------------------------------------------------------

    user = relationship(
        "User",
        back_populates="routes",
    )

    events = relationship(
        "WebhookEvent",
        back_populates="route",
    )

    # New route -> many delivery targets relationship.
    delivery_target_links = relationship(
        "RouteDeliveryTarget",
        back_populates="route",
        cascade="all, delete-orphan",
    )


# ============================================================
# WEBHOOK EVENT
# ============================================================


class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(
        Integer,
        primary_key=True,
    )

    route_id = Column(
        Integer,
        ForeignKey("webhook_routes.id"),
    )

    headers = Column(JSON)

    payload = Column(JSON)

    status = Column(
        String,
        default="pending",
    )

    idempotency_key = Column(String)

    attempt_count = Column(
        Integer,
        default=0,
    )

    max_retries = Column(
        Integer,
        default=5,
    )

    retry_count = Column(
        Integer,
        default=0,
    )

    last_error = Column(Text)

    next_retry_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    provider = Column(String)

    event_type = Column(String)

    delivery_duration = Column(
        Integer,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # --------------------------------------------------------
    # Relationships
    # --------------------------------------------------------

    route = relationship(
        "WebhookRoute",
        back_populates="events",
    )


# ============================================================
# REPLAY JOB
# ============================================================


class ReplayJob(Base):
    __tablename__ = "replay_jobs"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    status = Column(
        String,
        nullable=False,
        default="queued",
    )

    total_events = Column(
        Integer,
        default=0,
    )

    completed_events = Column(
        Integer,
        default=0,
    )

    failed_events = Column(
        Integer,
        default=0,
    )

    parallelism = Column(
        Integer,
        default=5,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    started_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    finished_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    # --------------------------------------------------------
    # Relationships
    # --------------------------------------------------------

    user = relationship(
        "User",
        back_populates="replay_jobs",
    )

    events = relationship(
        "ReplayJobEvent",
        back_populates="job",
        cascade="all, delete-orphan",
    )


# ============================================================
# REPLAY JOB EVENT
# ============================================================


class ReplayJobEvent(Base):
    __tablename__ = "replay_job_events"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    replay_job_id = Column(
        UUID(as_uuid=True),
        ForeignKey("replay_jobs.id"),
        nullable=False,
    )

    event_id = Column(
        Integer,
        ForeignKey("webhook_events.id"),
        nullable=False,
    )

    status = Column(
        String,
        nullable=False,
        default="queued",
    )

    attempt = Column(
        Integer,
        default=0,
    )

    started_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    finished_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    error = Column(
        Text,
        nullable=True,
    )

    # --------------------------------------------------------
    # Relationships
    # --------------------------------------------------------

    job = relationship(
        "ReplayJob",
        back_populates="events",
    )

    event = relationship(
        "WebhookEvent",
    )


# ============================================================
# USAGE METRIC
# ============================================================


class UsageMetric(Base):
    __tablename__ = "usage_metrics"

    id = Column(
        Integer,
        primary_key=True,
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    event_id = Column(
        Integer,
        ForeignKey("webhook_events.id"),
        nullable=False,
        unique=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


# ============================================================
# DELIVERY TARGET
# ============================================================


class DeliveryTarget(Base):
    __tablename__ = "delivery_targets"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    name = Column(
        String,
        nullable=False,
    )

    type = Column(
        String,
        nullable=False,
    )

    config = Column(
        JSON,
        nullable=False,
        default=dict,
    )

    enabled = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    providers = Column(
        JSON,
        nullable=True,
        default=list,
    )

    success_count = Column(
        Integer,
        default=0,
        nullable=False,
    )

    error_count = Column(
        Integer,
        default=0,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    last_used = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    # --------------------------------------------------------
    # Relationships
    # --------------------------------------------------------

    route_links = relationship(
        "RouteDeliveryTarget",
        back_populates="target",
        cascade="all, delete-orphan",
    )


# ============================================================
# ROUTE <-> DELIVERY TARGET
# ============================================================


class RouteDeliveryTarget(Base):
    __tablename__ = "route_delivery_targets"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    route_id = Column(
        Integer,
        ForeignKey(
            "webhook_routes.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    target_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "delivery_targets.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    enabled = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # --------------------------------------------------------
    # Relationships
    # --------------------------------------------------------

    route = relationship(
        "WebhookRoute",
        back_populates="delivery_target_links",
    )

    target = relationship(
        "DeliveryTarget",
        back_populates="route_links",
    )