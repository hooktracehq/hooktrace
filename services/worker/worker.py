

# import time
# import json
# from threading import Thread
# from sqlalchemy import text

# from .database import SessionLocal
# from ..api.redis_client import redis_client
# from .retry_policy import next_retry_time

# from prometheus_client import start_http_server

# from .metrics import (
#     events_delivered,
#     events_failed,
#     events_retried,
#     delivery_latency,
# )

# # ROUTER
# from .delivery_targets_router import route_webhook_to_targets


# QUEUE_MAIN = "webhook:queue"
# QUEUE_RETRY = "webhook:retry"
# QUEUE_DLQ = "webhook:dlq"


# # =========================
# # BATCH PROCESSING HELPERS
# # =========================
# def push_to_batch(rule_id, event_id, payload):
#     key = f"agg:{rule_id}"

#     data = {
#         "event_id": event_id,
#         "payload": payload,
#         "ts": int(time.time() * 1000)
#     }

#     redis_client.rpush(key, json.dumps(data))
#     redis_client.expire(key, 120)



# # =========================
# # HELPER: MATCH EVENT
# # =========================
# def match_event(rule, payload, provider):
#     try:
#         patterns = rule["event_patterns"]

#         if isinstance(patterns, str):
#             patterns = json.loads(patterns)

#         if rule["provider"] and provider:
#          if rule["provider"] != provider:
#           return False

#         event_type = payload.get("type")

#         if "*" in patterns:
#             return True

#         return event_type in patterns

#     except Exception:
#         return False


# def publish_update(event_id: int, status: str, attempt: int = 0):
#     redis_client.publish(
#         "events:updates",
#         json.dumps({
#             "event_id": event_id,
#             "status": status,
#             "attempt_count": attempt,
#         })
#     )

# def process_batch(rule_id, items, db):

#     decoded_items = [
#         json.loads(i.decode() if isinstance(i, bytes) else i)
#         for i in items
#     ]

#     size = len(decoded_items)

#     db.execute(
#         text("""
#             UPDATE aggregation_rules
#             SET 
#                 batches_created = batches_created + 1,
#                 events_processed = events_processed + :count,
#                 last_triggered = NOW()
#             WHERE id = :id
#         """),
#         {
#             "id": rule_id,
#             "count": size
#         }
#     )

#     print(f"[worker] batch created for rule {rule_id} with {size} events")

# def process_batches():
#     print("[worker] batch processor started")

#     while True:
#         db = SessionLocal()

#         try:
#             rules = db.execute(
#                 text("""
#                     SELECT id, window_ms, max_batch_size
#                     FROM aggregation_rules
#                     WHERE enabled = TRUE
#                 """)
#             ).mappings().all()

#             for rule in rules:

#                 key = f"agg:{rule['id']}"
#                 items = redis_client.lrange(key, 0, -1)

#                 if not items:
#                     print(f"[batch] rule={rule['id']} items=0")
#                     continue

#                 window_ms = rule.get("window_ms") or 0
#                 max_size = rule.get("max_batch_size") or 50

#                 # ✅ SAFE decode
#                 raw = items[0]
#                 if isinstance(raw, bytes):
#                     raw = raw.decode()

#                 first = json.loads(raw)

#                 now = int(time.time() * 1000)
#                 time_passed = now - first["ts"]

#                 print(f"[batch] rule={rule['id']} items={len(items)} time_passed={time_passed}")

#                 #  TIME trigger (PRIMARY)
#                 if window_ms > 0 and time_passed >= window_ms:
#                     process_batch(rule["id"], items, db)
#                     redis_client.delete(key)
#                     continue

#                 #  SIZE trigger
#                 if len(items) >= max_size:
#                     process_batch(rule["id"], items, db)
#                     redis_client.delete(key)
#                     continue

#                 #  FALLBACK (low traffic safety)
#                 if time_passed > 10000:
#                     process_batch(rule["id"], items, db)
#                     redis_client.delete(key)
#                     continue

#             db.commit()

#         except Exception as e:
#             print(f"[worker] batch error: {e}")

#         finally:
#             db.close()

#         time.sleep(2)

# # =========================
# # CORE WORKER LOGIC
# # =========================
# def deliver_event(event_id: int):

#     db = SessionLocal()

#     try:

#         row = db.execute(
#             text("""
#                 SELECT 
#                     e.*,
#                     r.id as route_id,
#                     r.token,
#                     r.route,
#                     r.mode,
#                     r.dev_target,
#                     r.prod_target,
#                     r.user_id,
#                     r.tunnel_id
#                 FROM webhook_events e
#                 JOIN webhook_routes r ON r.id = e.route_id
#                 WHERE e.id = :id
#             """),
#             {"id": event_id},
#         ).mappings().first()

#         if not row:
#             print(f"[worker] Event {event_id} not found")
#             return

#         user_id = row["user_id"]

#         # Parse payload
#         payload = row["payload"]
#         if isinstance(payload, str):
#             try:
#                 payload = json.loads(payload)
#             except Exception:
#                 payload = {}

