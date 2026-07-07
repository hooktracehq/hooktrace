




import asyncio
import time
import json

from threading import Thread
from sqlalchemy import text

from .database import SessionLocal
from services.shared.redis_client import redis_client
from .retry_policy import next_retry_time

from prometheus_client import start_http_server

from .metrics import (
    events_delivered,
    events_failed,
    events_retried,
    delivery_latency,
)

from .delivery_targets_router import route_webhook_to_targets


QUEUE_MAIN = "webhook:ingress"
QUEUE_RETRY = "webhook:retry"
QUEUE_DLQ = "webhook:dlq"

MAX_RETRIES = 5


# =========================
# BATCH HELPERS
# =========================




# =========================
# REALTIME UPDATES
# =========================
def publish_update(
    event_id: int,
    status: str,
    attempt: int = 0,
    user_id: str = None,
    provider: str = None,
    route: str = None,
    token: str = None,
    created_at: str = None,
):
    redis_client.publish(
        "events:updates",
        json.dumps(
            {
                "id": event_id,
                "status": status,
                "attempt_count": attempt,
                "user_id": user_id,
                "provider": provider,
                "route": route,
                "token": token,
                "created_at": created_at,
            }
        ),
    )


# =========================
# BATCH PROCESSING
# =========================



# =========================
# EVENT DELIVERY
# =========================
def deliver_event(event_id: int):
    db = SessionLocal()

    try:
        # =========================
        # CLAIM EVENT
        # =========================
        claimed = db.execute(
            text("""
                UPDATE webhook_events
                SET status = 'processing'
                WHERE id = :id
                AND status IN ('queued', 'retrying')
            """),
            {"id": event_id},
        )

        if claimed.rowcount == 0:
            db.rollback()
            return

        db.commit()

        # =========================
        # LOAD EVENT
        # =========================
        row = db.execute(
            text(
                """
                SELECT 
                    e.*,
                    r.id as route_id,
                    r.token,
                    r.route,
                    r.mode,
                    r.dev_target,
                    r.prod_target,
                    r.user_id,
                    r.tunnel_id
                FROM webhook_events e
                JOIN webhook_routes r
                  ON r.id = e.route_id
                WHERE e.id = :id
            """
            ),
            {"id": event_id},
        ).mappings().first()

        if not row:
            print(f"[worker] Event {event_id} not found")
            return

        user_id = row["user_id"]

        payload = row["payload"]

        if isinstance(payload, str):
            try:
                payload = json.loads(payload)
            except Exception:
                payload = {}

        headers = row["headers"]

        if isinstance(headers, str):
            try:
                headers = json.loads(headers)
            except Exception:
                headers = {}

        publish_update(
            event_id=event_id,
            status="processing",
            attempt=row["attempt_count"],
            user_id=row["user_id"],
            provider=row["provider"],
            route=row["route"],
            token=row["token"],
            created_at=row["created_at"],
        )

        # =========================
        # AGGREGATION
        # =========================
        try:
            rules = db.execute(
                text(
                    """
                    SELECT id, event_patterns, provider
                    FROM aggregation_rules
                    WHERE user_id = :user_id
                    AND enabled = TRUE
                """
                ),
                {"user_id": user_id},
            ).mappings().all()

            # for rule in rules:
            #     if match_event(rule, payload, row["provider"]):
            #         push_to_batch(
            #             rule["id"],
            #             event_id,
            #             payload
            #         )

            db.commit()

        except Exception as e:
            print(f"[worker] aggregation error: {e}")

        # =========================
        # DEV MODE
        # =========================
        if row["mode"] == "dev":
            try:
                redis_client.publish(
                    f"tunnel:{row['token']}",
                    json.dumps(
                        {
                            "headers": headers,
                            "payload": payload,
                            "route": row["route"],
                            "event_id": event_id,
                        }
                    ),
                )

                db.execute(
                    text("""
                        UPDATE webhook_events
                        SET status='delivered'
                        WHERE id=:id
                    """),
                    {"id": event_id},
                )

                db.commit()

                events_delivered.inc()

                publish_update(
                    event_id=event_id,
                    status="delivered",
                    attempt=row["attempt_count"],
                    user_id=row["user_id"],
                    provider=row["provider"],
                    route=row["route"],
                    token=row["token"],
                    created_at=row["created_at"],
                )

                return

            except Exception as e:
                print(f"[worker] tunnel error: {e}")

        # =========================
        # DELIVERY TARGETS
        # =========================
        try:
            result = asyncio.run(
                route_webhook_to_targets(
                    user_id=user_id,
                    webhook_data=payload,
                    provider=row["provider"],
                )
            )

            print("ROUTER RESULT:", result)

            # =========================
            # SUCCESS / FAILURE
            # =========================
            if result["failed"] > 0:
                attempts = row["attempt_count"] + 1

                # DLQ transition
                if attempts >= MAX_RETRIES:
                    db.execute(
                        text("""
                            UPDATE webhook_events
                            SET
                                status='dlq',
                                attempt_count=:attempts,
                                last_error='max retries exceeded'
                            WHERE id=:id
                        """),
                        {
                            "id": event_id,
                            "attempts": attempts,
                        },
                    )

                    redis_client.lpush(
                        QUEUE_DLQ,
                        str(event_id)
                    )

                    status = "dlq"

                else:
                    retry_at = next_retry_time(attempts)

                    db.execute(
                        text("""
                            UPDATE webhook_events
                            SET
                                status='retrying',
                                attempt_count=:attempts,
                                last_error='multi-target failure',
                                next_retry_at=:retry_at
                            WHERE id=:id
                        """),
                        {
                            "id": event_id,
                            "attempts": attempts,
                            "retry_at": retry_at,
                        },
                    )

                    events_retried.inc()

                    status = "retrying"

                events_failed.inc()

            else:
                db.execute(
                    text("""
                        UPDATE webhook_events
                        SET
                            status='delivered',
                            last_error=NULL,
                            next_retry_at=NULL
                        WHERE id=:id
                    """),
                    {"id": event_id},
                )

                events_delivered.inc()

                status = "delivered"

            db.commit()

            publish_update(
                event_id=event_id,
                status=status,
                attempt=row["attempt_count"],
                user_id=row["user_id"],
                provider=row["provider"],
                route=row["route"],
                token=row["token"],
                created_at=row["created_at"],
            )

        except Exception as e:
            print(f"[worker] router error: {e}")

            attempts = row["attempt_count"] + 1

            # DLQ transition
            if attempts >= MAX_RETRIES:
                db.execute(
                    text("""
                        UPDATE webhook_events
                        SET
                            status='dlq',
                            attempt_count=:attempts,
                            last_error=:error
                        WHERE id=:id
                    """),
                    {
                        "id": event_id,
                        "attempts": attempts,
                        "error": str(e),
                    },
                )

                redis_client.lpush(
                    QUEUE_DLQ,
                    str(event_id)
                )

                status = "dlq"

            else:
                retry_at = next_retry_time(attempts)

                db.execute(
                    text("""
                        UPDATE webhook_events
                        SET
                            status='retrying',
                            attempt_count=:attempts,
                            last_error=:error,
                            next_retry_at=:retry_at
                        WHERE id=:id
                    """),
                    {
                        "id": event_id,
                        "attempts": attempts,
                        "error": str(e),
                        "retry_at": retry_at,
                    },
                )

                events_retried.inc()

                status = "retrying"

            db.commit()

            events_failed.inc()

            publish_update(
                event_id=event_id,
                status=status,
                attempt=attempts,
                user_id=row["user_id"],
                provider=row["provider"],
                route=row["route"],
                token=row["token"],
                created_at=row["created_at"],
            )

    finally:
        db.close()


