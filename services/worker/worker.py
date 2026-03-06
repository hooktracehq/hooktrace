import requests
import time
import json
from datetime import datetime, timedelta
from threading import Thread

from sqlalchemy import text
from database import SessionLocal
from redis_client import redis_client

from prometheus_client import start_http_server

from metrics import (
    events_delivered,
    events_failed,
    events_retried,
    delivery_latency,
)

# Redis queues
QUEUE_MAIN = "webhook:queue"
QUEUE_RETRY = "webhook:retry"
QUEUE_DLQ = "webhook:dlq"

BASE_DELAY_SECONDS = 5


def publish_update(event_id: int, status: str, attempt: int = 0):
    redis_client.publish(
        "events:updates",
        json.dumps({
            "event_id": event_id,
            "status": status,
            "attempt_count": attempt,
        })
    )


def deliver_event(event_id: int):
    db = SessionLocal()

    try:
        event = db.execute(
            text("SELECT * FROM webhook_events WHERE id = :id"),
            {"id": event_id},
        ).mappings().first()

        if not event:
            print(f"[worker] Event {event_id} not found")
            return

        route_config = db.execute(
            text("""
                SELECT mode, dev_target, prod_target
                FROM webhook_routes
                WHERE token = :token AND route = :route
            """),
            {
                "token": event["token"],
                "route": event["route"],
            },
        ).mappings().first()

        if not route_config:
            print(f"[worker] No route config for event {event_id}")
            return

        destination_url = (
            route_config["dev_target"]
            if route_config["mode"] == "dev"
            else route_config["prod_target"]
        )

        if not destination_url:
            print(f"[worker] No delivery target for event {event_id}")
            return

        try:
            with delivery_latency.time():
                resp = requests.post(
                    destination_url,
                    json=event["payload"],
                    headers=event["headers"],
                    timeout=10,
                )

            if resp.status_code < 300:
                db.execute(
                    text("UPDATE webhook_events SET status = 'delivered' WHERE id = :id"),
                    {"id": event_id},
                )
                db.commit()
                events_delivered.inc()
                publish_update(event_id, "delivered", event.get("attempt_count", 0))
                print(f"[worker] Event {event_id} → delivered")
                return

            raise Exception(f"HTTP {resp.status_code}")

        except Exception as e:
            attempt = (event.get("attempt_count") or 0) + 1
            max_retries = event.get("max_retries", 5)

            if attempt < max_retries:
                print(f"[worker] Event {event_id} retry {attempt}/{max_retries}")
                db.execute(
                    text("UPDATE webhook_events SET last_error = :error WHERE id = :id"),
                    {"error": str(e), "id": event_id},
                )
                schedule_retry(db, event_id, attempt)
                redis_client.lpush(QUEUE_RETRY, str(event_id))
                events_retried.inc()
                publish_update(event_id, "retrying", attempt)

            else:
                print(f"[worker] Event {event_id} → DLQ")
                db.execute(
                    text("""
                        UPDATE webhook_events
                        SET status = 'failed', last_error = :error
                        WHERE id = :id
                    """),
                    {"error": str(e), "id": event_id},
                )
                db.commit()
                redis_client.lpush(QUEUE_DLQ, str(event_id))
                events_failed.inc()
                publish_update(event_id, "failed", attempt)

    finally:
        db.close()


def schedule_retry(db, event_id: int, attempt: int):
    delay = BASE_DELAY_SECONDS * (2 ** (attempt - 1))
    next_retry_at = datetime.utcnow() + timedelta(seconds=delay)

    db.execute(
        text("""
            UPDATE webhook_events
            SET attempt_count = :attempt,
                next_retry_at = :next_retry_at,
                status = 'pending'
            WHERE id = :id
        """),
        {"attempt": attempt, "next_retry_at": next_retry_at, "id": event_id},
    )
    db.commit()


def retry_scheduler():
    print("[worker] retry scheduler started")

    while True:
        db = SessionLocal()
        try:
            rows = db.execute(
                text("""
                    SELECT id FROM webhook_events
                    WHERE status = 'pending'
                    AND next_retry_at IS NOT NULL
                    AND next_retry_at <= NOW()
                """)
            ).fetchall()

            for row in rows:
                redis_client.lpush(QUEUE_MAIN, str(row.id))
                db.execute(
                    text("UPDATE webhook_events SET next_retry_at = NULL WHERE id = :id"),
                    {"id": row.id},
                )
            db.commit()
        finally:
            db.close()

        time.sleep(5)


def wait_for_services(retries=15, delay=3):
    for i in range(retries):
        try:
            db = SessionLocal()
            db.execute(text("SELECT 1"))
            db.close()
            redis_client.ping()
            print("[worker] connections established")
            return
        except Exception as e:
            print(f"[worker] waiting for services... ({i+1}/{retries}): {e}")
            time.sleep(delay)
    raise RuntimeError("[worker] Could not connect to services after retries")


def main():
    wait_for_services()

    print("[worker] started, waiting for events...")
    start_http_server(8001)
    print("[worker] metrics available on :8001/metrics")

    Thread(target=retry_scheduler, daemon=True).start()

    while True:
        try:
            result = redis_client.brpop(QUEUE_MAIN, timeout=30)
            if result is None:
                continue
            _, event_id = result
            deliver_event(int(event_id))
        except Exception as e:
            print(f"[worker] Redis error, reconnecting: {e}")
            time.sleep(2)


if __name__ == "__main__":
    main()