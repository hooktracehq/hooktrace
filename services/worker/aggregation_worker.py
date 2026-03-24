import time
import json
from sqlalchemy import text

from database import SessionLocal
from redis_client import redis_client

AGG_QUEUE = "webhook:aggregate"
DELIVERY_QUEUE = "webhook:queue"


def buffer_event(event_id):
    db = SessionLocal()

    try:
        row = db.execute(
            text("""
                SELECT 
                    e.id,
                    e.route_id,
                    e.payload,
                    r.aggregation_enabled,
                    r.aggregation_window_ms
                FROM webhook_events e
                JOIN webhook_routes r ON r.id = e.route_id
                WHERE e.id = :id
            """),
            {"id": event_id},
        ).mappings().first()

        if not row:
            return

        if not row["aggregation_enabled"]:
            redis_client.lpush(DELIVERY_QUEUE, event_id)
            return

        key = f"aggregate:{row['route_id']}"

        redis_client.rpush(
            key,
            json.dumps({
                "event_id": row["id"],
                "payload": row["payload"]
            })
        )

        redis_client.expire(
            key,
            int(row["aggregation_window_ms"] / 1000) + 1
        )

    finally:
        db.close()


def flush_aggregates():
    keys = redis_client.keys("aggregate:*")

    for key in keys:

        events = redis_client.lrange(key, 0, -1)

        if not events:
            continue

        batch = [json.loads(e) for e in events]

        redis_client.delete(key)

        redis_client.lpush(
            DELIVERY_QUEUE,
            json.dumps({
                "batch": True,
                "events": batch
            })
        )


def main():

    print("[aggregation-worker] started")

    while True:

        result = redis_client.brpop(AGG_QUEUE, timeout=5)

        if result:
            _, event_id = result
            buffer_event(int(event_id))

        flush_aggregates()

        time.sleep(1)


if __name__ == "__main__":
    main()