# =========================
# RETRY SCHEDULER
# =========================
def retry_scheduler():
    while True:
        db = SessionLocal()

        try:
            rows = db.execute(
                text("""
                    SELECT id
                    FROM webhook_events
                    WHERE status='retrying'
                    AND next_retry_at IS NOT NULL
                    AND next_retry_at <= NOW()
                """)
            ).fetchall()

            for row in rows:
                redis_client.lpush(
                    QUEUE_MAIN,
                    str(row.id)
                )

            db.commit()

        finally:
            db.close()

        time.sleep(5)


# =========================
# MAIN WORKER
# =========================
def main():
    print("[worker] started")

    start_http_server(8001)

    Thread(
        target=retry_scheduler,
        daemon=True
    ).start()

    while True:
        try:
            result = redis_client.brpop(
                QUEUE_MAIN,
                timeout=30
            )

            if result is None:
                continue

            _, raw_event = result

            try:
                data = json.loads(raw_event)

                # batch payload
                if isinstance(data, dict) and data.get("batch"):
                    for item in data["events"]:
                        event_id = item.get("event_id")

                        if event_id:
                            deliver_event(
                                int(event_id)
                            )

                else:
                    deliver_event(
                        int(raw_event)
                    )

            except Exception:
                deliver_event(
                    int(raw_event)
                )

        except Exception as e:
            print(f"[worker] Redis error: {e}")
            time.sleep(2)


if __name__ == "__main__":
   

    main()