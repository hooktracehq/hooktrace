

from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy import text
from .database import SessionLocal
from .auth import get_current_user

router = APIRouter(prefix="/events", tags=["events"])


VALID_STATUSES = {
    "pending",
    "processing",
    "delivered",
    "failed",
    "dlq",
}


# =============================
# LIST EVENTS
# =============================

@router.get("/")
def list_events(
    status: str | None = None,
    provider: str | None = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
    user_id: str = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        conditions = [
            "r.user_id = :user_id"
        ]

        params = {
            "user_id": user_id,
            "limit": limit,
            "offset": offset,
        }

        # provider filter
        if provider:
            conditions.append(
                "e.provider = :provider"
            )
            params["provider"] = provider

        # status filter
        if status:
            if status not in VALID_STATUSES:
                return {
                    "items": [],
                    "limit": limit,
                    "offset": offset,
                }

            conditions.append(
                "e.status = :status"
            )
            params["status"] = status

        where_clause = " AND ".join(conditions)

        query = f"""
            SELECT
                e.id,
                e.route_id,
                r.token,
                r.route,
                e.provider,
                e.event_type,
                e.status,
                e.attempt_count,
                e.last_error,
                e.created_at
            FROM webhook_events e
            JOIN webhook_routes r
              ON e.route_id = r.id
            WHERE {where_clause}
            ORDER BY e.created_at DESC
            LIMIT :limit OFFSET :offset
        """

        rows = db.execute(
            text(query),
            params
        ).mappings().all()

        return {
            "items": [dict(r) for r in rows],
            "limit": limit,
            "offset": offset,
        }

    finally:
        db.close()


# =============================
# GET SINGLE EVENT
# =============================

@router.get("/{event_id}")
def get_event(
    event_id: int,
    user_id: str = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        event = db.execute(
            text("""
                SELECT
                    e.id,
                    e.route_id,
                    r.token,
                    r.route,
                    e.provider,
                    e.event_type,
                    e.status,
                    e.attempt_count,
                    e.last_error,
                    e.headers,
                    e.payload,
                    e.idempotency_key,
                    e.created_at
                FROM webhook_events e
                JOIN webhook_routes r
                  ON e.route_id = r.id
                WHERE e.id = :id
                  AND r.user_id = :user_id
            """),
            {
                "id": event_id,
                "user_id": user_id,
            },
        ).mappings().first()

        if not event:
            raise HTTPException(
                status_code=404,
                detail="Event not found"
            )

        return dict(event)

    finally:
        db.close()


# =============================
# DLQ COUNT
# =============================

@router.get("/stats/dlq-count")
def get_dlq_count(
    user_id: str = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        result = db.execute(
            text("""
                SELECT COUNT(*) as count
                FROM webhook_events e
                JOIN webhook_routes r
                  ON e.route_id = r.id
                WHERE r.user_id = :user_id
                  AND e.status = 'dlq'
            """),
            {
                "user_id": user_id
            },
        ).fetchone()

        return {
            "dlq_count": result[0] if result else 0
        }

    finally:
        db.close()


# =============================
# GET EVENT DELIVERIES
# =============================

@router.get("/{id}/deliveries")
def get_event_deliveries(
    id: int,
    user_id: str = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        rows = db.execute(
            text("""
                SELECT
                    dl.id,
                    dl.target_id,
                    dl.event_id,
                    dl.status,
                    dl.status_code,
                    dl.response,
                    dl.attempt,
                    dl.created_at,
                    dt.name as target_name,
                    dt.type as target_type
                FROM delivery_logs dl
                JOIN delivery_targets dt
                  ON dl.target_id = dt.id
                JOIN webhook_events e
                  ON dl.event_id = e.id
                JOIN webhook_routes r
                  ON e.route_id = r.id
                WHERE dl.event_id = :id
                  AND r.user_id = :user_id
                ORDER BY dl.created_at DESC
            """),
            {
                "id": id,
                "user_id": user_id,
            }
        ).mappings().all()

        return {
            "items": [dict(r) for r in rows]
        }

    finally:
        db.close()