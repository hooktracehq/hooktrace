
# """
# Bulk Aggregation API
# Manages event batching, coalescing, and rate limiting rules
# """

# from datetime import datetime
# from typing import Optional, List
# import uuid

# from fastapi import APIRouter, Depends, HTTPException
# from pydantic import BaseModel
# from sqlalchemy import text
# import json

# from .database import SessionLocal
# from .auth import get_current_user


# router = APIRouter(prefix="/aggregation", tags=["aggregation"])


# # -----------------------------
# # Database Setup
# # -----------------------------

# CREATE_AGGREGATION_RULES_TABLE = """
# CREATE TABLE IF NOT EXISTS aggregation_rules (
#     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
#     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
#     name VARCHAR(255) NOT NULL,
#     provider VARCHAR(50),
#     event_patterns JSONB DEFAULT '[]'::jsonb,
#     enabled BOOLEAN DEFAULT TRUE,
    
#     -- Aggregation config
#     mode VARCHAR(20) NOT NULL, -- time_window, count, rate_limit
#     window_ms INTEGER,
#     max_batch_size INTEGER DEFAULT 100,
#     timeout_ms INTEGER,
#     max_events_per_second INTEGER,
    
#     -- Deduplication
#     deduplicate BOOLEAN DEFAULT FALSE,
#     deduplication_key VARCHAR(255),
    
#     -- Stats
#     events_processed INTEGER DEFAULT 0,
#     batches_created INTEGER DEFAULT 0,
#     duplicates_skipped INTEGER DEFAULT 0,
    
#     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#     last_triggered TIMESTAMP
# );

# CREATE INDEX idx_aggregation_rules_user_id ON aggregation_rules(user_id);
# CREATE INDEX idx_aggregation_rules_enabled ON aggregation_rules(enabled);
# CREATE INDEX idx_aggregation_rules_provider ON aggregation_rules(provider);

# -- Update webhook_routes table to support aggregation
# ALTER TABLE webhook_routes ADD COLUMN IF NOT EXISTS aggregation_enabled BOOLEAN DEFAULT FALSE;
# ALTER TABLE webhook_routes ADD COLUMN IF NOT EXISTS aggregation_window_ms INTEGER DEFAULT 5000;
# ALTER TABLE webhook_routes ADD COLUMN IF NOT EXISTS aggregation_rule_id UUID REFERENCES aggregation_rules(id) ON DELETE SET NULL;
# """


# # -----------------------------
# # Schemas
# # -----------------------------

# class AggregationConfig(BaseModel):
#     mode: str  # time_window, count, rate_limit
#     windowMs: Optional[int] = None
#     maxBatchSize: Optional[int] = 100
#     timeoutMs: Optional[int] = None
#     maxEventsPerSecond: Optional[int] = None
#     deduplicate: Optional[bool] = False
#     deduplicationKey: Optional[str] = None


# class CreateAggregationRuleRequest(BaseModel):
#     name: str
#     provider: Optional[str] = None
#     eventPatterns: List[str] = ["*"]
#     config: AggregationConfig


# class UpdateAggregationRuleRequest(BaseModel):
#     name: Optional[str] = None
#     provider: Optional[str] = None
#     eventPatterns: Optional[List[str]] = None
#     enabled: Optional[bool] = None
#     config: Optional[AggregationConfig] = None


# # -----------------------------
# # Endpoints
# # -----------------------------

# @router.get("")
# def list_aggregation_rules(user_id: str = Depends(get_current_user)):
#     """List all aggregation rules for current user"""
#     db = SessionLocal()
#     try:
#         rules = db.execute(
#             text("""
#                 SELECT 
#                     id, name, provider, event_patterns, enabled,
#                     mode, window_ms, max_batch_size, timeout_ms,
#                     max_events_per_second, deduplicate, deduplication_key,
#                     events_processed, batches_created, duplicates_skipped,
#                     created_at, last_triggered
#                 FROM aggregation_rules
#                 WHERE user_id = :user_id
#                 ORDER BY created_at DESC
#             """),
#             {"user_id": user_id}
#         ).mappings().all()

#         return {
#             "items": [
#                 {
#                     "id": str(row[0]),
#                     "name": row[1],
#                     "provider": row[2],
#                     "eventPatterns": row[3] if isinstance(row[3], list) else json.loads(row[3] or '["*"]'),
#                     "enabled": row[4],
#                     "config": {
#                         "mode": row[5],
#                         "windowMs": row[6],
#                         "maxBatchSize": row[7],
#                         "timeoutMs": row[8],
#                         "maxEventsPerSecond": row[9],
#                         "deduplicate": row[10],
#                         "deduplicationKey": row[11],
#                     },
#                     "stats": {
#                     "eventsProcessed": row[12] or 0,
#                     "batchesCreated": row[13] or 0,
#                     "averageBatchSize": ((row[12] or 0) / (row[13] or 0)) if (row[13] or 0) > 0 else 0,
#                     "duplicatesSkipped": row[14] or 0,
# },
#                     "createdAt": row[15].isoformat() if row[15] else None,
#                     "lastTriggered": row[16].isoformat() if row[16] else None,
#                 }
#                 for row in rules
#             ]
#         }
#     finally:
#         db.close()


