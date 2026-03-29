# api/delivery_targets.py
"""
Delivery Targets API - Connects frontend UI to backend delivery workers
"""

from datetime import datetime
from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text

from database import SessionLocal
from api.auth import get_current_user


router = APIRouter(prefix="/delivery-targets", tags=["delivery-targets"])


# -----------------------------
# Schemas
# -----------------------------

class DeliveryTargetConfig(BaseModel):
    """Dynamic config based on target type"""
    # HTTP
    url: Optional[str] = None
    method: Optional[str] = None
    headers: Optional[dict] = None
    timeout: Optional[int] = None
    
    # SQS
    queueUrl: Optional[str] = None
    region: Optional[str] = None
    accessKeyId: Optional[str] = None
    secretAccessKey: Optional[str] = None
    messageGroupId: Optional[str] = None
    
    # Kafka
    brokers: Optional[str] = None
    topic: Optional[str] = None
    clientId: Optional[str] = None
    saslMechanism: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    
    # RabbitMQ
    host: Optional[str] = None
    exchange: Optional[str] = None
    routingKey: Optional[str] = None
    
    # Redis
    redisUrl: Optional[str] = None
    channel: Optional[str] = None
    
    # gRPC
    grpcUrl: Optional[str] = None
    service: Optional[str] = None
    
    # Custom Webhook
    secret: Optional[str] = None
    transform: Optional[str] = None
    retries: Optional[int] = None
    
    # Email
    recipients: Optional[str] = None
    subject: Optional[str] = None
    includePayload: Optional[bool] = None
    
    # Slack
    webhookUrl: Optional[str] = None
    channel: Optional[str] = None
    mentionOnError: Optional[str] = None


class CreateDeliveryTargetRequest(BaseModel):
    name: str
    type: str  # http, sqs, kafka, rabbitmq, redis, grpc, webhook, email, slack
    config: DeliveryTargetConfig
    providers: List[str] = []  # Which providers to route (empty = all)


class UpdateDeliveryTargetRequest(BaseModel):
    name: Optional[str] = None
    config: Optional[DeliveryTargetConfig] = None
    enabled: Optional[bool] = None
    providers: Optional[List[str]] = None


class DeliveryTargetResponse(BaseModel):
    id: str
    name: str
    type: str
    config: dict
    enabled: bool
    created_at: str
    last_used: Optional[str]
    success_count: int
    error_count: int
    providers: List[str]


# -----------------------------
# Database Setup (Run this once)
# -----------------------------

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS delivery_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    config JSONB NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    providers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_delivery_targets_user_id ON delivery_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_targets_enabled ON delivery_targets(enabled);
"""


# -----------------------------
# Endpoints
# -----------------------------

@router.get("")
def list_delivery_targets(user_id: str = Depends(get_current_user)):
    """List all delivery targets for the current user"""
    db = SessionLocal()
    try:
        targets = db.execute(
            text("""
                SELECT 
                    id, name, type, config, enabled, 
                    created_at, last_used, success_count, 
                    error_count, providers
                FROM delivery_targets
                WHERE user_id = :user_id
                ORDER BY created_at DESC
            """),
            {"user_id": user_id}
        ).fetchall()

        return {
            "items": [
                {
                    "id": str(row[0]),
                    "name": row[1],
                    "type": row[2],
                    "config": row[3],
                    "enabled": row[4],
                    "createdAt": row[5].isoformat() if row[5] else None,
                    "lastUsed": row[6].isoformat() if row[6] else None,
                    "successCount": row[7],
                    "errorCount": row[8],
                    "providers": row[9] if row[9] else [],
                }
                for row in targets
            ]
        }
    finally:
        db.close()


@router.post("")
def create_delivery_target(
    request: CreateDeliveryTargetRequest,
    user_id: str = Depends(get_current_user)
):
    """Create a new delivery target"""
    db = SessionLocal()
    try:
        target_id = str(uuid.uuid4())

        db.execute(
            text("""
                INSERT INTO delivery_targets 
                (id, user_id, name, type, config, providers)
                VALUES (:id, :user_id, :name, :type, :config, :providers)
            """),
            {
                "id": target_id,
                "user_id": user_id,
                "name": request.name,
                "type": request.type,
                "config": request.config.dict(exclude_none=True),
                "providers": request.providers,
            }
        )
        db.commit()

        return {
            "id": target_id,
            "name": request.name,
            "type": request.type,
            "config": request.config.dict(exclude_none=True),
            "enabled": True,
            "createdAt": datetime.utcnow().isoformat(),
            "lastUsed": None,
            "successCount": 0,
            "errorCount": 0,
            "providers": request.providers,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@router.get("/{target_id}")
def get_delivery_target(
    target_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get a specific delivery target"""
    db = SessionLocal()
    try:
        target = db.execute(
            text("""
                SELECT 
                    id, name, type, config, enabled,
                    created_at, last_used, success_count,
                    error_count, providers
                FROM delivery_targets
                WHERE id = :target_id AND user_id = :user_id
            """),
            {"target_id": target_id, "user_id": user_id}
        ).fetchone()

        if not target:
            raise HTTPException(status_code=404, detail="Target not found")

        return {
            "id": str(target[0]),
            "name": target[1],
            "type": target[2],
            "config": target[3],
            "enabled": target[4],
            "createdAt": target[5].isoformat() if target[5] else None,
            "lastUsed": target[6].isoformat() if target[6] else None,
            "successCount": target[7],
            "errorCount": target[8],
            "providers": target[9] if target[9] else [],
        }
    finally:
        db.close()


