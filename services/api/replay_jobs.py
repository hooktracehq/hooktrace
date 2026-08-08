from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text

from .database import SessionLocal
from .auth import get_current_user
from services.shared.redis_client import redis_client


REPLAY_QUEUE = "replay:jobs"


router = APIRouter(
    prefix="/replays",
    tags=["Replay Jobs"],
)


# =========================================================
# CREATE REPLAY JOB
# =========================================================

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
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
        # -------------------------------------------------
        # Validate events
        # -------------------------------------------------

        valid_event_ids = []

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

            if exists:
                valid_event_ids.append(event_id)

        if not valid_event_ids:
            raise HTTPException(
                status_code=404,
                detail="No valid events found",
            )

        # -------------------------------------------------
        # Create replay job
        # -------------------------------------------------

        job = db.execute(
            text(
                """
                INSERT INTO replay_jobs
                (
                    user_id,
                    status,
                    total_events,
                    parallelism
                )
                VALUES
                (
                    :user_id,
                    'queued',
                    :total,
                    5
                )
                RETURNING id
                """
            ),
            {
                "user_id": user_id,
                "total": len(valid_event_ids),
            },
        ).first()

        replay_job_id = job[0]

        # -------------------------------------------------
        # Create replay job events
        # -------------------------------------------------

        for event_id in valid_event_ids:
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

        # -------------------------------------------------
        # Push job to replay worker
        # -------------------------------------------------

        redis_client.lpush(
            REPLAY_QUEUE,
            str(replay_job_id),
        )

        return {
            "id": str(replay_job_id),
            "status": "queued",
            "total_events": len(valid_event_ids),
        }

    finally:
        db.close()


# =========================================================
# REPLAY ALL FAILED EVENTS
# =========================================================

