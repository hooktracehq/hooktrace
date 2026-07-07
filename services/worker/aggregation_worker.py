

"""
Enhanced Aggregation Worker
Production-ready aggregation + batching engine

Features:
- Time window batching
- Count batching
- Redis-based distributed deduplication
- Distributed flush locking
- Active aggregate registry
- Aggregated lifecycle state
- Queue-safe payload format
"""

import time
import json
import hashlib
from typing import Dict, Any
from sqlalchemy import text

from .database import SessionLocal
from services.shared.redis_client import redis_client


AGG_QUEUE = "webhook:aggregate"
DELIVERY_QUEUE = "webhook:ingress"

ACTIVE_AGGREGATES_KEY = "aggregate:active"

DEDUP_TTL_SECONDS = 300
FLUSH_LOCK_SECONDS = 10


class AggregationWorker:

    def get_aggregation_rule(
        self,
        db,
        route_id: str
    ) -> Dict[str, Any]:

        rule = db.execute(
            text("""
                SELECT 
                    r.id as route_id,
                    ar.id as rule_id,
                    ar.mode,
                    ar.window_ms,
                    ar.max_batch_size,
                    ar.timeout_ms,
                    ar.max_events_per_second,
                    ar.deduplicate,
                    ar.deduplication_key
                FROM webhook_routes r
                LEFT JOIN aggregation_rules ar
                  ON ar.id = r.aggregation_rule_id
                WHERE r.id = :route_id
                AND r.aggregation_enabled = TRUE
            """),
            {"route_id": route_id}
        ).mappings().first()

        return dict(rule) if rule else None

    def calculate_event_hash(
        self,
        payload: dict,
        key_field: str = "id"
    ) -> str:

        if key_field and key_field in payload:
            content = str(payload[key_field])
        else:
            content = json.dumps(
                payload,
                sort_keys=True
            )

        return hashlib.sha256(
            content.encode()
        ).hexdigest()

    def is_duplicate(
        self,
        route_id: str,
        event_hash: str
    ) -> bool:

        dedupe_key = (
            f"dedupe:{route_id}:{event_hash}"
        )

        created = redis_client.set(
            dedupe_key,
            "1",
            ex=DEDUP_TTL_SECONDS,
            nx=True
        )

        return not created

    def buffer_event(
        self,
        event_id: int
    ):
        db = SessionLocal()

        try:
            row = db.execute(
                text("""
                    SELECT 
                        e.id,
                        e.route_id,
                        e.payload
                    FROM webhook_events e
                    WHERE e.id = :id
                """),
                {"id": event_id},
            ).mappings().first()

            if not row:
                print(
                    f"[aggregation] Event {event_id} not found"
                )
                return

            route_id = str(row["route_id"])

            payload = row["payload"]

            if isinstance(payload, str):
                try:
                    payload = json.loads(payload)
                except Exception:
                    payload = {}

            rule = self.get_aggregation_rule(
                db,
                route_id
            )

            # no aggregation rule
            if not rule or not rule.get("rule_id"):

                redis_client.lpush(
                    DELIVERY_QUEUE,
                    json.dumps({
                        "event_id": row["id"],
                        "route_id": route_id,
                    })
                )

                print(
                    f"[aggregation] No rule for route {route_id}, sending directly"
                )

                return

            rule_id = str(rule["rule_id"])

            # distributed dedupe
            if rule.get("deduplicate"):

                event_hash = self.calculate_event_hash(
                    payload,
                    rule.get("deduplication_key")
                )

                if self.is_duplicate(
                    route_id,
                    event_hash
                ):

                    print(
                        f"[aggregation] Duplicate event detected for route {route_id}"
                    )

                    self.update_rule_stats(
                        rule_id,
                        duplicates=1
                    )

                    return

            key = f"aggregate:{route_id}"

            # aggregated lifecycle state
            db.execute(
                text("""
                    UPDATE webhook_events
                    SET status='aggregated'
                    WHERE id=:id
                """),
                {"id": event_id},
            )

            db.commit()

            # add active aggregate registry
            redis_client.sadd(
                ACTIVE_AGGREGATES_KEY,
                key
            )

            redis_client.rpush(
                key,
                json.dumps({
                    "event_id": row["id"],
                    "payload": payload,
                    "rule_id": rule_id,
                })
            )

            # event entered aggregation successfully
            self.update_rule_stats(
            rule_id,
            event_count=1,
)

            # ttl management
            if (
                rule["mode"] == "time_window"
                and rule.get("window_ms")
            ):

                ttl = (
                    int(rule["window_ms"] / 1000)
                    + 1
                )

                redis_client.expire(
                    key,
                    ttl
                )

            elif rule.get("timeout_ms"):

                ttl = (
                    int(rule["timeout_ms"] / 1000)
                    + 1
                )

                redis_client.expire(
                    key,
                    ttl
                )

            print(
                f"[aggregation] Buffered event {event_id} in {key}"
            )

            # count-based flush
            if (
                rule["mode"] == "count"
                and rule.get("max_batch_size")
            ):

                current_size = redis_client.llen(key)

                if current_size >= rule["max_batch_size"]:

                    print(
                        f"[aggregation] Batch size reached for {key}, flushing"
                    )

                    self.flush_single_aggregate(
                        key,
                        rule_id
                    )

        finally:
            db.close()

    def flush_single_aggregate(
        self,
        key: str,
        rule_id: str = None
    ):

        # distributed lock
        lock_key = f"lock:{key}"

        locked = redis_client.set(
            lock_key,
            "1",
            ex=FLUSH_LOCK_SECONDS,
            nx=True
        )

        if not locked:
            return

        try:
            events = redis_client.lrange(
                key,
                0,
                -1
            )

            if not events:
                return

            batch = []

            for e in events:

                if isinstance(e, bytes):
                    e = e.decode()

                batch.append(
                    json.loads(e)
                )

            redis_client.delete(key)

            # remove active registry
            redis_client.srem(
                ACTIVE_AGGREGATES_KEY,
                key
            )

            # queue-safe payload
            redis_client.lpush(
                DELIVERY_QUEUE,
                json.dumps({
                    "batch": True,
                    "events": batch,
                    "route_id": key.split(":")[-1],
                })
            )

            print(
                f"[aggregation] Flushed batch of {len(batch)} events from {key}"
            )

            if rule_id:
                self.update_rule_stats(
                    rule_id,
                    batch_created=True
                )

        finally:
            redis_client.delete(lock_key)

    def flush_aggregates(self):
        """
        Flush ready aggregates
        WITHOUT expensive Redis SCAN
        """

        keys = redis_client.smembers(
            ACTIVE_AGGREGATES_KEY
        )

        for key in keys:

            if isinstance(key, bytes):
                key = key.decode()

            ttl = redis_client.ttl(key)

            if ttl <= 1:

                first_event = redis_client.lindex(
                    key,
                    0
                )

                rule_id = None

                if first_event:

                    try:
                        if isinstance(
                            first_event,
                            bytes
                        ):
                            first_event = (
                                first_event.decode()
                            )

                        data = json.loads(
                            first_event
                        )

                        rule_id = data.get(
                            "rule_id"
                        )

                    except Exception:
                        pass

                self.flush_single_aggregate(
                    key,
                    rule_id
                )

    def update_rule_stats(
        self,
        rule_id: str,
        event_count: int = 0,
        batch_created: bool = False,
        duplicates: int = 0
    ):

        db = SessionLocal()

        try:
            updates = []

            params = {
                "id": rule_id
            }

            if event_count > 0:

                updates.append(
                    """
                    events_processed =
                    events_processed + :event_count
                    """
                )

                params["event_count"] = (
                    event_count
                )

            if batch_created:

                updates.append(
                    """
                    batches_created =
                    batches_created + 1
                    """
                )

            if duplicates > 0:

                updates.append(
                    """
                    duplicates_skipped =
                    duplicates_skipped + :duplicates
                    """
                )

                params["duplicates"] = (
                    duplicates
                )

            if updates:

                updates.append(
                    """
                    last_triggered =
                    CURRENT_TIMESTAMP
                    """
                )

                query = f"""
                    UPDATE aggregation_rules
                    SET {', '.join(updates)}
                    WHERE id = :id
                """

                db.execute(
                    text(query),
                    params
                )

                db.commit()

        finally:
            db.close()

    def run(self):

        print(
            "[aggregation-worker] Production aggregation worker started"
        )

        print(
            "[aggregation-worker] Features: batching, distributed dedupe, locking"
        )

        while True:

            try:
                result = redis_client.brpop(
                    AGG_QUEUE,
                    timeout=5
                )

                # periodic flush cycle
                if not result:

                    self.flush_aggregates()

                    time.sleep(0.1)

                    continue

                _, raw = result

                # standardized payload
                if isinstance(raw, bytes):
                    raw = raw.decode()

                data = json.loads(raw)

                event_id = int(
                    data["event_id"]
                )

                print(
                    f"[aggregation-worker] Processing event {event_id}"
                )

                self.buffer_event(event_id)

                self.flush_aggregates()

            except Exception as e:

                print(
                    f"[aggregation-worker] Error: {e}"
                )

                time.sleep(1)


def main():

    worker = AggregationWorker()

    worker.run()


if __name__ == "__main__":
    main()