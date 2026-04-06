# # import time
# # import json
# # from sqlalchemy import text

# # from database import SessionLocal
# # from redis_client import redis_client

# # AGG_QUEUE = "webhook:aggregate"
# # DELIVERY_QUEUE = "webhook:queue"


# # def buffer_event(event_id):
# #     db = SessionLocal()

# #     try:
# #         row = db.execute(
# #             text("""
# #                 SELECT 
# #                     e.id,
# #                     e.route_id,
# #                     e.payload,
# #                     r.aggregation_enabled,
# #                     r.aggregation_window_ms
# #                 FROM webhook_events e
# #                 JOIN webhook_routes r ON r.id = e.route_id
# #                 WHERE e.id = :id
# #             """),
# #             {"id": event_id},
# #         ).mappings().first()

# #         if not row:
# #             return

# #         if not row["aggregation_enabled"]:
# #             redis_client.lpush(DELIVERY_QUEUE, event_id)
# #             return

# #         key = f"aggregate:{row['route_id']}"

# #         redis_client.rpush(
# #             key,
# #             json.dumps({
# #                 "event_id": row["id"],
# #                 "payload": row["payload"]
# #             })
# #         )

# #         redis_client.expire(
# #             key,
# #             int(row["aggregation_window_ms"] / 1000) + 1
# #         )

# #     finally:
# #         db.close()


# # def flush_aggregates():
# #     keys = redis_client.keys("aggregate:*")

# #     for key in keys:

# #         events = redis_client.lrange(key, 0, -1)

# #         if not events:
# #             continue

# #         batch = [json.loads(e) for e in events]

# #         redis_client.delete(key)

# #         redis_client.lpush(
# #             DELIVERY_QUEUE,
# #             json.dumps({
# #                 "batch": True,
# #                 "events": batch
# #             })
# #         )


# # def main():

# #     print("[aggregation-worker] started")

# #     while True:

# #         result = redis_client.brpop(AGG_QUEUE, timeout=5)

# #         if result:
# #             _, event_id = result
# #             buffer_event(int(event_id))

# #         flush_aggregates()

# #         time.sleep(1)


# # if __name__ == "__main__":
# #     main()







# import time
# import json
# from sqlalchemy import text

# from database import SessionLocal
# from redis_client import redis_client


# AGG_QUEUE = "webhook:aggregate"
# DELIVERY_QUEUE = "webhook:queue"


# def buffer_event(event_id):
#     db = SessionLocal()

#     try:
#         row = db.execute(
#             text("""
#                 SELECT 
#                     e.id,
#                     e.route_id,
#                     e.payload,
#                     r.aggregation_enabled,
#                     r.aggregation_window_ms
#                 FROM webhook_events e
#                 JOIN webhook_routes r ON r.id = e.route_id
#                 WHERE e.id = :id
#             """),
#             {"id": event_id},
#         ).mappings().first()

#         if not row:
#             return

#         # If aggregation disabled → send directly
#         if not row["aggregation_enabled"]:
#             redis_client.lpush(DELIVERY_QUEUE, json.dumps({
#                 "event_id": row["id"],
#                 "payload": row["payload"]
#             }))
#             return

#         key = f"aggregate:{row['route_id']}"

#         redis_client.rpush(
#             key,
#             json.dumps({
#                 "event_id": row["id"],
#                 "payload": row["payload"]
#             })
#         )

#         # aggregation window
#         redis_client.expire(
#             key,
#             max(1, int(row["aggregation_window_ms"] / 1000))
#         )

#     finally:
#         db.close()


# def flush_aggregates():

#     cursor = 0

#     while True:

#         cursor, keys = redis_client.scan(
#             cursor=cursor,
#             match="aggregate:*",
#             count=100
#         )

#         for key in keys:

#             events = redis_client.lrange(key, 0, -1)

#             if not events:
#                 continue

#             batch = []

#             for e in events:
#                 if isinstance(e, bytes):
#                     e = e.decode()

#                 batch.append(json.loads(e))

#             redis_client.delete(key)

#             redis_client.lpush(
#                 DELIVERY_QUEUE,
#                 json.dumps({
#                     "batch": True,
#                     "events": batch
#                 })
#             )

#         if cursor == 0:
#             break


