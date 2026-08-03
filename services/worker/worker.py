
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
# def publish_update(
#     event_id,
#     status,
#     attempt=0,
#     user_id=None,
#     provider=None,
#     route=None,
#     token=None,
#     created_at=None,
# ):
#     try:
#         payload = {
#             "id": event_id,
#             "status": status,
#             "attempt_count": attempt or 0,
#             "user_id": str(user_id) if user_id else None,
#             "provider": provider,
#             "route": route,
#             "token": token,
#             "created_at": created_at.isoformat() if created_at else None,
#         }

#         subscribers = redis_client.publish(
#             "events:updates",
#             json.dumps(payload),
#         )

#         print(
#             f"[publish_update] Event {event_id} -> {status} "
#             f"(subscribers={subscribers})"
#         )

#     except Exception as e:
#         print(f"[publish_update] ERROR: {e}")


def publish_update(
    event_id,
    status,
    attempt=0,
    user_id=None,
    provider=None,
    route=None,
    token=None,
    created_at=None,

    # NEW
    event_type=None,
    latency_ms=None,
    payload_size=None,
    last_error=None,
):
    try:
        payload = {
            "id": event_id,
            "status": status,
            "attempt_count": attempt or 0,

            "user_id": str(user_id) if user_id else None,
            "provider": provider,
            "route": route,
            "token": token,

            "created_at": (
                created_at.isoformat()
                if created_at
                else None
            ),

            # New fields
            "event_type": event_type,
            "latency_ms": latency_ms,
            "payload_size": payload_size,
            "last_error": last_error,
        }

        subscribers = redis_client.publish(
            "events:updates",
            json.dumps(payload),
        )

        print(
            f"[publish_update] "
            f"Event {event_id} -> {status} "
            f"(subscribers={subscribers})"
        )

    except Exception as e:
        print(f"[publish_update] ERROR: {e}")
# =========================
# BATCH PROCESSING
# =========================



# =========================
# EVENT DELIVERY
# =========================
def deliver_event(event_id: int):
    print("🔥 worker started")

    start = time.perf_counter()
    row = None

    db = SessionLocal()

    try:
        # =========================
        # CLAIM EVENT
        # =========================
        print(f"Trying to claim event {event_id}")
        claimed = db.execute(
            
            text("""
                UPDATE webhook_events
                SET status = 'processing'
                WHERE id = :id
                AND status IN ('pending', 'queued', 'retrying')
            """),
            {"id": event_id},

            
        )
        print("claimed rows:", claimed.rowcount)
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
        print("loaded row:", row)
        if not row:
            print(f"[worker] Event {event_id} not found")
            return

        user_id = row["user_id"]

        # Track the current attempt count that will be sent to realtime clients
        current_attempt = row.get("attempt_count") or 0
        payload = row["payload"]
        payload_size = 0
        try:
            payload_size = len(
                json.dumps(payload).encode("utf-8")
            )
        except Exception:
            pass

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

        print("About to call publish_update()")
        publish_update(
            event_id=event_id,
            status="processing",
            attempt=current_attempt,
            user_id=row["user_id"],
            provider=row["provider"],
            route=row["route"],
            token=row["token"],
            created_at=row["created_at"],
            event_type=row["event_type"],
            payload_size=payload_size,
        )
        print("2. publish_update done")
        # =========================
        # AGGREGATION
        # =========================
        try:
            print("3. loading aggregation rules")
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

            print("4. aggregation rules loaded", len(rules))

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

        print("5. before mode check")

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
                            "provider":row["provider"],
                            "event_type":row["event_type"],
                            "created_at":row["created_at"],
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

                events_delivered.labels(
    row.get("provider") or "unknown"
).inc()

                publish_update(
                    event_id=event_id,
                    status="delivered",
                    attempt=current_attempt,
                    user_id=row["user_id"],
                    provider=row["provider"],
                    route=row["route"],
                    token=row["token"],
                    created_at=row["created_at"],

                    event_type=row["event_type"],
                    latency_ms=round(
                        (time.perf_counter() - start) * 1000,
                        2,
                    ),
                    payload_size=payload_size,
                )

                
                return

            except Exception as e:
                print(f"[worker] tunnel error: {e}")

        # =========================
        # DELIVERY TARGETS
        # =========================
        
        print("Calling router...")
        delivery_payload = {
        **payload,
        "event_id": event_id,
}

        result = asyncio.run(
                route_webhook_to_targets(
                    user_id=user_id,
                    webhook_data=delivery_payload,
                    provider=row["provider"],
                )
            )

        print("ROUTER RESULT:", result)

            # =========================
            # SUCCESS / FAILURE
            # =========================
           

        successful = result.get("successful", 0)
        failed = result.get("failed", 0)

            # At least one delivery succeeded
        if successful > 0:

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

            events_delivered.labels(
    row.get("provider") or "unknown"
).inc()

            status = "delivered"

        # All deliveries failed
        elif failed > 0:

            attempts = current_attempt + 1
            current_attempt = attempts

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
                    str(event_id),
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
                            last_error='all delivery targets failed',
                            next_retry_at=:retry_at
                        WHERE id=:id
                    """),
                    {
                        "id": event_id,
                        "attempts": attempts,
                        "retry_at": retry_at,
                    },
                )

                events_retried.labels(
    row.get("provider") or "unknown"
).inc()

                status = "retrying"

            events_failed.labels(
    row.get("provider") or "unknown"
).inc()

        # No delivery targets configured
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

            events_delivered.labels(
    row.get("provider") or "unknown"
).inc()

            status = "delivered"

        db.commit()

        publish_update(
            event_id=event_id,
            status=status,
            attempt=current_attempt,
            user_id=row["user_id"],
            provider=row["provider"],
            route=row["route"],
            token=row["token"],
            created_at=row["created_at"],

            event_type=row["event_type"],
            latency_ms=round(
                (time.perf_counter() - start) * 1000,
                2,
            ),
            payload_size=payload_size,
            last_error=row["last_error"],
        )

    

    finally:
            try:
                if row:
                    delivery_latency.labels(
    row.get("provider") or "unknown"
).observe(
    time.perf_counter() - start
)
            except Exception as e:
                print(f"[worker] metrics error: {e}")

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