

from datetime import datetime
from typing import Optional, List, Literal
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import text
import json

from .database import SessionLocal
from .auth import get_current_user

router = APIRouter(prefix="/aggregation", tags=["aggregation"])


# -----------------------------
# Schemas
# -----------------------------

class AggregationConfig(BaseModel):

    mode: Literal[
        "batch",
        "window",
        "rate_limit",
    ]

    windowMs: Optional[int] = Field(
        default=None,
        ge=1,
    )

    maxBatchSize: Optional[int] = Field(
        default=100,
        ge=1,
        le=10000,
    )

    timeoutMs: Optional[int] = Field(
        default=None,
        ge=1,
    )

    maxEventsPerSecond: Optional[int] = Field(
        default=None,
        ge=1,
    )

    deduplicate: Optional[bool] = False

    deduplicationKey: Optional[str] = None

class CreateAggregationRuleRequest(BaseModel):
    name: str
    provider: Optional[str] = None
    eventPatterns: List[str] = ["*"]
    config: AggregationConfig


class UpdateAggregationRuleRequest(BaseModel):
    name: Optional[str] = None
    provider: Optional[str] = None
    eventPatterns: Optional[List[str]] = None
    enabled: Optional[bool] = None
    config: Optional[AggregationConfig] = None


# -----------------------------
# Helper
# -----------------------------

def format_rule(row):
    events = row["events_processed"] or 0
    batches = row["batches_created"] or 0

    avg = events / batches if batches > 0 else 0

    return {
        "id": str(row["id"]),
        "name": row["name"],
        "provider": row["provider"],
        "eventPatterns": (
            row["event_patterns"]
            if isinstance(row["event_patterns"], list)
            else json.loads(row["event_patterns"] or '["*"]')
        ),
        "enabled": row["enabled"],
        "config": {
            "mode": row["mode"],
            "windowMs": row["window_ms"],
            "maxBatchSize": row["max_batch_size"],
            "timeoutMs": row["timeout_ms"],
            "maxEventsPerSecond": row["max_events_per_second"],
            "deduplicate": row["deduplicate"],
            "deduplicationKey": row["deduplication_key"],
        },
        "stats": {
            "eventsProcessed": events,
            "batchesCreated": batches,
            "averageBatchSize": avg,
            "duplicatesSkipped": row["duplicates_skipped"] or 0,
        },
        "createdAt": row["created_at"].isoformat() if row["created_at"] else None,
        "lastTriggered": row["last_triggered"].isoformat() if row["last_triggered"] else None,
    }


# -----------------------------
# Endpoints
# -----------------------------

@router.get("")
def list_aggregation_rules(user_id: str = Depends(get_current_user)):
    db = SessionLocal()
    try:
        rules = db.execute(
            text("""
                SELECT 
                    id, name, provider, event_patterns, enabled,
                    mode, window_ms, max_batch_size, timeout_ms,
                    max_events_per_second, deduplicate, deduplication_key,
                    events_processed, batches_created, duplicates_skipped,
                    created_at, last_triggered
                FROM aggregation_rules
                WHERE user_id = :user_id
                ORDER BY created_at DESC
            """),
            {"user_id": user_id}
        ).mappings().all()

        return {"items": [format_rule(r) for r in rules]}

    finally:
        db.close()