#         # Parse headers
#         headers = row["headers"]
#         if isinstance(headers, str):
#             try:
#                 headers = json.loads(headers)
#             except Exception:
#                 headers = {}

#         # =========================
#         # AGGREGATION ENGINE 
#         # =========================
#         try:
#             rules = db.execute(
#                 text("""
#                     SELECT id, event_patterns, provider
#                     FROM aggregation_rules
#                     WHERE user_id = :user_id AND enabled = TRUE
#                 """),
#                 {"user_id": user_id}
#             ).mappings().all()

#             for rule in rules:
#                 print(f"[agg] checking rule {rule['id']} for event {event_id}")
#                 if match_event(rule, payload, row["provider"]):
#                     print(f"[agg] MATCHED → pushing to batch {rule['id']}")

#                     push_to_batch(rule["id"], event_id, payload)
#                 else:
#                     print(f"[agg] NOT MATCHED")
#             db.commit()

#         except Exception as e:
#             print(f"[worker] aggregation error: {e}")

#         # =========================
#         # DEV MODE (LOCAL FORWARD)
#         # =========================
#         if row["mode"] == "dev":

#             try:
#                 start = time.time()

#                 redis_client.publish(
#                     f"tunnel:{row['token']}",
#                     json.dumps({
#                         "headers": headers,
#                         "payload": payload,
#                         "route": row["route"],
#                         "event_id": event_id
#                     })
#                 )

#                 duration_ms = int((time.time() - start) * 1000)

#                 try:
#                     db.execute(
#                         text("""
#                             INSERT INTO tunnel_logs (
#                                 id,
#                                 tunnel_id,
#                                 method,
#                                 path,
#                                 status_code,
#                                 duration_ms,
#                                 provider,
#                                 event_type,
#                                 request_headers,
#                                 request_body,
#                                 response_status,
#                                 response_body,
#                                 error
#                             )
#                             VALUES (
#                                 gen_random_uuid(),
#                                 :tunnel_id,
#                                 :method,
#                                 :path,
#                                 200,
#                                 :duration_ms,
#                                 :provider,
#                                 :event_type,
#                                 :headers,
#                                 :payload,
#                                 200,
#                                 '',
#                                 NULL
#                             )
#                         """),
#                         {
#                             "tunnel_id": row["tunnel_id"],
#                             "method": "POST",
#                             "path": row["route"],
#                             "duration_ms": duration_ms,
#                             "provider": row.get("provider"),
#                             "event_type": payload.get("type") if isinstance(payload, dict) else None,
#                             "headers": json.dumps(headers),
#                             "payload": json.dumps(payload),
#                         }
#                     )

#                     db.execute(
#                         text("""
#                             UPDATE dev_tunnels
#                             SET request_count = request_count + 1,
#                                 last_used = NOW()
#                             WHERE id = :id
#                         """),
#                         {"id": row["tunnel_id"]}
#                     )

#                 except Exception as log_error:
#                     print(f"[worker] logging failed: {log_error}")

#                 db.execute(
#                     text("UPDATE webhook_events SET status='delivered' WHERE id=:id"),
#                     {"id": event_id},
#                 )

#                 db.commit()

#                 events_delivered.inc()

#                 publish_update(event_id, "delivered", row.get("attempt_count", 0))

#                 print(f"[worker] forwarded event {event_id} to dev tunnel")

#                 return

#             except Exception as e:
#                 print(f"[worker] tunnel forwarding failed: {e}")

#         # =========================
#         # DELIVERY TARGET ROUTER
#         # =========================
#      try:

#          result = route_webhook_to_targets(
#          user_id=user_id,
#          webhook_data=payload,
#          provider=row["provider"]
#     )

#     # =========================
#     # DELIVERY LOGS (FIXED POSITION)
#     # =========================
#     try:
#         if "details" in result:
#             for log in result["details"]:
#                 success = log.get("success", False)

#                 db.execute(
#                     text("""
#                         INSERT INTO delivery_logs (
#                             event_id, target_id, status, status_code, response, attempt
#                         )
#                         VALUES (:event_id, :target_id, :status, :status_code, :response, :attempt)
#                     """),
#                     {
#                         "event_id": event_id,
#                         "target_id": log.get("target_id"),
#                         "status": "success" if success else "failed",
#                         "status_code": None,
#                         "response": (
#                             json.dumps(log.get("result"))
#                             if success
#                             else log.get("error")
#                         ),
#                         "attempt": 1,
#                     }
#                 )
#     except Exception as log_err:
#         print(f"[worker] delivery log error: {log_err}")

#     # =========================
#     # ORIGINAL LOGIC (UNCHANGED)
#     # =========================
#     if result["failed"] > 0:
#         db.execute(
#             text("""
#                 UPDATE webhook_events
#                 SET status='failed', last_error='multi-target failure'
#                 WHERE id=:id
#             """),
#             {"id": event_id},
#         )
#         events_failed.inc()

