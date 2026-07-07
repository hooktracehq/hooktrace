from sqlalchemy import text

from services.api.database import SessionLocal
from services.shared.redis_client import redis_client
import json

INGRESS_QUEUE = "webhook:ingress"
AGGREGATION_QUEUE = "webhook:aggregate"


async def dispatch_webhook(webhook_event):
    event_id = webhook_event.get("id")

    if not event_id:
        print("[dispatcher] Missing event_id")
        return

    db = SessionLocal()

    try:
        event = db.execute(
            text("""
                SELECT
                    e.route_id,
                    r.aggregation_enabled,
                    r.aggregation_rule_id
                FROM webhook_events e
                JOIN webhook_routes r
                  ON r.id = e.route_id
                WHERE e.id = :id
            """),
            {
                "id": event_id,
            },
        ).mappings().first()

        if not event:
            print(f"[dispatcher] Event {event_id} not found")
            return

        payload = {
            "event_id": event_id,
            "route_id": str(event["route_id"]),
        }

        if (
            event["aggregation_enabled"]
            and event["aggregation_rule_id"]
        ):
            redis_client.lpush(
                AGGREGATION_QUEUE,
                json.dumps(payload),
            )

            print(
                f"[dispatcher] queued {event_id} -> aggregation"
            )

        else:
            redis_client.lpush(
                INGRESS_QUEUE,
                json.dumps(payload),
            )

            print(
                f"[dispatcher] queued {event_id} -> delivery"
            )

    finally:
        db.close()