

# """
# Routes incoming webhooks to configured delivery targets
# Integrates with your existing delivery worker
# """

# from typing import List, Dict, Any
# from datetime import datetime
# from sqlalchemy import text
# import json

# from .database import SessionLocal


# class DeliveryTargetsRouter:
#     """
#     Routes webhooks to delivery targets based on configuration
#     """

#     def __init__(self):
#         self.worker = {}
#         self._load_worker()

#     def _load_worker(self):
#         """Lazy load delivery worker"""
#         try:
#             from services.worker.delivery.http import deliver_http
#             self.worker['http'] = deliver_http
#         except ImportError:
#             pass

#         try:
#             from services.worker.delivery.sqs import deliver_sqs
#             self.worker['sqs'] = deliver_sqs
#         except ImportError:
#             pass

#         try:
#             from services.worker.delivery.kafka import deliver_kafka
#             self.worker['kafka'] = deliver_kafka
#         except ImportError:
#             pass

#         try:
#             from services.worker.delivery.rabbitmq import deliver_rabbitmq
#             self.worker['rabbitmq'] = deliver_rabbitmq
#         except ImportError:
#             pass

#         try:
#             from services.worker.delivery.redis import deliver_redis
#             self.worker['redis'] = deliver_redis
#         except ImportError:
#             pass

#         try:
#             from services.worker.delivery.grpc import deliver_grpc
#             self.worker['grpc'] = deliver_grpc
#         except ImportError:
#             pass

#         try:
#             from services.worker.delivery.slack import deliver_slack
#             self.worker['slack'] = deliver_slack
#         except ImportError:
#             pass

#         try:
#             from services.worker.delivery.email import deliver_email
#             self.worker['email'] = deliver_email
#         except ImportError:
#             pass


#     def get_active_targets(self, user_id: str, provider: str = None) -> List[Dict[str, Any]]:
#         """
#         Get all active delivery targets for a user
#         Optionally filter by provider
#         """
#         db = SessionLocal()
#         try:
#             query = """
#                 SELECT id, type, config, providers
#                 FROM delivery_targets
#                 WHERE user_id = :user_id
#                 AND enabled = TRUE
#             """
#             params = {"user_id": user_id}

#             targets = db.execute(text(query), params).fetchall()

#             filtered_targets = []

#             for target in targets:
                
#                 raw_config = target[2]
#                 raw_providers = target[3]

#                 #  Parse config safely
#                 config = raw_config
#                 if isinstance(config, str):
#                     try:
#                         config = json.loads(config)
#                     except Exception:
#                         config = {}

#                 #  Parse providers safely
#                 providers = raw_providers
#                 if isinstance(providers, str):
#                     try:
#                         providers = json.loads(providers)
#                     except Exception:
#                         providers = []

#                 if not providers:
#                     providers = []

#                 #  Provider filtering logic
#                 if not providers or not provider or provider in providers:
#                     filtered_targets.append({
#                         "id": str(target[0]),
#                         "type": target[1],
#                         "config": config,
#                         "providers": providers,
#                     })

#             return filtered_targets

#         finally:
#             db.close()

#     def deliver_webhook(
#         self,
#         user_id: str,
#         webhook_data: Dict[str, Any],
#         provider: str = None
#     ) -> Dict[str, Any]:
#         """
#         Deliver webhook to all matching delivery targets
#         """
#         targets = self.get_active_targets(user_id, provider)

#         results = {
#             "total_targets": len(targets),
#             "successful": 0,
#             "failed": 0,
#             "details": []
#         }

#         if not targets:
#             return results

#         for target in targets:
#             target_id = target["id"]
#             target_type = target["type"]
#             config = target["config"]

#             try:
#                 worker = self.worker.get(target_type)

#                 if not worker:
#                     results["failed"] += 1
#                     results["details"].append({
#                         "target_id": target_id,
#                         "target_type": target_type,
#                         "success": False,
#                         "error": f"No worker found for type: {target_type}"
#                     })
#                     self._update_target_stats(target_id, success=False)
#                     continue

#                 #  Deliver webhook
#                 result = worker(config, webhook_data)

#                 results["successful"] += 1
#                 results["details"].append({
#                     "target_id": target_id,
#                     "target_type": target_type,
#                     "success": True,
#                     "result": result
#                 })

#                 self._update_target_stats(target_id, success=True)

#             except Exception as e:
#                 results["failed"] += 1
#                 results["details"].append({
#                     "target_id": target_id,
#                     "target_type": target_type,
#                     "success": False,
#                     "error": str(e)
#                 })

#                 self._update_target_stats(target_id, success=False)

#         return results

#     def _update_target_stats(self, target_id: str, success: bool):
#         """Update delivery statistics for a target"""
#         db = SessionLocal()
#         try:
#             if success:
#                 db.execute(
#                     text("""
#                         UPDATE delivery_targets
#                         SET success_count = success_count + 1,
#                             last_used = CURRENT_TIMESTAMP
#                         WHERE id = :id
#                     """),
#                     {"id": target_id}
#                 )
#             else:
#                 db.execute(
#                     text("""
#                         UPDATE delivery_targets
#                         SET error_count = error_count + 1,
#                             last_used = CURRENT_TIMESTAMP
#                         WHERE id = :id
#                     """),
#                     {"id": target_id}
#                 )
#             db.commit()
#         except Exception as e:
#             print(f"Error updating target stats: {e}")
#         finally:
#             db.close()


# # Global instance
# delivery_router = DeliveryTargetsRouter()


