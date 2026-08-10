from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import text

from .database import SessionLocal
from .auth import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/overview")
def get_dashboard_overview(
    user_id: UUID = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        # ---------------------------------------------------------
        # Overall statistics
        # ---------------------------------------------------------

        stats = db.execute(
            text(
                """
                SELECT
                    COUNT(*) AS incoming,

                    COUNT(*) FILTER (
                        WHERE e.status = 'delivered'
                    ) AS delivered,

                    COUNT(*) FILTER (
                        WHERE e.status = 'failed'
                    ) AS failed,

                    COUNT(*) FILTER (
                        WHERE e.retry_count > 0
                    ) AS retries,

                    COUNT(*) FILTER (
                        WHERE e.status = 'dlq'
                    ) AS dlq,

                    COALESCE(
                        ROUND(
                            AVG(
                                e.delivery_duration
                            ) FILTER (
                                WHERE e.delivery_duration IS NOT NULL
                            )
                        ),
                        0
                    ) AS avg_latency_ms

                FROM webhook_events e

                JOIN webhook_routes r
                    ON r.id = e.route_id

                WHERE r.user_id = :user_id
                """
            ),
            {
                "user_id": user_id,
            },
        ).mappings().first()

        # ---------------------------------------------------------
        # Activity - last 24 hours
        # ---------------------------------------------------------

        activity = db.execute(
            text(
                """
                SELECT
                    EXTRACT(
                        EPOCH FROM date_trunc(
                            'hour',
                            e.created_at
                        )
                    )::bigint AS timestamp,

                    COUNT(*) FILTER (
                        WHERE e.status = 'delivered'
                    ) AS success,

                    COUNT(*) FILTER (
                        WHERE e.status IN (
                            'failed',
                            'dlq'
                        )
                    ) AS failure

                FROM webhook_events e

                JOIN webhook_routes r
                    ON r.id = e.route_id

                WHERE
                    r.user_id = :user_id
                    AND e.created_at >= NOW() - INTERVAL '24 hours'

                GROUP BY
                    date_trunc(
                        'hour',
                        e.created_at
                    )

                ORDER BY
                    timestamp ASC
                """
            ),
            {
                "user_id": user_id,
            },
        ).mappings().all()

        # ---------------------------------------------------------
        # Recent events
        # ---------------------------------------------------------

        recent_events = db.execute(
            text(
                """
                SELECT
                    e.id,
                    e.provider,
                    e.event_type,
                    e.status,
                    e.delivery_duration,
                    e.attempt_count,
                    e.retry_count,
                    e.last_error,
                    e.created_at,
                    r.route

                FROM webhook_events e

                JOIN webhook_routes r
                    ON r.id = e.route_id

                WHERE r.user_id = :user_id

                ORDER BY e.created_at DESC

                LIMIT 10
                """
            ),
            {
                "user_id": user_id,
            },
        ).mappings().all()

        # ---------------------------------------------------------
        # Recent failures
        # ---------------------------------------------------------

        recent_failures = db.execute(
            text(
                """
                SELECT
                    e.id,
                    e.provider,
                    e.event_type,
                    e.status,
                    e.last_error,
                    e.retry_count,
                    e.attempt_count,
                    e.created_at,
                    r.route

                FROM webhook_events e

                JOIN webhook_routes r
                    ON r.id = e.route_id

                WHERE
                    r.user_id = :user_id
                    AND e.status IN (
                        'failed',
                        'dlq'
                    )

                ORDER BY e.created_at DESC

                LIMIT 10
                """
            ),
            {
                "user_id": user_id,
            },
        ).mappings().all()

        # ---------------------------------------------------------
        # Response
        # ---------------------------------------------------------

        return {
            "stats": {
                "incoming": stats["incoming"] or 0,
                "delivered": stats["delivered"] or 0,
                "failed": stats["failed"] or 0,
                "retries": stats["retries"] or 0,
                "dlq": stats["dlq"] or 0,
                "avg_latency_ms": stats["avg_latency_ms"] or 0,
            },

            "activity": [
                {
                    "timestamp": row["timestamp"],
                    "success": row["success"] or 0,
                    "failure": row["failure"] or 0,
                }
                for row in activity
            ],

            "recent_events": [
                {
                    "id": row["id"],
                    "provider": row["provider"] or "unknown",
                    "event_type": row["event_type"] or "unknown",
                    "status": row["status"],
                    "route": row["route"],
                    "latency_ms": row["delivery_duration"],
                    "attempt_count": row["attempt_count"] or 0,
                    "retry_count": row["retry_count"] or 0,
                    "last_error": row["last_error"],
                    "created_at": row["created_at"],
                }
                for row in recent_events
            ],

            "recent_failures": [
                {
                    "id": row["id"],
                    "provider": row["provider"] or "unknown",
                    "event_type": row["event_type"] or "unknown",
                    "status": row["status"],
                    "route": row["route"],
                    "last_error": row["last_error"],
                    "attempt_count": row["attempt_count"] or 0,
                    "retry_count": row["retry_count"] or 0,
                    "created_at": row["created_at"],
                }
                for row in recent_failures
            ],
        }

    finally:
        db.close()