#     else:
#         db.execute(
#             text("UPDATE webhook_events SET status='delivered' WHERE id=:id"),
#             {"id": event_id},
#         )
#         events_delivered.inc()

#     db.commit()

#     publish_update(event_id, "delivered", row.get("attempt_count", 0))

#     print(
#         f"[worker] delivered event {event_id} "
#         f"to {result['successful']} targets "
#         f"({result['failed']} failed)"
#     )

# except Exception as e:
#      print(f"[worker] delivery router error: {e}")

#     db.execute(
#         text("""
#             UPDATE webhook_events
#             SET status='failed', last_error=:error
#             WHERE id=:id
#         """),
#         {"id": event_id, "error": str(e)},
#     )

#     db.commit()
#     events_failed.inc()
# # =========================
# # RETRY SYSTEM
# # =========================
# def retry_scheduler():
#     print("[worker] retry scheduler started")

#     while True:
#         db = SessionLocal()

#         try:
#             rows = db.execute(
#                 text("""
#                     SELECT id FROM webhook_events
#                     WHERE status='pending'
#                     AND next_retry_at IS NOT NULL
#                     AND next_retry_at <= NOW()
#                 """)
#             ).fetchall()

#             for row in rows:
#                 redis_client.lpush(QUEUE_MAIN, str(row.id))

#                 db.execute(
#                     text("UPDATE webhook_events SET next_retry_at=NULL WHERE id=:id"),
#                     {"id": row.id},
#                 )

#             db.commit()

#         finally:
#             db.close()

#         time.sleep(5)


# def wait_for_services(retries=15, delay=3):
#     for i in range(retries):
#         try:
#             db = SessionLocal()
#             db.execute(text("SELECT 1"))
#             db.close()

#             redis_client.ping()

#             print("[worker] connections established")
#             return

#         except Exception as e:
#             print(f"[worker] waiting for services... ({i+1}/{retries}): {e}")
#             time.sleep(delay)

#     raise RuntimeError("[worker] Could not connect to services")


# async def log_delivery(conn, event_id, target_id, status, status_code, response, attempt):
#     await conn.execute("""
#         INSERT INTO delivery_logs (
#             event_id, target_id, status, status_code, response, attempt
#         )
#         VALUES ($1, $2, $3, $4, $5, $6)
#     """, event_id, target_id, status, status_code, response, attempt)
# def main():
#     wait_for_services()

#     print("[worker] started, waiting for events...")

#     start_http_server(8001)
#     print("[worker] metrics available on :8001/metrics")

#     Thread(target=retry_scheduler, daemon=True).start()

#     while True:
#         try:
#             result = redis_client.brpop(QUEUE_MAIN, timeout=30)

#             if result is None:
#                 continue

#             _, raw_event = result

#             try:
#                 data = json.loads(raw_event)

#                 if isinstance(data, dict) and data.get("batch"):
#                     for ev in data["events"]:
#                         deliver_event(ev["event_id"])
#                 else:
#                     deliver_event(int(raw_event))

#             except Exception:
#                 deliver_event(int(raw_event))

#         except Exception as e:
#             print(f"[worker] Redis error: {e}")
#             time.sleep(2)


# if __name__ == "__main__":
#     Thread(target=process_batches, daemon=True).start()
#     main()








# import time
# import json
# import asyncio
# from threading import Thread
# from sqlalchemy import text

# from .database import SessionLocal
# from ..api.redis_client import redis_client
# from .retry_policy import next_retry_time

# from prometheus_client import start_http_server

# from .metrics import (
#     events_delivered,
#     events_failed,
#     events_retried,
#     delivery_latency,
# )

# from .delivery_targets_router import route_webhook_to_targets
# from ..ws import manager 

# QUEUE_MAIN = "webhook:queue"
# QUEUE_RETRY = "webhook:retry"
# QUEUE_DLQ = "webhook:dlq"


# # =========================
# # BATCH HELPERS
# # =========================
# def push_to_batch(rule_id, event_id, payload):
#     key = f"agg:{rule_id}"

#     data = {
#         "event_id": event_id,
#         "payload": payload,
#         "ts": int(time.time() * 1000),
#     }

#     redis_client.rpush(key, json.dumps(data))
#     redis_client.expire(key, 120)


# def match_event(rule, payload, provider):
#     try:
#         patterns = rule["event_patterns"]

#         if isinstance(patterns, str):
#             patterns = json.loads(patterns)

#         if rule["provider"] and provider:
#             if rule["provider"] != provider:
#                 return False

#         event_type = payload.get("type")

#         if "*" in patterns:
#             return True

#         return event_type in patterns

#     except Exception:
#         return False


# def publish_update(event_id: int, status: str, attempt: int = 0):
#     redis_client.publish(
#         "events:updates",
#         json.dumps(
#             {
#                 "event_id": event_id,
#                 "status": status,
#                 "attempt_count": attempt,
#             }
#         ),
#     )


# def process_batch(rule_id, items, db):
#     decoded_items = [
#         json.loads(i.decode() if isinstance(i, bytes) else i) for i in items
#     ]