# def route_webhook_to_targets(
#     user_id: str,
#     webhook_data: Dict[str, Any],
#     provider: str = None
# ) -> Dict[str, Any]:
#     """
#     Convenience function to route webhook to delivery targets
#     """
#     return delivery_router.deliver_webhook(user_id, webhook_data, provider)






from typing import List, Dict, Any
from sqlalchemy import text
import json

from .database import SessionLocal




import time

def execute_with_retry(worker, config, payload):
    max_retries = config.get("retries", 2)
    delay = 0.5  # seconds (base)

    attempt = 0

    while attempt <= max_retries:
        try:
            result = worker(config, payload)

            # success condition
            if result.get("status_code") and 200 <= result["status_code"] < 300:
                return result, attempt + 1, True

            # treat non-2xx as failure
            raise Exception(f"HTTP {result.get('status_code')}")

        except Exception as e:
            if attempt == max_retries:
                return {
                    "status_code": None,
                    "error": str(e)
                }, attempt + 1, False

            # exponential backoff
            time.sleep(delay * (2 ** attempt))
            attempt += 1

class DeliveryTargetsRouter:

    def __init__(self):
        self.worker = {}
        self._load_worker()

    def _load_worker(self):
        from services.worker.delivery.http import deliver_http
        from services.worker.delivery.sqs import deliver_sqs
        from services.worker.delivery.kafka import deliver_kafka
        from services.worker.delivery.rabbitmq import deliver_rabbitmq
        from services.worker.delivery.redis import deliver_redis
        from services.worker.delivery.grpc import deliver_grpc
        from services.worker.delivery.slack import deliver_slack
        from services.worker.delivery.email import deliver_email

        self.worker = {
            "http": deliver_http,
            "sqs": deliver_sqs,
            "kafka": deliver_kafka,
            "rabbitmq": deliver_rabbitmq,
            "redis": deliver_redis,
            "grpc": deliver_grpc,
            "slack": deliver_slack,
            "email": deliver_email,
        }

    def get_active_targets(self, user_id: str, provider: str = None):
        db = SessionLocal()
        try:
            rows = db.execute(
                text("""
                    SELECT id, type, config, providers
                    FROM delivery_targets
                    WHERE user_id = :user_id
                    AND enabled = TRUE
                """),
                {"user_id": user_id}
            ).fetchall()

            targets = []

            for row in rows:
                config = row[2]
                providers = row[3]

                if isinstance(config, str):
                    config = json.loads(config or "{}")

                if isinstance(providers, str):
                    providers = json.loads(providers or "[]")

                if not providers:
                    providers = []

                if not providers or not provider or provider in providers:
                    targets.append({
                        "id": str(row[0]),
                        "type": row[1],
                        "config": config,
                    })

            return targets

        finally:
            db.close()

    def deliver_webhook(self, user_id: str, webhook_data: Dict[str, Any], provider: str = None, target_id=None):
        targets = self.get_active_targets(user_id, provider)
        if target_id:
           targets = [t for t in targets if t["id"] == target_id]

        results = {
            "total_targets": len(targets),
            "successful": 0,
            "failed": 0,
            "details": []
        }

        if not targets:
            return results

        for target in targets:
            target_id = target["id"]
            target_type = target["type"]
            config = target["config"]

            worker = self.worker.get(target_type)

            if not worker:
                results["failed"] += 1
                continue

            # 🔁 execute + catch errors
            try:
                result, attempts, success = execute_with_retry(worker,config,webhook_data)
                status = "success" if success else "failed"
            except Exception as e:
                result = {
                    "status_code": None,
                    "error": str(e)
                }
                status = "failed"
                success = False

            # 📊 update stats
            self._update_target_stats(target_id, success)

            # 🧾 log delivery
            db = SessionLocal()
            try:
                db.execute(
                    text("""
                        INSERT INTO delivery_logs (
                            target_id,
                            event_id,
                            status,
                            status_code,
                            response,
                            attempt,
                            created_at
                        )
                        VALUES (:target_id, :status, :status_code, :response, :attempt, NOW())
                    """),
                    {
                        "target_id": target_id,
                        "event_id": webhook_data.get("id"),
                        "status": status,
                        "status_code": result.get("status_code"),
                        "response": json.dumps(result),
                        "attempt": attempts
                    }
                )
                db.commit()
            finally:
                db.close()

            # 📦 result summary
            if success:
                results["successful"] += 1
            else:
                results["failed"] += 1

            results["details"].append({
                "target_id": target_id,
                "target_type": target_type,
                "success": success,
                "result": result
            })

        return results

    def _update_target_stats(self, target_id: str, success: bool):
        db = SessionLocal()
        try:
            if success:
                db.execute(
                    text("""
                        UPDATE delivery_targets
                        SET success_count = success_count + 1,
                            last_used = CURRENT_TIMESTAMP
                        WHERE id = :id
                    """),
                    {"id": target_id}
                )
            else:
                db.execute(
                    text("""
                        UPDATE delivery_targets
                        SET error_count = error_count + 1,
                            last_used = CURRENT_TIMESTAMP
                        WHERE id = :id
                    """),
                    {"id": target_id}
                )
            db.commit()
        finally:
            db.close()


delivery_router = DeliveryTargetsRouter()


def route_webhook_to_targets(user_id, webhook_data, provider=None, target_id=None):
    return delivery_router.deliver_webhook(
        user_id,
        webhook_data,
        provider,
        target_id
    )