print(">>> routes.py loaded <<<")

from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text

from .rate_limit import check_rate_limit
from .database import SessionLocal
from .models import WebhookEvent

from services.shared.redis_client import redis_client

from .security import verify_signature
from .providers.registry import PROVIDERS

from .metrics import (
    webhooks_received,
    webhooks_deduplicated,
    webhooks_invalid_signature,
)

router = APIRouter()


@router.post(
    "/r/{token}/{route}",
    status_code=status.HTTP_202_ACCEPTED,
)
async def relay(
    token: str,
    route: str,
    request: Request,
):
    print("RELAY CALLED")

    # ----------------------------------
    # Read raw request body
    # ----------------------------------

    raw_body = await request.body()

    # Important:
    # Provider verification modules such as Stripe need
    # the exact raw request bytes.
    request.state.raw_body = raw_body

    # ----------------------------------
    # Parse payload
    # ----------------------------------

    try:
        payload = await request.json()

    except Exception:
        if raw_body:
            payload = raw_body.decode(errors="ignore")
        else:
            payload = {}

    # ----------------------------------
    # Request metadata
    # ----------------------------------

    headers = dict(request.headers)

    idempotency_key = request.headers.get(
        "idempotency-key"
    )

    signature = request.headers.get(
        "x-signature"
    )

    timestamp = request.headers.get(
        "x-timestamp"
    )

    # ----------------------------------
    # Detect provider
    # ----------------------------------

    provider = None

    if "stripe-signature" in request.headers:
        provider = "stripe"

    elif "x-hub-signature-256" in request.headers:
        provider = "github"

    elif "x-razorpay-signature" in request.headers:
        provider = "razorpay"

    elif "x-shopify-hmac-sha256" in request.headers:
        provider = "shopify"

    elif "x-slack-signature" in request.headers:
        provider = "slack"

    elif "x-signature-ed25519" in request.headers:
        provider = "discord"

    elif "x-notion-signature" in request.headers:
        provider = "notion"

    elif "x-supabase-signature" in request.headers:
        provider = "supabase"

    else:
        provider = "generic"

    print(
        f"[HOOKTRACE] Detected provider: {provider}"
    )

    # ----------------------------------
    # Database
    # ----------------------------------

    db: Session = SessionLocal()

    try:

        # ----------------------------------
        # Load route
        # ----------------------------------

        route_config = db.execute(
            text(
                """
                SELECT
                    id,
                    secret,
                    mode
                FROM webhook_routes
                WHERE
                    token = :token
                    AND route = :route
                """
            ),
            {
                "token": token,
                "route": route,
            },
        ).mappings().first()

        if not route_config:
            return JSONResponse(
                status_code=404,
                content={
                    "detail": "Route not found"
                },
            )

        route_id = route_config["id"]
        route_secret = route_config["secret"]

        # ----------------------------------
        # Rate limiting
        # ----------------------------------

        if not check_rate_limit(
            token,
            route,
        ):
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded"
                },
            )

        # ----------------------------------
        # Signature validation
        # ----------------------------------

        if (
            route_secret
            and route_config["mode"] != "dev"
        ):

            provider_module = PROVIDERS.get(
                provider
            )

            if provider_module:

                print(
                    f"[HOOKTRACE] Using provider "
                    f"verifier: {provider}"
                )

                if not provider_module.verify(
                    request,
                    route_secret,
                ):
                    webhooks_invalid_signature.inc()

                    return JSONResponse(
                        status_code=401,
                        content={
                            "detail": (
                                "Invalid webhook signature"
                            )
                        },
                    )

            else:

                print(
                    "[HOOKTRACE] Using generic "
                    "signature verification"
                )

                if not signature:
                    webhooks_invalid_signature.inc()

                    return JSONResponse(
                        status_code=401,
                        content={
                            "detail": "Missing signature"
                        },
                    )

                if not verify_signature(
                    route_secret,
                    raw_body,
                    signature,
                    timestamp,
                ):
                    webhooks_invalid_signature.inc()

                    return JSONResponse(
                        status_code=401,
                        content={
                            "detail": (
                                "Invalid signature"
                            )
                        },
                    )

            print(
                "[HOOKTRACE] Signature validation passed"
            )

        # ----------------------------------
        # Idempotency protection
        # ----------------------------------

        if idempotency_key:

            existing = db.execute(
                text(
                    """
                    SELECT id
                    FROM webhook_events
                    WHERE
                        route_id = :route_id
                        AND idempotency_key = :key
                    """
                ),
                {
                    "route_id": route_id,
                    "key": idempotency_key,
                },
            ).fetchone()

            if existing:

                webhooks_deduplicated.inc()

                return {
                    "accepted": True,
                    "deduplicated": True,
                }

        # ----------------------------------
        # Resolve delivery target
        # ----------------------------------

        # delivery_target = (
        #     route_config["dev_target"]
        #     if route_config["mode"] == "dev"
        #     else route_config["prod_target"]
        # )

        # if not delivery_target:

        #     return JSONResponse(
        #         status_code=400,
        #         content={
        #             "detail": (
        #                 "No delivery target configured"
        #             )
        #         },
        #     )

        # ----------------------------------
        # Extract provider event type
        # ----------------------------------

        event_type = "unknown"

        provider_module = PROVIDERS.get(
            provider
        )

        if provider_module:

            try:

                extracted_type = (
                    provider_module.extract_event_type(
                        payload
                    )
                )

                if extracted_type:
                    event_type = str(
                        extracted_type
                    )

            except Exception as exc:

                print(
                    "[HOOKTRACE] Failed to extract "
                    f"event type for provider="
                    f"{provider}: {exc}"
                )

        print(
            "[HOOKTRACE] Event metadata: "
            f"provider={provider}, "
            f"event_type={event_type}"
        )

        # ----------------------------------
        # Persist event
        # ----------------------------------

        event = WebhookEvent(
            route_id=route_id,
            headers=headers,
            payload=payload,
            status="pending",
            idempotency_key=idempotency_key,
            event_type=event_type,
            provider=provider,
        )

        db.add(event)

        db.commit()

        db.refresh(event)

        print(
            f"[HOOKTRACE] Event persisted: "
            f"id={event.id}, "
            f"provider={provider}, "
            f"event_type={event_type}"
        )

        # ----------------------------------
        # Usage tracking
        # ----------------------------------

        db.execute(
            text(
                """
                INSERT INTO usage_metrics (
                    user_id,
                    event_id
                )
                VALUES (
                    (
                        SELECT user_id
                        FROM webhook_routes
                        WHERE id = :route_id
                    ),
                    :event_id
                )
                """
            ),
            {
                "route_id": route_id,
                "event_id": event.id,
            },
        )

        db.commit()

        # ----------------------------------
        # Metrics
        # ----------------------------------

        webhooks_received.labels(
            provider=provider,
            route=route,
        ).inc()

        print(
            "[HOOKTRACE] Metric incremented"
        )

        # ----------------------------------
        # Enqueue worker
        # ----------------------------------

        redis_client.lpush(
            "webhook:ingress",
            str(event.id),
        )

        print(
            f"[HOOKTRACE] Event {event.id} "
            f"queued for worker"
        )

        return {
            "accepted": True,
            "event_id": event.id,
            "provider": provider,
            "event_type": event_type,
        }

    except IntegrityError:

        db.rollback()

        webhooks_deduplicated.inc()

        return {
            "accepted": True,
            "deduplicated": True,
        }

    finally:

        db.close()


# ==========================================
# Integration webhook
# ==========================================


@router.post(
    "/webhook/{token}",
    status_code=status.HTTP_202_ACCEPTED,
)
async def integration_webhook(
    token: str,
    request: Request,
):
    db: Session = SessionLocal()

    try:

        route_config = db.execute(
            text(
                """
                SELECT
                    id,
                    route
                FROM webhook_routes
                WHERE token = :token
                LIMIT 1
                """
            ),
            {
                "token": token
            },
        ).mappings().first()

        if not route_config:

            return JSONResponse(
                status_code=404,
                content={
                    "detail": "Webhook not found"
                },
            )

        # Forward internally to relay
        return await relay(
            token,
            route_config["route"],
            request,
        )

    finally:

        db.close()