#     size = len(decoded_items)

#     db.execute(
#         text(
#             """
#             UPDATE aggregation_rules
#             SET 
#                 batches_created = batches_created + 1,
#                 events_processed = events_processed + :count,
#                 last_triggered = NOW()
#             WHERE id = :id
#         """
#         ),
#         {"id": rule_id, "count": size},
#     )

#     print(f"[worker] batch created for rule {rule_id} with {size} events")


# def process_batches():
#     print("[worker] batch processor started")

#     while True:
#         db = SessionLocal()

#         try:
#             rules = db.execute(
#                 text(
#                     """
#                     SELECT id, window_ms, max_batch_size
#                     FROM aggregation_rules
#                     WHERE enabled = TRUE
#                 """
#                 )
#             ).mappings().all()

#             for rule in rules:
#                 key = f"agg:{rule['id']}"
#                 items = redis_client.lrange(key, 0, -1)

#                 if not items:
#                     print(f"[batch] rule={rule['id']} items=0")
#                     continue

#                 window_ms = rule.get("window_ms") or 0
#                 max_size = rule.get("max_batch_size") or 50

#                 raw = items[0]
#                 if isinstance(raw, bytes):
#                     raw = raw.decode()

#                 first = json.loads(raw)

#                 now = int(time.time() * 1000)
#                 time_passed = now - first["ts"]

#                 if window_ms > 0 and time_passed >= window_ms:
#                     process_batch(rule["id"], items, db)
#                     redis_client.delete(key)
#                     continue

#                 if len(items) >= max_size:
#                     process_batch(rule["id"], items, db)
#                     redis_client.delete(key)
#                     continue

#                 if time_passed > 10000:
#                     process_batch(rule["id"], items, db)
#                     redis_client.delete(key)

#             db.commit()

#         except Exception as e:
#             print(f"[worker] batch error: {e}")

#         finally:
#             db.close()

#         time.sleep(2)


# # =========================
# # CORE WORKER
# # =========================
# def deliver_event(event_id: int):
#     db = SessionLocal()

#     try:
#         row = db.execute(
#             text(
#                 """
#                 SELECT 
#                     e.*,
#                     r.id as route_id,
#                     r.token,
#                     r.route,
#                     r.mode,
#                     r.dev_target,
#                     r.prod_target,
#                     r.user_id,
#                     r.tunnel_id
#                 FROM webhook_events e
#                 JOIN webhook_routes r ON r.id = e.route_id
#                 WHERE e.id = :id
#             """
#             ),
#             {"id": event_id},
#         ).mappings().first()

#         if not row:
#             print(f"[worker] Event {event_id} not found")
#             return

#         user_id = row["user_id"]

#         payload = row["payload"]
#         if isinstance(payload, str):
#             try:
#                 payload = json.loads(payload)
#             except Exception:
#                 payload = {}

#         headers = row["headers"]
#         if isinstance(headers, str):
#             try:
#                 headers = json.loads(headers)
#             except Exception:
#                 headers = {}

#         # =========================
#         # AGGREGATION
#         # =========================
#         try:
#             rules = db.execute(
#                 text(
#                     """
#                     SELECT id, event_patterns, provider
#                     FROM aggregation_rules
#                     WHERE user_id = :user_id AND enabled = TRUE
#                 """
#                 ),
#                 {"user_id": user_id},
#             ).mappings().all()

#             for rule in rules:
#                 if match_event(rule, payload, row["provider"]):
#                     push_to_batch(rule["id"], event_id, payload)

#             db.commit()

#         except Exception as e:
#             print(f"[worker] aggregation error: {e}")

#         # =========================
#         # DEV MODE
#         # =========================
#         if row["mode"] == "dev":
#             try:
#                 redis_client.publish(
#                     f"tunnel:{row['token']}",
#                     json.dumps(
#                         {
#                             "headers": headers,
#                             "payload": payload,
#                             "route": row["route"],
#                             "event_id": event_id,
#                         }
#                     ),
#                 )

#                 db.execute(
#                     text("UPDATE webhook_events SET status='delivered' WHERE id=:id"),
#                     {"id": event_id},
#                 )

#                 db.commit()
#                 events_delivered.inc()
#                 publish_update(event_id, "delivered")

#                 return

#             except Exception as e:
#                 print(f"[worker] tunnel error: {e}")

#         # =========================
#         # DELIVERY TARGETS
#         # =========================
#         try:
#             result = route_webhook_to_targets(

#                 user_id=user_id,
#                 webhook_data=payload,
#                 provider=row["provider"],
#             )

#             print("ROUTER RESULT:", result)

#             #  DELIVERY LOGS
#             try:
#                 if "details" in result:
#                     for log in result["details"]:
#                         success = log.get("success", False)