@router.post(
    "/failed",
    status_code=status.HTTP_201_CREATED,
)
def replay_all_failed(
    user_id: UUID = Depends(get_current_user),
):
    """
    Create a replay job containing all failed webhook
    events belonging to the current user.
    """

    db = SessionLocal()

    try:
        # -------------------------------------------------
        # Find failed webhook events owned by this user
        # -------------------------------------------------

        rows = db.execute(
            text(
                """
                SELECT DISTINCT
                    e.id
                FROM webhook_events e

                JOIN webhook_routes r
                    ON r.id = e.route_id

                WHERE
                    r.user_id = :user_id
                    AND e.status = 'failed'

                ORDER BY
                    e.id DESC
                """
            ),
            {
                "user_id": user_id,
            },
        ).mappings().all()

        event_ids = [
            row["id"]
            for row in rows
        ]

        if not event_ids:
            raise HTTPException(
                status_code=404,
                detail="No failed events found",
            )

        # -------------------------------------------------
        # Create replay job
        # -------------------------------------------------

        job = db.execute(
            text(
                """
                INSERT INTO replay_jobs
                (
                    user_id,
                    status,
                    total_events,
                    parallelism
                )
                VALUES
                (
                    :user_id,
                    'queued',
                    :total,
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

        # -------------------------------------------------
        # Add failed events to replay job
        # -------------------------------------------------

        for event_id in event_ids:
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

        # -------------------------------------------------
        # Push replay job to Redis
        # -------------------------------------------------

        redis_client.lpush(
            REPLAY_QUEUE,
            str(replay_job_id),
        )

        return {
            "id": str(replay_job_id),
            "status": "queued",
            "total_events": len(event_ids),
        }

    finally:
        db.close()


# =========================================================
# LIST REPLAY JOBS
# =========================================================

@router.get("")
def list_replay_jobs(
    user_id: UUID = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        rows = db.execute(
            text(
                """
                SELECT
                    rj.id,
                    rj.total_events,
                    rj.parallelism,
                    rj.created_at,
                    rj.started_at,
                    rj.finished_at,

                    rje.event_id,

                    COUNT(rje.id) AS attempts,

                    COUNT(*) FILTER (
                        WHERE rje.status = 'completed'
                    ) AS completed_events,

                    COUNT(*) FILTER (
                        WHERE rje.status = 'failed'
                    ) AS failed_events,

                    COUNT(*) FILTER (
                        WHERE rje.status = 'running'
                    ) AS running_events,

                    COUNT(*) FILTER (
                        WHERE rje.status = 'queued'
                    ) AS queued_events,

                    MAX(e.provider) AS provider,
                    MAX(e.event_type) AS event_type

                FROM replay_jobs rj

                LEFT JOIN replay_job_events rje
                    ON rje.replay_job_id = rj.id

                LEFT JOIN webhook_events e
                    ON e.id = rje.event_id

                WHERE
                    rj.user_id = :user_id

                GROUP BY
                    rj.id,
                    rj.total_events,
                    rj.parallelism,
                    rj.created_at,
                    rj.started_at,
                    rj.finished_at,
                    rje.event_id

                ORDER BY
                    rj.created_at DESC
                """
            ),
            {
                "user_id": user_id,
            },
        ).mappings().all()

        jobs = []

        for row in rows:
            completed = row["completed_events"] or 0
            failed = row["failed_events"] or 0
            running = row["running_events"] or 0
            queued = row["queued_events"] or 0

            total = row["total_events"]

            # -------------------------------------------------
            # Determine replay status
            # -------------------------------------------------

            if running > 0:
                replay_status = "running"

            elif queued > 0:
                replay_status = "queued"

            elif completed == total:
                replay_status = "completed"

            elif failed == total:
                replay_status = "failed"

            elif completed > 0 and failed > 0:
                replay_status = "partial"

            else:
                # This can happen for a cancelled job.
                # Check the actual parent job status below.
                replay_status = "queued"

            # -------------------------------------------------
            # Preserve cancelled parent job status
            # -------------------------------------------------

            parent_status = db.execute(
                text(
                    """
                    SELECT status
                    FROM replay_jobs
                    WHERE id = :job_id
                    """
                ),
                {
                    "job_id": row["id"],
                },
            ).scalar()

            if parent_status == "cancelled":
                replay_status = "cancelled"

            jobs.append(
                {
                    "id": str(row["id"]),

                    "status": replay_status,

                    "total_events": total,

                    "event_id": row["event_id"],

                    "completed_events": completed,
                    "failed_events": failed,
                    "running_events": running,
                    "queued_events": queued,

                    "parallelism": row["parallelism"],

                    "created_at": row["created_at"],
                    "started_at": row["started_at"],
                    "finished_at": row["finished_at"],

                    "provider": (
                        row["provider"]
                        or "unknown"
                    ),

                    "event_type": (
                        row["event_type"]
                        or "unknown"
                    ),

                    "attempts": row["attempts"] or 0,
                }
            )

        return jobs

    finally:
        db.close()


# =========================================================
# REPLAY HISTORY
# =========================================================

@router.get("/{replay_job_id}/history")
def get_replay_history(
    replay_job_id: UUID,
    user_id: UUID = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        rows = db.execute(
            text(
                """
                SELECT
                    rje.id,
                    rje.attempt,
                    rje.status,
                    rje.started_at,
                    rje.finished_at,
                    rje.error

                FROM replay_job_events rje

                JOIN replay_jobs rj
                    ON rj.id = rje.replay_job_id

                WHERE
                    rje.replay_job_id = :replay_job_id
                    AND rj.user_id = :user_id

                ORDER BY
                    rje.attempt ASC,
                    rje.id ASC
                """
            ),
            {
                "replay_job_id": replay_job_id,
                "user_id": user_id,
            },
        ).mappings().all()

        return [
            {
                "id": row["id"],
                "attempt": row["attempt"],
                "status": row["status"],
                "started_at": row["started_at"],
                "finished_at": row["finished_at"],
                "error": row["error"],
            }
            for row in rows
        ]

    finally:
        db.close()


# =========================================================
# CANCEL REPLAY JOB
# =========================================================

@router.post("/{replay_job_id}/cancel")
def cancel_replay_job(
    replay_job_id: UUID,
    user_id: UUID = Depends(get_current_user),
):
    """
    Cancel a queued or running replay job.

    The replay worker must also check the parent job status
    before processing events so that a cancelled Redis job
    cannot continue executing.
    """

    db = SessionLocal()

    try:
        # -------------------------------------------------
        # Lock the job while changing its state
        # -------------------------------------------------

        job = db.execute(
            text(
                """
                SELECT
                    id,
                    status
                FROM replay_jobs
                WHERE
                    id = :replay_job_id
                    AND user_id = :user_id
                FOR UPDATE
                """
            ),
            {
                "replay_job_id": replay_job_id,
                "user_id": user_id,
            },
        ).mappings().first()

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Replay job not found",
            )

        current_status = job["status"]

        # -------------------------------------------------
        # Already cancelled
        # -------------------------------------------------

        if current_status == "cancelled":
            return {
                "id": str(replay_job_id),
                "status": "cancelled",
            }

        # -------------------------------------------------
        # Finished jobs cannot be cancelled
        # -------------------------------------------------

        if current_status in (
            "completed",
            "failed",
        ):
            raise HTTPException(
                status_code=400,
                detail="Replay is already finished",
            )

        # -------------------------------------------------
        # Cancel queued/running replay events
        # -------------------------------------------------

        db.execute(
            text(
                """
                UPDATE replay_job_events
                SET
                    status = 'cancelled',
                    finished_at = COALESCE(
                        finished_at,
                        NOW()
                    )

                WHERE
                    replay_job_id = :replay_job_id
                    AND status IN (
                        'queued',
                        'running'
                    )
                """
            ),
            {
                "replay_job_id": replay_job_id,
            },
        )

        # -------------------------------------------------
        # Cancel parent replay job
        # -------------------------------------------------

        db.execute(
            text(
                """
                UPDATE replay_jobs
                SET
                    status = 'cancelled',
                    finished_at = COALESCE(
                        finished_at,
                        NOW()
                    )

                WHERE
                    id = :replay_job_id
                """
            ),
            {
                "replay_job_id": replay_job_id,
            },
        )

        db.commit()

        return {
            "id": str(replay_job_id),
            "status": "cancelled",
        }

    finally:
        db.close()