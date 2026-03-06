from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import JSON
import uuid

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    email = Column(Text, unique=True, nullable=False)
    api_key = Column(Text, unique=True, nullable=False)

    password_hash = Column(Text)
    provider = Column(Text, default="local")
    provider_id = Column(Text)
    avatar_url = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    routes = relationship("WebhookRoute", back_populates="user")


class WebhookRoute(Base):
    __tablename__ = "webhook_routes"

    id = Column(Integer, primary_key=True)
    token = Column(String, nullable=False)
    route = Column(String, nullable=False)

    secret = Column(String)
    mode = Column(String, default="dev")

    dev_target = Column(String)
    prod_target = Column(String)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="routes")
    events = relationship("WebhookEvent", back_populates="route")


class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(Integer, primary_key=True)
    route_id = Column(Integer, ForeignKey("webhook_routes.id"))

    headers = Column(JSON)
    payload = Column(JSON)

    status = Column(String, default="pending")
    idempotency_key = Column(String)


    attempt_count = Column(Integer, default=0)       
    max_retries = Column(Integer, default=5)         
    last_error = Column(Text)
    next_retry_at = Column(DateTime(timezone=True), nullable=True)  
    retry_count = Column(Integer, default=0) 

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    route = relationship("WebhookRoute", back_populates="events")