#                         db.execute(
#                             text(
#                                 """
#                                 INSERT INTO delivery_logs (
#                                     event_id, target_id, status, status_code, response, attempt
#                                 )
#                                 VALUES (:event_id, :target_id, :status, :status_code, :response, :attempt)
#                             """
#                             ),
#                             {
#                                 "event_id": event_id,
#                                 "target_id": log.get("target_id"),
#                                 "status": "success" if success else "failed",
#                                 "status_code": None,
#                                 "response": (
#                                     json.dumps(log.get("result"))
#                                     if success
#                                     else log.get("error")
#                                 ),
#                                 "attempt": 1,
#                             },
#                         )



#             try:
#                     asyncio.run(
#                 manager.send_to_token(
#                     row["token"],
#                     {
#                         "type":"delivery_logs",
#                         "data":{
#                             "event_id":event_id,
#                             "status":status,
#                             "status_code":None,
#                             "reponse":response,
#                             "attempt":1,
#                             "created_at":str(datetime.now())
#                         }
#                     },

#                 )
#              )
#             except Exception as ws_err:
#                 print(f"[worker] ws error: {ws_err}")

#     except Exception as log_err:
#             print(f"[worker] delivery log error: {log_err}")

#             if result["failed"] > 0:
#                 db.execute(
#                     text(
#                         """
#                         UPDATE webhook_events
#                         SET status='failed', last_error='multi-target failure'
#                         WHERE id=:id
#                     """
#                     ),
#                     {"id": event_id},
#                 )
#                 events_failed.inc()
#             else:
#                 db.execute(
#                     text("UPDATE webhook_events SET status='delivered' WHERE id=:id"),
#                     {"id": event_id},
#                 )
#                 events_delivered.inc()

#             db.commit()
#             publish_update(event_id, "delivered")

#         except Exception as e:
#             print(f"[worker] router error: {e}")

#             db.execute(
#                 text(
#                     """
#                     UPDATE webhook_events
#                     SET status='failed', last_error=:error
#                     WHERE id=:id
#                 """
#                 ),
#                 {"id": event_id, "error": str(e)},
#             )

#             db.commit()
#             events_failed.inc()

#     finally:
#         db.close()


# # =========================
# # RETRY
# # =========================
# def retry_scheduler():
#     while True:
#         db = SessionLocal()

#         try:
#             rows = db.execute(
#                 text(
#                     """
#                     SELECT id FROM webhook_events
#                     WHERE status='pending'
#                     AND next_retry_at IS NOT NULL
#                     AND next_retry_at <= NOW()
#                 """
#                 )
#             ).fetchall()

#             for row in rows:
#                 redis_client.lpush(QUEUE_MAIN, str(row.id))

#             db.commit()

#         finally:
#             db.close()

#         time.sleep(5)


# # =========================
# # MAIN
# # =========================
# def main():
#     print("[worker] started")

#     start_http_server(8001)

#     Thread(target=retry_scheduler, daemon=True).start()

#     while True:
#         try:
#             result = redis_client.brpop(QUEUE_MAIN, timeout=30)

#             if result is None:
#                 continue

#             _, raw_event = result
#             deliver_event(int(raw_event))

#         except Exception as e:
#             print(f"[worker] Redis error: {e}")
#             time.sleep(2)


# if __name__ == "__main__":
#     Thread(target=process_batches, daemon=True).start()
#     main()




# import time
# import json

# from threading import Thread
# from sqlalchemy import text

# from .database import SessionLocal
# from services.shared.redis_client import redis_client
# from .retry_policy import next_retry_time

# from prometheus_client import start_http_server

# from .metrics import (
#     events_delivered,
#     events_failed,
#     events_retried,
#     delivery_latency,
# )

# from .delivery_targets_router import route_webhook_to_targets


# QUEUE_MAIN = "webhook:queue"
# QUEUE_RETRY = "webhook:retry"
# QUEUE_DLQ = "webhook:dlq"


# # =========================
# # BATCH HELPERS
# # =========================
# def push_to_batch(rule_id, event_id, payload):
#     key = f"agg:{rule_id}"

#     data = {
#         "event_id": event_id,
#         "payload": payload,
#         "ts": int(time.time() * 1000),
#     }

#     redis_client.rpush(key, json.dumps(data))
#     redis_client.expire(key, 120)


# def match_event(rule, payload, provider):
#     try:
#         patterns = rule["event_patterns"]

#         if isinstance(patterns, str):
#             patterns = json.loads(patterns)

#         if rule["provider"] and provider:
#             if rule["provider"] != provider:
#                 return False

#         event_type = payload.get("type")

#         if "*" in patterns:
#             return True

#         return event_type in patterns

#     except Exception:
#         return False


# def publish_update(event_id: int, status: str, attempt: int = 0):
#     redis_client.publish(
#         "events:updates",
#         json.dumps(
#             {
#                 "event_id": event_id,
#                 "status": status,
#                 "attempt_count": attempt,
#             }
#         ),
#     )


# def process_batch(rule_id, items, db):
#     decoded_items = [
#         json.loads(i.decode() if isinstance(i, bytes) else i) for i in items
#     ]

#     size = len(decoded_items)

