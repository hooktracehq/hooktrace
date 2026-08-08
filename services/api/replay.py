from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text

from .database import SessionLocal
from .auth import get_current_user
from services.shared.redis_client import redis_client

router = APIRouter(
    prefix="/events",
    tags=["Replay"],
)

QUEUE_MAIN = "webhook:ingress"


@router.post(
    "/{event_id}/replay",
    status_code=status.HTTP_202_ACCEPTED,
)
def replay_event(
    event_id: int,
    user_id: str = Depends(get_current_user),
):
    """
    Replay a single webhook event immediately.
    """

    db = SessionLocal()

    try:
        event = db.execute(
            text(
                """
                SELECT
                    e.id
                FROM webhook_events e
                JOIN webhook_routes r
                    ON e.route_id = r.id
                WHERE
                    e.id = :id
                    AND r.user_id = :user_id
                """
            ),
            {
                "id": event_id,
                "user_id": user_id,
            },
        ).mappings().first()

        if not event:
            raise HTTPException(
                status_code=404,
                detail="Event not found",
            )

        db.execute(
            text(
                """
                UPDATE webhook_events
                SET
                    status = 'pending',
                    attempt_count = 0,
                    retry_count = 0,
                    last_error = NULL,
                    next_retry_at = NULL
                WHERE id = :id
                """
            ),
            {
                "id": event_id,
            },
        )

        db.commit()

        # Push directly to the normal webhook worker
        redis_client.lpush(
            QUEUE_MAIN,
            str(event_id),
        )

        return {
            "replayed": True,
            "event_id": event_id,
        }

    finally:
        db.close()