# @router.post("")
# def create_aggregation_rule(
#     request: CreateAggregationRuleRequest,
#     user_id: str = Depends(get_current_user)
# ):
#     """Create a new aggregation rule"""
#     db = SessionLocal()
#     try:
#         rule_id = str(uuid.uuid4())

#         db.execute(
#             text("""
#                 INSERT INTO aggregation_rules (
#                     id, user_id, name, provider, event_patterns, enabled,
#                     mode, window_ms, max_batch_size, timeout_ms,
#                     max_events_per_second, deduplicate, deduplication_key
#                 ) VALUES (
#                     :id, :user_id, :name, :provider, :event_patterns, TRUE,
#                     :mode, :window_ms, :max_batch_size, :timeout_ms,
#                     :max_events_per_second, :deduplicate, :deduplication_key
#                 )
#             """),
#             {
#                 "id": rule_id,
#                 "user_id": user_id,
#                 "name": request.name,
#                 "provider": request.provider,
#                 "event_patterns": json.dumps(request.eventPatterns),
#                 "mode": request.config.mode,
#                 "window_ms": request.config.windowMs,
#                 "max_batch_size": request.config.maxBatchSize,
#                 "timeout_ms": request.config.timeoutMs,
#                 "max_events_per_second": request.config.maxEventsPerSecond,
#                 "deduplicate": request.config.deduplicate,
#                 "deduplication_key": request.config.deduplicationKey,
#             }
#         )
#         db.commit()

#         return {
#             "id": rule_id,
#             "name": request.name,
#             "provider": request.provider,
#             "eventPatterns": request.eventPatterns,
#             "enabled": True,
#             "config": request.config.dict(),
#             "stats": {
#                 "eventsProcessed": 0,
#                 "batchesCreated": 0,
#                 "averageBatchSize": 0,
#                 "duplicatesSkipped": 0,
#             },
#             "createdAt": datetime.utcnow().isoformat(),
#             "lastTriggered": None,
#         }
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=400, detail=str(e))
#     finally:
#         db.close()


# @router.get("/{rule_id}")
# def get_aggregation_rule(
#     rule_id: str,
#     user_id: str = Depends(get_current_user)
# ):
#     """Get a specific aggregation rule"""
#     db = SessionLocal()
#     try:
#         rule = db.execute(
#             text("""
#                 SELECT 
#                     id, name, provider, event_patterns, enabled,
#                     mode, window_ms, max_batch_size, timeout_ms,
#                     max_events_per_second, deduplicate, deduplication_key,
#                     events_processed, batches_created, duplicates_skipped,
#                     created_at, last_triggered
#                 FROM aggregation_rules
#                 WHERE id = :id AND user_id = :user_id
#             """),
#             {"id": rule_id, "user_id": user_id}
#         ).fetchone()

#         if not rule:
#             raise HTTPException(status_code=404, detail="Rule not found")

#         return {
#             "id": str(rule[0]),
#             "name": rule[1],
#             "provider": rule[2],
#             "eventPatterns": rule[3] if isinstance(rule[3], list) else json.loads(rule[3] or '["*"]'),
#             "enabled": rule[4],
#             "config": {
#                 "mode": rule[5],
#                 "windowMs": rule[6],
#                 "maxBatchSize": rule[7],
#                 "timeoutMs": rule[8],
#                 "maxEventsPerSecond": rule[9],
#                 "deduplicate": rule[10],
#                 "deduplicationKey": rule[11],
#             },
#             "stats": {
#             "eventsProcessed": rule[12] or 0,
#             "batchesCreated": rule[13] or 0,
#             "averageBatchSize": ((rule[12] or 0) / (rule[13] or 0)) if (rule[13] or 0) > 0 else 0,
#             "duplicatesSkipped": rule[14] or 0,
# },
#             "createdAt": rule[15].isoformat() if rule[15] else None,
#             "lastTriggered": rule[16].isoformat() if rule[16] else None,
#         }
#     finally:
#         db.close()


# @router.patch("/{rule_id}")
# def update_aggregation_rule(
#     rule_id: str,
#     request: UpdateAggregationRuleRequest,
#     user_id: str = Depends(get_current_user)
# ):
#     """Update an aggregation rule"""
#     db = SessionLocal()
#     try:
#         # Check if exists
#         existing = db.execute(
#             text("SELECT id FROM aggregation_rules WHERE id = :id AND user_id = :user_id"),
#             {"id": rule_id, "user_id": user_id}
#         ).fetchone()