#     db.execute(
#         text(
#             """
#             UPDATE aggregation_rules
#             SET 
#                 batches_created = batches_created + 1,
#                 events_processed = events_processed + :count,
#                 last_triggered = NOW()
#             WHERE id = :id
#         """
#         ),
#         {"id": rule_id, "count": size},
#     )

#     print(f"[worker] batch created for rule {rule_id} with {size} events")


# def process_batches():
#     print("[worker] batch processor started")

#     while True:
#         db = SessionLocal()

#         try:
#             rules = db.execute(
#                 text(
#                     """
#                     SELECT id, window_ms, max_batch_size
#                     FROM aggregation_rules
#                     WHERE enabled = TRUE
#                 """
#                 )
#             ).mappings().all()

#             for rule in rules:
#                 key = f"agg:{rule['id']}"
#                 items = redis_client.lrange(key, 0, -1)

#                 if not items:
#                     print(f"[batch] rule={rule['id']} items=0")
#                     continue

#                 window_ms = rule.get("window_ms") or 0
#                 max_size = rule.get("max_batch_size") or 50

#                 raw = items[0]
#                 if isinstance(raw, bytes):
#                     raw = raw.decode()

#                 first = json.loads(raw)

#                 now = int(time.time() * 1000)
#                 time_passed = now - first["ts"]

#                 if window_ms > 0 and time_passed >= window_ms:
#                     process_batch(rule["id"], items, db)
#                     redis_client.delete(key)
#                     continue

#                 if len(items) >= max_size:
#                     process_batch(rule["id"], items, db)
#                     redis_client.delete(key)
#                     continue

#                 if time_passed > 10000:
#                     process_batch(rule["id"], items, db)
#                     redis_client.delete(key)

#             db.commit()

#         except Exception as e:
#             print(f"[worker] batch error: {e}")

#         finally:
#             db.close()

#         time.sleep(2)


# # =========================
# # CORE WORKER
# # =========================
# def deliver_event(event_id: int):
#     db = SessionLocal()

#     try:
#         row = db.execute(
#             text(
#                 """
#                 SELECT 
#                     e.*,
#                     r.id as route_id,
#                     r.token,
#                     r.route,
#                     r.mode,
#                     r.dev_target,
#                     r.prod_target,
#                     r.user_id,
#                     r.tunnel_id
#                 FROM webhook_events e
#                 JOIN webhook_routes r ON r.id = e.route_id
#                 WHERE e.id = :id
#             """
#             ),
#             {"id": event_id},
#         ).mappings().first()

#         if not row:
#             print(f"[worker] Event {event_id} not found")
#             return

#         user_id = row["user_id"]

#         payload = row["payload"]
#         if isinstance(payload, str):
#             try:
#                 payload = json.loads(payload)
#             except Exception:
#                 payload = {}

#         headers = row["headers"]
#         if isinstance(headers, str):
#             try:
#                 headers = json.loads(headers)
#             except Exception:
#                 headers = {}

#         # =========================
#         # AGGREGATION
#         # =========================
#         try:
#             rules = db.execute(
#                 text(
#                     """
#                     SELECT id, event_patterns, provider
#                     FROM aggregation_rules
#                     WHERE user_id = :user_id AND enabled = TRUE
#                 """
#                 ),
#                 {"user_id": user_id},
#             ).mappings().all()

#             for rule in rules:
#                 if match_event(rule, payload, row["provider"]):
#                     push_to_batch(rule["id"], event_id, payload)

#             db.commit()

#         except Exception as e:
#             print(f"[worker] aggregation error: {e}")

#         # =========================
#         # DEV MODE
#         # =========================
#         if row["mode"] == "dev":
#             try:
#                 redis_client.publish(
#                     f"tunnel:{row['token']}",
#                     json.dumps(
#                         {
#                             "headers": headers,
#                             "payload": payload,
#                             "route": row["route"],
#                             "event_id": event_id,
#                         }
#                     ),
#                 )

#                 db.execute(
#                     text("UPDATE webhook_events SET status='delivered' WHERE id=:id"),
#                     {"id": event_id},
#                 )

#                 db.commit()
#                 events_delivered.inc()
#                 publish_update(event_id, "delivered")

#                 return

#             except Exception as e:
#                 print(f"[worker] tunnel error: {e}")

#         # =========================
#         # DELIVERY TARGETS
#         # =========================
#         try:
#             result = route_webhook_to_targets(
#                 user_id=user_id,
#                 webhook_data=payload,
#                 provider=row["provider"],
#             )

#             print("ROUTER RESULT:", result)

#             try:
#                 if "details" in result:
#                     for log in result["details"]:
#                         success = log.get("success", False)

#                         db.execute(
#                             text(
#                                 """
#                                 INSERT INTO delivery_logs (
#                                     event_id, target_id, status, status_code, response, attempt
#                                 )
#                                 VALUES (:event_id, :target_id, :status, :status_code, :response, :attempt)
#                             """
#                             ),
#                             {
#                                 "event_id": event_id,
#                                 "target_id": log.get("target_id"),
#                                 "status": "success" if success else "failed",
#                                 "status_code": None,
#                                 "response": (
#                                     json.dumps(log.get("result"))
#                                     if success
#                                     else log.get("error")
#                                 ),
#                                 "attempt": row["attempt_count"],
#                             },
#                         )

                        

