from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text

from .database import SessionLocal
from .auth import get_current_user

router = APIRouter(
    prefix="/replays",
    tags=["Replay Jobs"],
)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_replay_job(
    body: dict,
    user_id: UUID = Depends(get_current_user),
):
    """
    Create a replay job from one or more events.
    """

    event_ids = body.get("event_ids", [])

    if not event_ids:
        raise HTTPException(
            status_code=400,
            detail="event_ids is required",
        )

    db = SessionLocal()

    try:

        job = db.execute(
            text(
                """
                INSERT INTO replay_jobs
                (
                    user_id,
                    status,
                    total_events,
                    completed_events,
                    failed_events,
                    parallelism
                )
                VALUES
                (
                    :user_id,
                    'queued',
                    :total,
                    0,
                    0,
                    5
                )
                RETURNING id
                """
            ),
            {
                "user_id": user_id,
                "total": len(event_ids),
            },
        ).first()

        replay_job_id = job[0]

        for event_id in event_ids:

            exists = db.execute(
                text(
                    """
                    SELECT e.id
                    FROM webhook_events e
                    JOIN webhook_routes r
                        ON e.route_id = r.id
                    WHERE
                        e.id = :event_id
                        AND r.user_id = :user_id
                    """
                ),
                {
                    "event_id": event_id,
                    "user_id": user_id,
                },
            ).first()

            if not exists:
                continue

            db.execute(
                text(
                    """
                    INSERT INTO replay_job_events
                    (
                        replay_job_id,
                        event_id,
                        status,
                        attempt
                    )
                    VALUES
                    (
                        :job_id,
                        :event_id,
                        'queued',
                        0
                    )
                    """
                ),
                {
                    "job_id": replay_job_id,
                    "event_id": event_id,
                },
            )

        db.commit()

        return {
            "id": str(replay_job_id),
            "status": "queued",
            "total_events": len(event_ids),
        }

    finally:
        db.close()