@router.patch("/{target_id}")
def update_delivery_target(
    target_id: str,
    request: UpdateDeliveryTargetRequest,
    user_id: str = Depends(get_current_user)
):
    """Update a delivery target"""
    db = SessionLocal()
    try:
        # Check if target exists
        existing = db.execute(
            text("SELECT id FROM delivery_targets WHERE id = :id AND user_id = :user_id"),
            {"id": target_id, "user_id": user_id}
        ).fetchone()

        if not existing:
            raise HTTPException(status_code=404, detail="Target not found")

        # Build update query dynamically
        updates = []
        params = {"id": target_id, "user_id": user_id}

        if request.name is not None:
            updates.append("name = :name")
            params["name"] = request.name

        if request.config is not None:
            updates.append("config = :config")
            params["config"] = request.config.dict(exclude_none=True)

        if request.enabled is not None:
            updates.append("enabled = :enabled")
            params["enabled"] = request.enabled

        if request.providers is not None:
            updates.append("providers = :providers")
            params["providers"] = request.providers

        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            
            query = f"""
                UPDATE delivery_targets
                SET {', '.join(updates)}
                WHERE id = :id AND user_id = :user_id
            """
            db.execute(text(query), params)
            db.commit()

        # Return updated target
        return get_delivery_target(target_id, user_id)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@router.delete("/{target_id}")
def delete_delivery_target(
    target_id: str,
    user_id: str = Depends(get_current_user)
):
    """Delete a delivery target"""
    db = SessionLocal()
    try:
        result = db.execute(
            text("""
                DELETE FROM delivery_targets
                WHERE id = :id AND user_id = :user_id
            """),
            {"id": target_id, "user_id": user_id}
        )
        db.commit()

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Target not found")

        return {"success": True}
    finally:
        db.close()


@router.post("/{target_id}/test")
def test_delivery_target(
    target_id: str,
    user_id: str = Depends(get_current_user)
):
    """Send a test webhook to this target"""
    db = SessionLocal()
    try:
        # Get target config
        target = db.execute(
            text("""
                SELECT type, config, enabled
                FROM delivery_targets
                WHERE id = :id AND user_id = :user_id
            """),
            {"id": target_id, "user_id": user_id}
        ).fetchone()

        if not target:
            raise HTTPException(status_code=404, detail="Target not found")

        if not target[2]:  # enabled
            raise HTTPException(status_code=400, detail="Target is disabled")

        target_type = target[0]
        config = target[1]

        # Create test payload
        test_payload = {
            "id": "test_" + str(uuid.uuid4()),
            "event": "test.webhook",
            "provider": "hooktrace",
            "timestamp": datetime.utcnow().isoformat(),
            "data": {
                "message": "This is a test webhook from HookTrace",
                "target_id": target_id,
            }
        }

        # Import and use your existing delivery workers
        try:
            if target_type == "http":
                from services.workers.delivery.http import deliver_http
                result = deliver_http(config, test_payload)
                
            elif target_type == "sqs":
                from services.workers.delivery.sqs import deliver_sqs
                result = deliver_sqs(config, test_payload)
                
            elif target_type == "kafka":
                from services.workers.delivery.kafka import deliver_kafka
                result = deliver_kafka(config, test_payload)
                
            elif target_type == "rabbitmq":
                from services.workers.delivery.rabbitmq import deliver_rabbitmq
                result = deliver_rabbitmq(config, test_payload)
                
            elif target_type == "redis":
                from services.workers.delivery.redis import deliver_redis
                result = deliver_redis(config, test_payload)
                
            elif target_type == "grpc":
                from services.workers.delivery.grpc import deliver_grpc
                result = deliver_grpc(config, test_payload)
                
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported target type: {target_type}")

            return {
                "success": True,
                "result": result,
                "message": "Test webhook sent successfully"
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Test webhook failed"
            }

    finally:
        db.close()


@router.get("/{target_id}/stats")
def get_target_stats(
    target_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get delivery statistics for a target"""
    db = SessionLocal()
    try:
        stats = db.execute(
            text("""
                SELECT 
                    success_count,
                    error_count,
                    last_used
                FROM delivery_targets
                WHERE id = :id AND user_id = :user_id
            """),
            {"id": target_id, "user_id": user_id}
        ).fetchone()

        if not stats:
            raise HTTPException(status_code=404, detail="Target not found")

        total = stats[0] + stats[1]
        success_rate = (stats[0] / total * 100) if total > 0 else 100

        return {
            "successCount": stats[0],
            "errorCount": stats[1],
            "totalCount": total,
            "successRate": round(success_rate, 2),
            "lastUsed": stats[2].isoformat() if stats[2] else None,
        }
    finally:
        db.close()