#             except Exception as log_err:
#                 print(f"[worker] delivery log error: {log_err}")

#             if result["failed"] > 0:
#                 db.execute(
#                     text(
#                         """
#                         UPDATE webhook_events
#                         SET status='failed', last_error='multi-target failure'
#                         WHERE id=:id
#                     """
#                     ),
#                     {"id": event_id},
#                 )
#                 events_failed.inc()
#             else:
#                 db.execute(
#                     text("UPDATE webhook_events SET status='delivered' WHERE id=:id"),
#                     {"id": event_id},
#                 )
#                 events_delivered.inc()

#             db.commit()
#             publish_update(event_id, "delivered")

#         except Exception as e:
#             print(f"[worker] router error: {e}")

#             db.execute(
#                 text(
#                     """
#                     UPDATE webhook_events
#                     SET status='failed', last_error=:error
#                     WHERE id=:id
#                 """
#                 ),
#                 {"id": event_id, "error": str(e)},
#             )

#             db.commit()
#             events_failed.inc()

#     finally:
#         db.close()


# # =========================
# # RETRY
# # =========================
# def retry_scheduler():
#     while True:
#         db = SessionLocal()

#         try:
#             rows = db.execute(
#                 text(
#                     """
#                     SELECT id FROM webhook_events
#                     WHERE status='pending'
#                     AND next_retry_at IS NOT NULL
#                     AND next_retry_at <= NOW()
#                 """
#                 )
#             ).fetchall()

#             for row in rows:
#                 redis_client.lpush(QUEUE_MAIN, str(row.id))

#             db.commit()

#         finally:
#             db.close()

#         time.sleep(5)


# # =========================
# # MAIN
# # =========================
# def main():
#     print("[worker] started")

#     start_http_server(8001)

#     Thread(target=retry_scheduler, daemon=True).start()

#     while True:
#         try:
#             result = redis_client.brpop(QUEUE_MAIN, timeout=30)

#             if result is None:
#                 continue

#             _, raw_event = result
#             try:
#              data = json.loads(raw_event)

#               # If it's a batch → process each event
#                if isinstance(data, dict) and data.get("batch"):
#                 for item in data["events"]:
#                 event_id = item.get("event_id")
#                if event_id:
#                 deliver_event(int(event_id))

#                else:
#                 deliver_event(int(raw_event))

#              except Exception:
#            # fallback (old behavior)
#             deliver_event(int(raw_event))
           
            

#         except Exception as e:
#             print(f"[worker] Redis error: {e}")
#             time.sleep(2)


# if __name__ == "__main__":
#     Thread(target=process_batches, daemon=True).start()
#     main()







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


QUEUE_MAIN = "webhook:queue"
QUEUE_RETRY = "webhook:retry"
QUEUE_DLQ = "webhook:dlq"


# =========================
# BATCH HELPERS
# =========================
def push_to_batch(rule_id, event_id, payload):
    key = f"agg:{rule_id}"

    data = {
        "event_id": event_id,
        "payload": payload,
        "ts": int(time.time() * 1000),
    }

    redis_client.rpush(key, json.dumps(data))
    redis_client.expire(key, 120)


def match_event(rule, payload, provider):
    try:
        patterns = rule["event_patterns"]

        if isinstance(patterns, str):
            patterns = json.loads(patterns)

        if rule["provider"] and provider:
            if rule["provider"] != provider:
                return False

        event_type = payload.get("type")

        if "*" in patterns:
            return True

        return event_type in patterns

    except Exception:
        return False


# def publish_update(event_id: int, status: str, attempt: int = 0):
#     redis_client.publish(
#         "events:updates",
#         json.dumps(
#             {
#                 "event_id": event_id,
#                 "status": status,
#                 "attempt_count": attempt,
#             }
#         ),
#     )




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


def process_batch(rule_id, items, db):
    decoded_items = [
        json.loads(i.decode() if isinstance(i, bytes) else i) for i in items
    ]

    size = len(decoded_items)

    db.execute(
        text(
            """
            UPDATE aggregation_rules
            SET 
                batches_created = batches_created + 1,
                events_processed = events_processed + :count,
                last_triggered = NOW()
            WHERE id = :id
        """
        ),
        {"id": rule_id, "count": size},
    )

    print(f"[worker] batch created for rule {rule_id} with {size} events")


