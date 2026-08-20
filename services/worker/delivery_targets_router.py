import asyncio
import inspect
import json
from typing import Any, Dict

from sqlalchemy import text

from .database import SessionLocal


async def execute_with_retry(worker, config, payload):
    """
    Execute a delivery worker with exponential-backoff retries.

    config:
        retries: number of retries after the first attempt
        timeout: timeout in seconds
    """

    max_retries = int(config.get("retries", 2))
    timeout = int(config.get("timeout", 10))
    delay = 0.5

    for attempt in range(max_retries + 1):
        try:
            if inspect.iscoroutinefunction(worker):
                result = await asyncio.wait_for(
                    worker(config, payload),
                    timeout=timeout,
                )
            else:
                result = await asyncio.wait_for(
                    asyncio.to_thread(
                        worker,
                        config,
                        payload,
                    ),
                    timeout=timeout,
                )

            status_code = result.get("status_code")

            if (
                status_code is not None
                and 200 <= status_code < 300
            ):
                return result, attempt + 1, True

            raise Exception(
                f"HTTP {status_code}"
                if status_code is not None
                else result.get(
                    "error",
                    "Delivery failed",
                )
            )

        except Exception as error:
            if attempt == max_retries:
                return (
                    {
                        "status_code": None,
                        "error": str(error),
                    },
                    attempt + 1,
                    False,
                )

            await asyncio.sleep(
                delay * (2**attempt)
            )


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
        route_id: int,
        provider: str | None = None,
    ):
        """
        Resolve active delivery targets attached to a route.

        Ownership / routing model:

            User
              |
              v
            Route
              |
              v
        route_delivery_targets
              |
              v
        delivery_targets

        The route relationship is authoritative.

        Provider filtering is applied only when we have
        a meaningful detected provider.

        Therefore:

            provider = "stripe"
            providers = ["stripe"]
                -> accepted

            provider = "generic"
            providers = ["stripe"]
                -> accepted

            provider = "unknown"
            providers = ["stripe"]
                -> accepted

            provider = "github"
            providers = ["stripe"]
                -> rejected

            providers = []
                -> accepted
        """

        db = SessionLocal()

        try:
            rows = db.execute(
                text(
                    """
                    SELECT
                        dt.id,
                        dt.type,
                        dt.config,
                        dt.providers
                    FROM route_delivery_targets rdt

                    JOIN webhook_routes r
                        ON r.id = rdt.route_id

                    JOIN delivery_targets dt
                        ON dt.id = rdt.target_id

                    WHERE
                        r.id = :route_id
                        AND r.user_id = :user_id
                        AND dt.user_id = :user_id
                        AND rdt.enabled = TRUE
                        AND dt.enabled = TRUE

                    ORDER BY rdt.created_at ASC
                    """
                ),
                {
                    "route_id": route_id,
                    "user_id": user_id,
                },
            ).fetchall()

            targets = []

            for row in rows:
                target_id = row[0]
                target_type = row[1]
                config = row[2]
                providers = row[3]

                # PostgreSQL JSON normally comes back
                # as Python objects, but support strings too.
                if isinstance(config, str):
                    try:
                        config = json.loads(
                            config or "{}"
                        )
                    except json.JSONDecodeError:
                        config = {}

                if isinstance(providers, str):
                    try:
                        providers = json.loads(
                            providers or "[]"
                        )
                    except json.JSONDecodeError:
                        providers = []

                config = config or {}
                providers = providers or []

                if not isinstance(providers, list):
                    providers = [providers]

                providers = [
                    str(item).lower()
                    for item in providers
                    if item is not None
                ]

                normalized_provider = (
                    str(provider).lower()
                    if provider
                    else None
                )

                # -------------------------------------------------
                # Provider filtering
                # -------------------------------------------------
                #
                # The route attachment is authoritative.
                #
                # "generic" and "unknown" mean that provider
                # detection did not identify a specific provider.
                #
                # We must NOT reject a target simply because
                # detection returned generic/unknown.
                #
                if (
                    providers
                    and normalized_provider
                    and normalized_provider
                    not in {"generic", "unknown"}
                    and normalized_provider
                    not in providers
                ):
                    continue

                targets.append(
                    {
                        "id": str(target_id),
                        "type": target_type,
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

        # -------------------------------------------------
        # Worker doesn't exist
        # -------------------------------------------------

        if worker is None:
            result = {
                "status_code": None,
                "error": (
                    f"No worker found for type: "
                    f"{target_type}"
                ),
            }

            success = False
            attempts = 0
            status = "failed"

        # -------------------------------------------------
        # Execute worker
        # -------------------------------------------------

        else:
            try:
                result, attempts, success = (
                    await execute_with_retry(
                        worker,
                        config,
                        webhook_data,
                    )
                )

                status = (
                    "success"
                    if success
                    else "failed"
                )

            except Exception as error:
                result = {
                    "status_code": None,
                    "error": str(error),
                }

                success = False
                status = "failed"
                attempts = 0

        # -------------------------------------------------
        # Persist delivery log
        # -------------------------------------------------

        db = SessionLocal()

        try:
            self._update_target_stats(
                db,
                target_id,
                success,
            )

            event_id = webhook_data.get(
                "event_id"
            )

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
                    "status_code": result.get(
                        "status_code"
                    ),
                    "response": json.dumps(
                        result,
                        default=str,
                    ),
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
            "attempts": attempts,
            "result": result,
        }

    async def deliver_webhook(
        self,
        user_id: str,
        route_id: int,
        webhook_data: Dict[str, Any],
        provider: str | None = None,
        target_id: str | None = None,
    ):
        """
        Deliver a webhook only to targets attached
        to the specified route.
        """

        targets = self.get_active_targets(
            user_id=user_id,
            route_id=route_id,
            provider=provider,
        )

        # -------------------------------------------------
        # Optional explicit target
        # -------------------------------------------------

        if target_id:
            targets = [
                target
                for target in targets
                if target["id"] == target_id
            ]

        results = {
            "total_targets": len(targets),
            "successful": 0,
            "failed": 0,
            "details": [],
        }

        # -------------------------------------------------
        # No configured targets
        # -------------------------------------------------

        if not targets:
            return results

        # -------------------------------------------------
        # Deliver to all attached targets concurrently
        # -------------------------------------------------

        delivery_results = await asyncio.gather(
            *[
                self._deliver_target(
                    target,
                    webhook_data,
                )
                for target in targets
            ],
            return_exceptions=False,
        )

        for result in delivery_results:
            if result["success"]:
                results["successful"] += 1
            else:
                results["failed"] += 1

            results["details"].append(result)

        return results

    def _update_target_stats(
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
                        success_count =
                            success_count + 1,
                        last_used =
                            CURRENT_TIMESTAMP
                    WHERE id = :id
                    """
                ),
                {
                    "id": target_id,
                },
            )

        else:
            db.execute(
                text(
                    """
                    UPDATE delivery_targets
                    SET
                        error_count =
                            error_count + 1,
                        last_used =
                            CURRENT_TIMESTAMP
                    WHERE id = :id
                    """
                ),
                {
                    "id": target_id,
                },
            )


delivery_router = DeliveryTargetsRouter()


async def route_webhook_to_targets(
    user_id,
    route_id,
    webhook_data,
    provider=None,
    target_id=None,
):
    """
    Public delivery entry point.

    Delivery is always scoped to a specific route.

    The route determines which targets are eligible.
    Provider metadata can further restrict delivery
    when the provider is known.
    """

    return await delivery_router.deliver_webhook(
        user_id=user_id,
        route_id=route_id,
        webhook_data=webhook_data,
        provider=provider,
        target_id=target_id,
    )