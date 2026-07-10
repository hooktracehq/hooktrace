import asyncio
import inspect
import json
from typing import Any, Dict

from sqlalchemy import text

from .database import SessionLocal


async def execute_with_retry(worker, config, payload):
    max_retries = config.get("retries", 2)
    delay = 0.5

    for attempt in range(max_retries + 1):
        try:
            if inspect.iscoroutinefunction(worker):
                result = await asyncio.wait_for(
                    worker(config, payload),
                    timeout=config.get("timeout", 10),
                )
            else:
                result = await asyncio.wait_for(
                    asyncio.to_thread(
                        worker,
                        config,
                        payload,
                    ),
                    timeout=config.get("timeout", 10),
                )

            if 200 <= result["status_code"] < 300:
                return result, attempt + 1, True

            raise Exception(f"HTTP {result['status_code']}")

        except Exception as e:
            if attempt == max_retries:
                return (
                    {
                        "status_code": None,
                        "error": str(e),
                    },
                    attempt + 1,
                    False,
                )

            await asyncio.sleep(delay * (2**attempt))


class DeliveryTargetsRouter:

    def __init__(self):
        self.worker = {}
        self._load_worker()

    def _load_worker(self):
        from services.worker.delivery.email import deliver_email
        from services.worker.delivery.grpc import deliver_grpc
        from services.worker.delivery.http import deliver_http
        from services.worker.delivery.kafka import deliver_kafka
        from services.worker.delivery.rabbitmq import deliver_rabbitmq
        from services.worker.delivery.redis import deliver_redis
        from services.worker.delivery.slack import deliver_slack
        from services.worker.delivery.sqs import deliver_sqs

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

    def get_active_targets(
        self,
        user_id: str,
        provider: str | None = None,
    ):
        db = SessionLocal()

        try:
            rows = db.execute(
                text(
                    """
                    SELECT
                        id,
                        type,
                        config,
                        providers
                    FROM delivery_targets
                    WHERE user_id = :user_id
                    AND enabled = TRUE
                    """
                ),
                {"user_id": user_id},
            ).fetchall()

            targets = []

            for row in rows:
                config = row[2]
                providers = row[3]

                if isinstance(config, str):
                    config = json.loads(config or "{}")

                if isinstance(providers, str):
                    providers = json.loads(providers or "[]")

                providers = providers or []

                if not providers or provider is None or provider in providers:
                    targets.append(
                        {
                            "id": str(row[0]),
                            "type": row[1],
                            "config": config,
                        }
                    )

            return targets

        finally:
            db.close()

    async def _deliver_target(
        self,
        target,
        webhook_data,
    ):
        target_id = target["id"]
        target_type = target["type"]
        config = target["config"]

        worker = self.worker.get(target_type)

        if worker is None:
            return {
                "target_id": target_id,
                "target_type": target_type,
                "success": False,
                "result": {
                    "error": f"No worker found for type: {target_type}"
                },
            }

        try:
            result, attempts, success = await execute_with_retry(
                worker,
                config,
                webhook_data,
            )

            status = "success" if success else "failed"

        except Exception as e:
            result = {
                "status_code": None,
                "error": str(e),
            }

            success = False
            status = "failed"
            attempts = 0

        db = SessionLocal()

        try:
            await self._update_target_stats(
                db,
                target_id,
                success,
            )

            #
            # delivery_logs.event_id is INTEGER
            #
            event_id = webhook_data.get("event_id")

            if not isinstance(event_id, int):
                event_id = None

            db.execute(
                text(
                    """
                    INSERT INTO delivery_logs (
                        target_id,
                        event_id,
                        status,
                        status_code,
                        response,
                        attempt,
                        created_at
                    )
                    VALUES (
                        :target_id,
                        :event_id,
                        :status,
                        :status_code,
                        :response,
                        :attempt,
                        NOW()
                    )
                    """
                ),
                {
                    "target_id": target_id,
                    "event_id": event_id,
                    "status": status,
                    "status_code": result.get("status_code"),
                    "response": json.dumps(result),
                    "attempt": attempts,
                },
            )

            db.commit()

        except Exception:
            db.rollback()
            raise

        finally:
            db.close()

        return {
            "target_id": target_id,
            "target_type": target_type,
            "success": success,
            "result": result,
        }

    async def deliver_webhook(
        self,
        user_id: str,
        webhook_data: Dict[str, Any],
        provider: str | None = None,
        target_id: str | None = None,
    ):
        targets = self.get_active_targets(
            user_id,
            provider,
        )

        if target_id:
            targets = [
                t
                for t in targets
                if t["id"] == target_id
            ]

        results = {
            "total_targets": len(targets),
            "successful": 0,
            "failed": 0,
            "details": [],
        }

        if not targets:
            return results

        delivery_results = await asyncio.gather(
            *[
                self._deliver_target(
                    target,
                    webhook_data,
                )
                for target in targets
            ]
        )

        for result in delivery_results:
            if result["success"]:
                results["successful"] += 1
            else:
                results["failed"] += 1

            results["details"].append(result)

        return results

    async def _update_target_stats(
        self,
        db,
        target_id: str,
        success: bool,
    ):
        if success:
            db.execute(
                text(
                    """
                    UPDATE delivery_targets
                    SET
                        success_count = success_count + 1,
                        last_used = CURRENT_TIMESTAMP
                    WHERE id = :id
                    """
                ),
                {"id": target_id},
            )
        else:
            db.execute(
                text(
                    """
                    UPDATE delivery_targets
                    SET
                        error_count = error_count + 1,
                        last_used = CURRENT_TIMESTAMP
                    WHERE id = :id
                    """
                ),
                {"id": target_id},
            )


delivery_router = DeliveryTargetsRouter()


async def route_webhook_to_targets(
    user_id,
    webhook_data,
    provider=None,
    target_id=None,
):
    return await delivery_router.deliver_webhook(
        user_id,
        webhook_data,
        provider,
        target_id,
    )