#         if not existing:
#             raise HTTPException(status_code=404, detail="Rule not found")

#         # Build update query
#         updates = []
#         params = {"id": rule_id, "user_id": user_id}

#         if request.name is not None:
#             updates.append("name = :name")
#             params["name"] = request.name

#         if request.provider is not None:
#             updates.append("provider = :provider")
#             params["provider"] = request.provider

#         if request.eventPatterns is not None:
#             updates.append("event_patterns = :event_patterns")
#             params["event_patterns"] = json.dumps(request.eventPatterns)

#         if request.enabled is not None:
#             updates.append("enabled = :enabled")
#             params["enabled"] = request.enabled

#         if request.config is not None:
#             if request.config.mode is not None:
#                 updates.append("mode = :mode")
#                 params["mode"] = request.config.mode
            
#             if request.config.windowMs is not None:
#                 updates.append("window_ms = :window_ms")
#                 params["window_ms"] = request.config.windowMs
            
#             if request.config.maxBatchSize is not None:
#                 updates.append("max_batch_size = :max_batch_size")
#                 params["max_batch_size"] = request.config.maxBatchSize
            
#             if request.config.deduplicate is not None:
#                 updates.append("deduplicate = :deduplicate")
#                 params["deduplicate"] = request.config.deduplicate
            
#             if request.config.deduplicationKey is not None:
#                 updates.append("deduplication_key = :deduplication_key")
#                 params["deduplication_key"] = request.config.deduplicationKey

#         if updates:
#             updates.append("updated_at = CURRENT_TIMESTAMP")
#             query = f"""
#                 UPDATE aggregation_rules
#                 SET {', '.join(updates)}
#                 WHERE id = :id AND user_id = :user_id
#             """
#             db.execute(text(query), params)
#             db.commit()

#         return get_aggregation_rule(rule_id, user_id)

#     except HTTPException:
#         raise
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=400, detail=str(e))
#     finally:
#         db.close()


# @router.delete("/{rule_id}")
# def delete_aggregation_rule(
#     rule_id: str,
#     user_id: str = Depends(get_current_user)
# ):
#     """Delete an aggregation rule"""
#     db = SessionLocal()
#     try:
#         result = db.execute(
#             text("DELETE FROM aggregation_rules WHERE id = :id AND user_id = :user_id"),
#             {"id": rule_id, "user_id": user_id}
#         )
#         db.commit()

#         if result.rowcount == 0:
#             raise HTTPException(status_code=404, detail="Rule not found")

#         return {"success": True}
#     finally:
#         db.close()


# @router.post("/{rule_id}/stats/increment")
# def increment_rule_stats(
#     rule_id: str,
#     event_count: int = 1,
#     batch_created: bool = False,
#     duplicates: int = 0,
# ):
#     """
#     Internal endpoint to update aggregation stats
#     Called by aggregation_worker.py
#     """
#     db = SessionLocal()
#     try:
#         updates = ["events_processed = events_processed + :event_count"]
#         params = {"id": rule_id, "event_count": event_count, "duplicates": duplicates}

#         if batch_created:
#             updates.append("batches_created = batches_created + 1")

#         if duplicates > 0:
#             updates.append("duplicates_skipped = duplicates_skipped + :duplicates")

#         updates.append("last_triggered = CURRENT_TIMESTAMP")

#         query = f"""
#             UPDATE aggregation_rules
#             SET {', '.join(updates)}
#             WHERE id = :id
#         """
        
#         db.execute(text(query), params)
#         db.commit()

#         return {"success": True}
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=400, detail=str(e))
#     finally:
#         db.close()







from datetime import datetime
from typing import Optional, List
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
import json

from .database import SessionLocal
from .auth import get_current_user

router = APIRouter(prefix="/aggregation", tags=["aggregation"])


# -----------------------------
# Schemas
# -----------------------------

class AggregationConfig(BaseModel):
    mode: str
    windowMs: Optional[int] = None
    maxBatchSize: Optional[int] = 100
    timeoutMs: Optional[int] = None
    maxEventsPerSecond: Optional[int] = None
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


@router.post("/{rule_id}/stats/increment")
def increment_rule_stats(
    rule_id: str,
    event_count: int = 1,
    batch_created: bool = False,
    duplicates: int = 0,
):
    db = SessionLocal()
    try:
        updates = ["events_processed = events_processed + :event_count"]
        params = {
            "id": rule_id,
            "event_count": event_count,
            "duplicates": duplicates,
        }

        if batch_created:
            updates.append("batches_created = batches_created + 1")

        if duplicates > 0:
            updates.append("duplicates_skipped = duplicates_skipped + :duplicates")

        updates.append("last_triggered = CURRENT_TIMESTAMP")

        query = f"""
            UPDATE aggregation_rules
            SET {', '.join(updates)}
            WHERE id = :id
        """

        db.execute(text(query), params)
        db.commit()

        return {"success": True}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        db.close()