# def main():

#     print("[aggregation-worker] started")

#     while True:

#         result = redis_client.brpop(AGG_QUEUE, timeout=5)

#         if result:
#             _, event_id = result

#             if isinstance(event_id, bytes):
#                 event_id = event_id.decode()

#             buffer_event(int(event_id))

#         flush_aggregates()

#         time.sleep(1)


# if __name__ == "__main__":
#     main()








"""
Enhanced Aggregation Worker
Integrates with aggregation_rules API
Supports: time windows, count-based, rate limiting, deduplication
"""

import time
import json
import hashlib
from typing import Dict, Any, Set
from sqlalchemy import text

from .database import SessionLocal
from ..api.redis_client import redis_client

AGG_QUEUE = "webhook:aggregate"
DELIVERY_QUEUE = "webhook:queue"


class AggregationWorker:
    """Enhanced aggregation worker with rule-based processing"""
    
    def __init__(self):
        self.seen_hashes: Dict[str, Set[str]] = {}  # route_id -> set of hashes
    
    def get_aggregation_rule(self, db, route_id: str) -> Dict[str, Any]:
        """Get aggregation rule for a route"""
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
                LEFT JOIN aggregation_rules ar ON ar.id = r.aggregation_rule_id
                WHERE r.id = :route_id AND r.aggregation_enabled = TRUE
            """),
            {"route_id": route_id}
        ).mappings().first()
        
        return dict(rule) if rule else None
    
    def calculate_event_hash(self, payload: dict, key_field: str = "id") -> str:
        """Calculate hash for deduplication"""
        # Use specific field or entire payload
        if key_field and key_field in payload:
            content = str(payload[key_field])
        else:
            content = json.dumps(payload, sort_keys=True)
        
        return hashlib.sha256(content.encode()).hexdigest()
    
    def is_duplicate(self, route_id: str, event_hash: str) -> bool:
        """Check if event is duplicate"""
        if route_id not in self.seen_hashes:
            self.seen_hashes[route_id] = set()
        
        if event_hash in self.seen_hashes[route_id]:
            return True
        
        # Add to seen hashes
        self.seen_hashes[route_id].add(event_hash)
        
        # Limit memory - keep only last 10,000 hashes per route
        if len(self.seen_hashes[route_id]) > 10000:
            # Remove oldest (simplified - in production use LRU)
            self.seen_hashes[route_id] = set(list(self.seen_hashes[route_id])[-5000:])
        
        return False
    
    def buffer_event(self, event_id: int):
        """Buffer event for aggregation"""
        db = SessionLocal()
        
        try:
            # Get event and route info
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
                print(f"[aggregation] Event {event_id} not found")
                return
            
            route_id = str(row["route_id"])
            payload = row["payload"]
            
            # Get aggregation rule
            rule = self.get_aggregation_rule(db, route_id)
            
            if not rule or not rule.get("rule_id"):
                # No aggregation, send directly
                redis_client.lpush(DELIVERY_QUEUE, str(event_id))
                print(f"[aggregation] No rule for route {route_id}, sending directly")
                return
            
            rule_id = str(rule["rule_id"])
            
            # Check for duplicates
            duplicates_skipped = 0
            if rule.get("deduplicate"):
                event_hash = self.calculate_event_hash(
                    payload, 
                    rule.get("deduplication_key")
                )
                
                if self.is_duplicate(route_id, event_hash):
                    print(f"[aggregation] Duplicate event detected for route {route_id}")
                    duplicates_skipped = 1
                    
                    # Update stats
                    self.update_rule_stats(rule_id, duplicates=1)
                    return
            
            # Buffer event in Redis
            key = f"aggregate:{route_id}"
            
            redis_client.rpush(
                key,
                json.dumps({
                    "event_id": row["id"],
                    "payload": payload,
                    "rule_id": rule_id,
                })
            )
            
            # Set expiration based on mode
            if rule["mode"] == "time_window" and rule.get("window_ms"):
                ttl = int(rule["window_ms"] / 1000) + 1
                redis_client.expire(key, ttl)
            elif rule.get("timeout_ms"):
                ttl = int(rule["timeout_ms"] / 1000) + 1
                redis_client.expire(key, ttl)
            
            print(f"[aggregation] Buffered event {event_id} in {key}")
            
            # Check if we should flush based on count
            if rule["mode"] == "count" and rule.get("max_batch_size"):
                current_size = redis_client.llen(key)
                if current_size >= rule["max_batch_size"]:
                    print(f"[aggregation] Batch size reached for {key}, flushing")
                    self.flush_single_aggregate(key, rule_id)
        
        finally:
            db.close()
    
    def flush_single_aggregate(self, key: str, rule_id: str = None):
        """Flush a single aggregate buffer"""
        events = redis_client.lrange(key, 0, -1)
        
        if not events:
            return
        
        batch = [json.loads(e) for e in events]
        
        # Clear the buffer
        redis_client.delete(key)
        
        # Send batch to delivery queue
        redis_client.lpush(
            DELIVERY_QUEUE,
            json.dumps({
                "batch": True,
                "events": batch,
                "route_id": key.split(":")[-1],
            })
        )
        
        print(f"[aggregation] Flushed batch of {len(batch)} events from {key}")
        
        # Update stats
        if rule_id:
            self.update_rule_stats(
                rule_id, 
                event_count=len(batch),
                batch_created=True
            )
    
    def flush_aggregates(self):
     """Flush expired or ready aggregates safely"""

    cursor = 0

    while True:
        cursor, keys = redis_client.scan(
            cursor=cursor,
            match="aggregate:*",
            count=100
        )

        for key in keys:

            if isinstance(key, bytes):
                key = key.decode()

            ttl = redis_client.ttl(key)

            if ttl <= 1:
                first_event = redis_client.lindex(key, 0)
                rule_id = None

                if first_event:
                    try:
                        if isinstance(first_event, bytes):
                            first_event = first_event.decode()

                        data = json.loads(first_event)
                        rule_id = data.get("rule_id")
                    except Exception:
                        pass

                self.flush_single_aggregate(key, rule_id)

        if cursor == 0:
            break
    def update_rule_stats(
        self, 
        rule_id: str, 
        event_count: int = 0,
        batch_created: bool = False,
        duplicates: int = 0
    ):
        """Update aggregation rule statistics"""
        db = SessionLocal()
        try:
            updates = []
            params = {"id": rule_id}
            
            if event_count > 0:
                updates.append("events_processed = events_processed + :event_count")
                params["event_count"] = event_count
            
            if batch_created:
                updates.append("batches_created = batches_created + 1")
            
            if duplicates > 0:
                updates.append("duplicates_skipped = duplicates_skipped + :duplicates")
                params["duplicates"] = duplicates
            
            if updates:
                updates.append("last_triggered = CURRENT_TIMESTAMP")
                query = f"""
                    UPDATE aggregation_rules
                    SET {', '.join(updates)}
                    WHERE id = :id
                """
                db.execute(text(query), params)
                db.commit()
        except Exception as e:
            print(f"[aggregation] Error updating stats: {e}")
        finally:
            db.close()
    
    def run(self):
        """Main worker loop"""
        print("[aggregation-worker] Enhanced worker started")
        print("[aggregation-worker] Features: time_window, count, deduplication")
        
        while True:
            try:
                # Wait for new events
                result = redis_client.brpop(AGG_QUEUE, timeout=5)
                
                if result:
                    _, event_id = result
                    self.buffer_event(int(event_id))
                
                # Check for expired aggregates
                self.flush_aggregates()
                
                time.sleep(0.1)  # Small delay to prevent CPU spin
                
            except Exception as e:
                print(f"[aggregation-worker] Error: {e}")
                time.sleep(1)





def load_aggregation_rules():
    db = SessionLocal()

    try:
        rules = db.execute(
            text("""
                SELECT
                    id,
                    provider,
                    event_patterns,
                    mode,
                    window_ms,
                    max_batch_size,
                    timeout_ms,
                    max_events_per_second,
                    deduplicate,
                    deduplication_key
                FROM aggregation_rules
                WHERE enabled = TRUE
            """)
        ).mappings().all()

        return [dict(r) for r in rules]

    finally:
        db.close()










def main():
    """Start the enhanced aggregation worker"""
    worker = AggregationWorker()
    worker.run()


if __name__ == "__main__":
    main()