@router.post("")
def create_aggregation_rule(
    request: CreateAggregationRuleRequest,
    user_id: str = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        rule_id = str(uuid.uuid4())

        db.execute(
            text("""
                INSERT INTO aggregation_rules (
                    id, user_id, name, provider, event_patterns, enabled,
                    mode, window_ms, max_batch_size, timeout_ms,
                    max_events_per_second, deduplicate, deduplication_key
                ) VALUES (
                    :id, :user_id, :name, :provider, :event_patterns, TRUE,
                    :mode, :window_ms, :max_batch_size, :timeout_ms,
                    :max_events_per_second, :deduplicate, :deduplication_key
                )
            """),
            {
                "id": rule_id,
                "user_id": user_id,
                "name": request.name,
                "provider": request.provider,
                "event_patterns": json.dumps(request.eventPatterns),
                "mode": request.config.mode,
                "window_ms": request.config.windowMs,
                "max_batch_size": request.config.maxBatchSize,
                "timeout_ms": request.config.timeoutMs,
                "max_events_per_second": request.config.maxEventsPerSecond,
                "deduplicate": request.config.deduplicate,
                "deduplication_key": request.config.deduplicationKey,
            }
        )
        db.commit()

        return {
            "id": rule_id,
            "name": request.name,
            "provider": request.provider,
            "eventPatterns": request.eventPatterns,
            "enabled": True,
            "config": request.config.dict(),
            "stats": {
                "eventsProcessed": 0,
                "batchesCreated": 0,
                "averageBatchSize": 0,
                "duplicatesSkipped": 0,
            },
            "createdAt": datetime.utcnow().isoformat(),
            "lastTriggered": None,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        db.close()


@router.get("/{rule_id}")
def get_aggregation_rule(
    rule_id: str,
    user_id: str = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        rule = db.execute(
            text("""
                SELECT 
                    id, name, provider, event_patterns, enabled,
                    mode, window_ms, max_batch_size, timeout_ms,
                    max_events_per_second, deduplicate, deduplication_key,
                    events_processed, batches_created, duplicates_skipped,
                    created_at, last_triggered
                FROM aggregation_rules
                WHERE id = :id AND user_id = :user_id
            """),
            {"id": rule_id, "user_id": user_id}
        ).mappings().fetchone()

        if not rule:
            raise HTTPException(status_code=404, detail="Rule not found")

        return format_rule(rule)

    finally:
        db.close()


@router.patch("/{rule_id}")
def update_aggregation_rule(
    rule_id: str,
    request: UpdateAggregationRuleRequest,
    user_id: str = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        existing = db.execute(
            text("SELECT id FROM aggregation_rules WHERE id = :id AND user_id = :user_id"),
            {"id": rule_id, "user_id": user_id}
        ).fetchone()

        if not existing:
            raise HTTPException(status_code=404, detail="Rule not found")

        updates = []
        params = {"id": rule_id, "user_id": user_id}

        if request.name is not None:
            updates.append("name = :name")
            params["name"] = request.name

        if request.provider is not None:
            updates.append("provider = :provider")
            params["provider"] = request.provider

        if request.eventPatterns is not None:
            updates.append("event_patterns = :event_patterns")
            params["event_patterns"] = json.dumps(request.eventPatterns)

        if request.enabled is not None:
            updates.append("enabled = :enabled")
            params["enabled"] = request.enabled

        if request.config is not None:
            if request.config.mode is not None:
                updates.append("mode = :mode")
                params["mode"] = request.config.mode

            if request.config.windowMs is not None:
                updates.append("window_ms = :window_ms")
                params["window_ms"] = request.config.windowMs

            if request.config.maxBatchSize is not None:
                updates.append("max_batch_size = :max_batch_size")
                params["max_batch_size"] = request.config.maxBatchSize

            if request.config.deduplicate is not None:
                updates.append("deduplicate = :deduplicate")
                params["deduplicate"] = request.config.deduplicate

            if request.config.timeoutMs is not None:
              updates.append("timeout_ms = :timeout_ms")
              params["timeout_ms"] = request.config.timeoutMs

            if request.config.maxEventsPerSecond is not None:
             updates.append("max_events_per_second = :max_events_per_second")
             params["max_events_per_second"] = request.config.maxEventsPerSecond

            if request.config.deduplicationKey is not None:
                updates.append("deduplication_key = :deduplication_key")
                params["deduplication_key"] = request.config.deduplicationKey

        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")

            query = f"""
                UPDATE aggregation_rules
                SET {', '.join(updates)}
                WHERE id = :id AND user_id = :user_id
            """

            db.execute(text(query), params)
            db.commit()

        return get_aggregation_rule(rule_id, user_id)

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        db.close()


@router.delete("/{rule_id}")
def delete_aggregation_rule(
    rule_id: str,
    user_id: str = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        result = db.execute(
            text("DELETE FROM aggregation_rules WHERE id = :id AND user_id = :user_id"),
            {"id": rule_id, "user_id": user_id}
        )
        db.commit()

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Rule not found")

        return {"success": True}

    finally:
        db.close()

