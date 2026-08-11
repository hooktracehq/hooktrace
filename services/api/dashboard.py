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
        #
        # Always return 24 hourly buckets so the chart has data
        # even when some hours have zero events.
        # ---------------------------------------------------------

        activity = db.execute(
            text(
                """
                WITH hours AS (
                    SELECT generate_series(
                        date_trunc(
                            'hour',
                            NOW() - INTERVAL '23 hours'
                        ),
                        date_trunc(
                            'hour',
                            NOW()
                        ),
                        INTERVAL '1 hour'
                    ) AS hour
                ),

                events AS (
                    SELECT
                        e.created_at,
                        e.status

                    FROM webhook_events e

                    JOIN webhook_routes r
                        ON r.id = e.route_id

                    WHERE
                        r.user_id = :user_id
                        AND e.created_at >=
                            NOW() - INTERVAL '24 hours'
                )

                SELECT
                    EXTRACT(
                        EPOCH FROM hours.hour
                    )::bigint AS timestamp,

                    COUNT(events.*) FILTER (
                        WHERE events.status = 'delivered'
                    ) AS success,

                    COUNT(events.*) FILTER (
                        WHERE events.status IN (
                            'failed',
                            'dlq'
                        )
                    ) AS failure

                FROM hours

                LEFT JOIN events
                    ON events.created_at >= hours.hour
                    AND events.created_at <
                        hours.hour + INTERVAL '1 hour'

                GROUP BY hours.hour

                ORDER BY hours.hour ASC
                """
            ),
            {
                "user_id": user_id,
            },
        ).mappings().all()

        # ---------------------------------------------------------
        # Provider breakdown
        # ---------------------------------------------------------

        providers = db.execute(
            text(
                """
                SELECT
                    COALESCE(
                        NULLIF(TRIM(e.provider), ''),
                        'unknown'
                    ) AS name,

                    COUNT(*) AS count

                FROM webhook_events e

                JOIN webhook_routes r
                    ON r.id = e.route_id

                WHERE r.user_id = :user_id

                GROUP BY
                    COALESCE(
                        NULLIF(TRIM(e.provider), ''),
                        'unknown'
                    )

                ORDER BY
                    count DESC
                """
            ),
            {
                "user_id": user_id,
            },
        ).mappings().all()

        provider_total = sum(
            int(row["count"] or 0)
            for row in providers
        )

        provider_data = [
            {
                "name": row["name"],
                "count": int(row["count"] or 0),
                "percentage": (
                    round(
                        (
                            int(row["count"] or 0)
                            / provider_total
                        ) * 100,
                        1,
                    )
                    if provider_total > 0
                    else 0
                ),
            }
            for row in providers
        ]

        # ---------------------------------------------------------
        # Connections
        # Frontend name: Connections
        # Backend: integrations
        # ---------------------------------------------------------

        connections = db.execute(
            text(
                """
                SELECT
                    COUNT(*) AS total,

                    COUNT(*) FILTER (
                        WHERE status = 'connected'
                    ) AS healthy,

                    COUNT(*) FILTER (
                        WHERE status != 'connected'
                    ) AS errors

                FROM integrations

                WHERE user_id = :user_id
                """
            ),
            {
                "user_id": user_id,
            },
        ).mappings().first()

        # ---------------------------------------------------------
        # Routes
        # ---------------------------------------------------------

        routes = db.execute(
            text(
                """
                SELECT
                    COUNT(*) AS total

                FROM webhook_routes

                WHERE user_id = :user_id
                """
            ),
            {
                "user_id": user_id,
            },
        ).mappings().first()

        # ---------------------------------------------------------
        # Destinations
        # Frontend name: Destinations
        # Backend: delivery_targets
        # ---------------------------------------------------------

        destinations = db.execute(
            text(
                """
                SELECT
                    COUNT(*) AS total,

                    COUNT(*) FILTER (
                        WHERE enabled = TRUE
                    ) AS healthy,

                    COUNT(*) FILTER (
                        WHERE enabled = FALSE
                    ) AS paused,

                    COALESCE(
                        SUM(success_count),
                        0
                    ) AS delivered,

                    COALESCE(
                        SUM(error_count),
                        0
                    ) AS failed

                FROM delivery_targets

                WHERE user_id = :user_id
                """
            ),
            {
                "user_id": user_id,
            },
        ).mappings().first()

        # ---------------------------------------------------------
        # Aggregation
        # ---------------------------------------------------------

        aggregation = db.execute(
            text(
                """
                SELECT
                    COUNT(*) AS total,

                    COUNT(*) FILTER (
                        WHERE enabled = TRUE
                    ) AS enabled,

                    COALESCE(
                        SUM(events_processed),
                        0
                    ) AS events_processed,

                    COALESCE(
                        SUM(batches_created),
                        0
                    ) AS batches_created,

                    COALESCE(
                        SUM(duplicates_skipped),
                        0
                    ) AS duplicates_skipped

                FROM aggregation_rules

                WHERE user_id = :user_id
                """
            ),
            {
                "user_id": user_id,
            },
        ).mappings().first()

        # ---------------------------------------------------------
        # Tunnels
        # ---------------------------------------------------------

        tunnels = db.execute(
            text(
                """
                SELECT
                    COUNT(*) AS total,

                    COUNT(*) FILTER (
                        WHERE status = 'active'
                    ) AS active,

                    COUNT(*) FILTER (
                        WHERE status != 'active'
                    ) AS inactive,

                    COALESCE(
                        SUM(request_count),
                        0
                    ) AS requests

                FROM dev_tunnels

                WHERE user_id = :user_id
                """
            ),
            {
                "user_id": user_id,
            },
        ).mappings().first()

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
                    e.delivery_duration,
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
                "incoming": int(stats["incoming"] or 0),
                "delivered": int(stats["delivered"] or 0),
                "failed": int(stats["failed"] or 0),
                "retries": int(stats["retries"] or 0),
                "dlq": int(stats["dlq"] or 0),
                "avg_latency_ms": int(
                    stats["avg_latency_ms"] or 0
                ),
            },

            "activity": [
                {
                    "timestamp": int(row["timestamp"]),
                    "success": int(row["success"] or 0),
                    "failure": int(row["failure"] or 0),
                }
                for row in activity
            ],

            "providers": provider_data,

            "infrastructure": {
                "connections": {
                    "total": int(
                        connections["total"] or 0
                    ),
                    "healthy": int(
                        connections["healthy"] or 0
                    ),
                    "errors": int(
                        connections["errors"] or 0
                    ),
                },

                "routes": {
                    "total": int(
                        routes["total"] or 0
                    ),
                },

                "destinations": {
                    "total": int(
                        destinations["total"] or 0
                    ),
                    "healthy": int(
                        destinations["healthy"] or 0
                    ),
                    "paused": int(
                        destinations["paused"] or 0
                    ),
                    "delivered": int(
                        destinations["delivered"] or 0
                    ),
                    "failed": int(
                        destinations["failed"] or 0
                    ),
                },

                "aggregation": {
                    "total": int(
                        aggregation["total"] or 0
                    ),
                    "enabled": int(
                        aggregation["enabled"] or 0
                    ),
                    "events_processed": int(
                        aggregation["events_processed"] or 0
                    ),
                    "batches_created": int(
                        aggregation["batches_created"] or 0
                    ),
                    "duplicates_skipped": int(
                        aggregation["duplicates_skipped"] or 0
                    ),
                },

                "tunnels": {
                    "total": int(
                        tunnels["total"] or 0
                    ),
                    "active": int(
                        tunnels["active"] or 0
                    ),
                    "inactive": int(
                        tunnels["inactive"] or 0
                    ),
                    "requests": int(
                        tunnels["requests"] or 0
                    ),
                },
            },

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
                    "latency_ms": row["delivery_duration"],
                    "created_at": row["created_at"],
                }
                for row in recent_failures
            ],
        }

    finally:
        db.close()