def process_batches():
    print("[worker] batch processor started")

    while True:
        db = SessionLocal()

        try:
            rules = db.execute(
                text(
                    """
                    SELECT id, window_ms, max_batch_size
                    FROM aggregation_rules
                    WHERE enabled = TRUE
                """
                )
            ).mappings().all()

            for rule in rules:
                key = f"agg:{rule['id']}"
                items = redis_client.lrange(key, 0, -1)

                if not items:
                    print(f"[batch] rule={rule['id']} items=0")
                    continue

                window_ms = rule.get("window_ms") or 0
                max_size = rule.get("max_batch_size") or 50

                raw = items[0]
                if isinstance(raw, bytes):
                    raw = raw.decode()

                first = json.loads(raw)

                now = int(time.time() * 1000)
                time_passed = now - first["ts"]

                if window_ms > 0 and time_passed >= window_ms:
                    process_batch(rule["id"], items, db)
                    redis_client.delete(key)
                    continue

                if len(items) >= max_size:
                    process_batch(rule["id"], items, db)
                    redis_client.delete(key)
                    continue

                if time_passed > 10000:
                    process_batch(rule["id"], items, db)
                    redis_client.delete(key)

            db.commit()

        except Exception as e:
            print(f"[worker] batch error: {e}")

        finally:
            db.close()

        time.sleep(2)


# =========================
# CORE WORKER
# =========================
def deliver_event(event_id: int):
    db = SessionLocal()

    try:
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
                JOIN webhook_routes r ON r.id = e.route_id
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

        # =========================
        # AGGREGATION
        # =========================
        try:
            rules = db.execute(
                text(
                    """
                    SELECT id, event_patterns, provider
                    FROM aggregation_rules
                    WHERE user_id = :user_id AND enabled = TRUE
                """
                ),
                {"user_id": user_id},
            ).mappings().all()

            for rule in rules:
                if match_event(rule, payload, row["provider"]):
                    push_to_batch(rule["id"], event_id, payload)

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
                    text("UPDATE webhook_events SET status='delivered' WHERE id=:id"),
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
            result = route_webhook_to_targets(
                user_id=user_id,
                webhook_data=payload,
                provider=row["provider"],
            )

            print("ROUTER RESULT:", result)

            try:
                if "details" in result:
                    for log in result["details"]:
                        success = log.get("success", False)

                        db.execute(
                            text(
                                """
                                INSERT INTO delivery_logs (
                                    event_id, target_id, status, status_code, response, attempt
                                )
                                VALUES (:event_id, :target_id, :status, :status_code, :response, :attempt)
                            """
                            ),
                            {
                                "event_id": event_id,
                                "target_id": log.get("target_id"),
                                "status": "success" if success else "failed",
                                "status_code": None,
                                "response": (
                                    json.dumps(log.get("result"))
                                    if success
                                    else log.get("error")
                                ),
                                "attempt": row["attempt_count"],
                            },
                        )

            except Exception as log_err:
                print(f"[worker] delivery log error: {log_err}")

            if result["failed"] > 0:
                db.execute(
                    text(
                        """
                        UPDATE webhook_events
                        SET status='failed', last_error='multi-target failure'
                        WHERE id=:id
                    """
                    ),
                    {"id": event_id},
                )
                events_failed.inc()
            else:
                db.execute(
                    text("UPDATE webhook_events SET status='delivered' WHERE id=:id"),
                    {"id": event_id},
                )
                events_delivered.inc()

            db.commit()
            status = "failed" if result["failed"] > 0 else "delivered"
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

            db.execute(
                text(
                    """
                    UPDATE webhook_events
                    SET status='failed', last_error=:error
                    WHERE id=:id
                """
                ),
                {"id": event_id, "error": str(e)},
            )

            db.commit()
            events_failed.inc()

            publish_update(
    event_id=event_id,
    status="failed",
    attempt=row["attempt_count"],
    user_id=row["user_id"],
    provider=row["provider"],
    route=row["route"],
    token=row["token"],
    created_at=row["created_at"],
)

    finally:
        db.close()


# =========================
# RETRY
# =========================
def retry_scheduler():
    while True:
        db = SessionLocal()

        try:
            rows = db.execute(
                text(
                    """
                    SELECT id FROM webhook_events
                    WHERE status='pending'
                    AND next_retry_at IS NOT NULL
                    AND next_retry_at <= NOW()
                """
                )
            ).fetchall()

            for row in rows:
                redis_client.lpush(QUEUE_MAIN, str(row.id))

            db.commit()

        finally:
            db.close()

        time.sleep(5)


# =========================
# MAIN
# =========================
def main():
    print("[worker] started")

    start_http_server(8001)

    Thread(target=retry_scheduler, daemon=True).start()

    while True:
        try:
            result = redis_client.brpop(QUEUE_MAIN, timeout=30)

            if result is None:
                continue

            _, raw_event = result

            try:
                data = json.loads(raw_event)

                # If it's a batch → process each event
                if isinstance(data, dict) and data.get("batch"):
                    for item in data["events"]:
                        event_id = item.get("event_id")
                        if event_id:
                            deliver_event(int(event_id))
                else:
                    deliver_event(int(raw_event))

            except Exception:
                # fallback (old behavior)
                deliver_event(int(raw_event))

        except Exception as e:
            print(f"[worker] Redis error: {e}")
            time.sleep(2)


if __name__ == "__main__":
    Thread(target=process_batches, daemon=True).start()
    main()