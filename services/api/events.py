from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy import text
from database import SessionLocal
from auth import get_current_user

router = APIRouter(prefix="/events", tags=["events"])



# LIST EVENTS (USER ISOLATED)

@router.get("/")
def list_events(
    status: str | None = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
    user_id: str = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        base_query = """
    SELECT
        e.id,
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
    WHERE r.user_id = :user_id
"""

        params = {
            "user_id": user_id,
            "limit": limit,
            "offset": offset,
        }

        if status:
            if status == "dlq":
                base_query += " AND e.status = 'failed' AND e.attempt_count >= 5"
            elif status in ("pending", "delivered", "failed"):
                base_query += " AND e.status = :status"
                params["status"] = status

                if status == "failed":
                    base_query += " AND e.attempt_count < 5"
            else:
                return {"items": [], "limit": limit, "offset": offset}

        base_query += """
            ORDER BY e.created_at DESC
            LIMIT :limit OFFSET :offset
        """

        rows = db.execute(text(base_query), params).mappings().all()

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
    {"id": event_id, "user_id": user_id},
).mappings().first()

        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

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
                  AND e.status = 'failed'
                  AND e.attempt_count >= 5
            """),
            {"user_id": user_id},
        ).fetchone()

        return {"dlq_count": result[0] if result else 0}

    finally:
        db.close()