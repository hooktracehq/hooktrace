
"""
Delivery Targets API - Connects frontend UI to backend delivery workers
"""

from datetime import datetime
from typing import List, Optional
import uuid
import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text

from .database import SessionLocal
from .auth import get_current_user
from services.worker.delivery_targets_router import route_webhook_to_targets

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
    type: str
    config: DeliveryTargetConfig
    providers: List[str] = []


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
# Database Setup (Run once)
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
    db = SessionLocal()
    try:
        targets = db.execute(
            text("""
                SELECT id, name, type, config, enabled,
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
                    "config": row[3] if isinstance(row[3], dict) else json.loads(row[3]),
                    "enabled": row[4],
                    "createdAt": row[5].isoformat() if row[5] else None,
                    "lastUsed": row[6].isoformat() if row[6] else None,
                    "successCount": row[7],
                    "errorCount": row[8],
                    "providers": row[9] if isinstance(row[9], list) else json.loads(row[9]),
                }
                for row in targets
            ]
        }
    finally:
        db.close()


@router.post("")
def create_delivery_target(request: CreateDeliveryTargetRequest, user_id: str = Depends(get_current_user)):
    db = SessionLocal()
    try:
        target_id = str(uuid.uuid4())

        db.execute(
            text("""
                INSERT INTO delivery_targets (id, user_id, name, type, config, providers)
                VALUES (:id, :user_id, :name, :type, :config, :providers)
            """),
            {
                "id": target_id,
                "user_id": user_id,
                "name": request.name,
                "type": request.type,
                "config": json.dumps(request.config.dict(exclude_none=True)),
                "providers": json.dumps(request.providers),
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
def get_delivery_target(target_id: str, user_id: str = Depends(get_current_user)):
    db = SessionLocal()
    try:
        target = db.execute(
            text("""
                SELECT id, name, type, config, enabled,
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
            "config": target[3] if isinstance(target[3], dict) else json.loads(target[3]),
            "enabled": target[4],
            "createdAt": target[5].isoformat() if target[5] else None,
            "lastUsed": target[6].isoformat() if target[6] else None,
            "successCount": target[7],
            "errorCount": target[8],
            "providers": target[9] if isinstance(target[9], list) else json.loads(target[9] or "[]"),
        }
    finally:
        db.close()


@router.patch("/{target_id}")
def update_delivery_target(
    target_id: str,
    request: UpdateDeliveryTargetRequest,
    user_id: str = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        existing = db.execute(
            text("SELECT id FROM delivery_targets WHERE id = :id AND user_id = :user_id"),
            {"id": target_id, "user_id": user_id}
        ).fetchone()

        if not existing:
            raise HTTPException(status_code=404, detail="Target not found")

        updates = []
        params = {"id": target_id, "user_id": user_id}

        if request.name is not None:
            updates.append("name = :name")
            params["name"] = request.name

        if request.config is not None:
            updates.append("config = :config")
            params["config"] = json.dumps(request.config.dict(exclude_none=True))

        if request.enabled is not None:
            updates.append("enabled = :enabled")
            params["enabled"] = request.enabled

        if request.providers is not None:
            updates.append("providers = :providers")
            params["providers"] = json.dumps(request.providers)

        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")

            query = f"""
                UPDATE delivery_targets
                SET {', '.join(updates)}
                WHERE id = :id AND user_id = :user_id
            """
            db.execute(text(query), params)
            db.commit()

        return get_delivery_target(target_id, user_id)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@router.delete("/{target_id}")
def delete_delivery_target(target_id: str, user_id: str = Depends(get_current_user)):
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
def test_delivery_target(target_id: str, user_id: str = Depends(get_current_user)):
    db = SessionLocal()
    try:
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

        if not target[2]:
            raise HTTPException(status_code=400, detail="Target is disabled")

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

        result = route_webhook_to_targets(
    user_id=user_id,
    webhook_data=test_payload,
    provider=None,
    target_id=target_id
)

        # db.execute(
        #     text("""
        #         UPDATE delivery_targets
        #         SET success_count = success_count + 1,
        #             last_used = CURRENT_TIMESTAMP
        #         WHERE id = :id
        #     """),
        #     {"id": target_id}
        # )
        db.commit()

        return {
    "success": result["failed"] == 0,
    "result": result
}

    except Exception as e:
        db.execute(
            text("""
                UPDATE delivery_targets
                SET error_count = error_count + 1,
                    last_used = CURRENT_TIMESTAMP
                WHERE id = :id
            """),
            {"id": target_id}
        )
        db.commit()

        return {"success": False, "error": str(e)}

    finally:
        db.close()

@router.get("/{id}/logs")
def get_target_logs(id: str, user_id: str = Depends(get_current_user)):
    db = SessionLocal()

    try :
        target = db.execute(
            text(
                """
                SELECT id
                FROM delivery_targets
                WHERE id = :id AND user_id = :user_id
                """
            ),
            {"id":id, "user_id": user_id}
        ).fetchone()
        if not target:
            raise HTTPException(status_code=404, detail="Target not found")
        rows = db.execute(
            text("""
                SELECT *
                FROM delivery_logs
                WHERE target_id = :id
                ORDER BY created_at DESC
                LIMIT 50
            """),
            {"id": id}
        ).fetchall()

        return {"items": [dict(r._mapping) for r in rows]}
    finally:
        db.close()

@router.get("/{target_id}/stats")
def get_target_stats(target_id: str, user_id: str = Depends(get_current_user)):
    db = SessionLocal()
    try:
        stats = db.execute(
            text("""
                SELECT success_count, error_count, last_used
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

