print(">>> routes.py loaded <<<")

import json

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


# ============================================================
# Provider detection
# ============================================================


def detect_provider(request: Request, route_provider: str | None = None) -> str:
    """
    Detect provider from webhook headers.

    Header-based detection has priority.

    If no provider-specific signature/header exists,
    fall back to the provider configured on the route.

    This is important for local/dev testing where a request
    may not contain real provider signature headers.
    """

    headers = request.headers

    # ----------------------------------
    # Provider-specific headers
    # ----------------------------------

    if "stripe-signature" in headers:
        return "stripe"

    if "x-hub-signature-256" in headers:
        return "github"

    if "x-razorpay-signature" in headers:
        return "razorpay"

    if "x-shopify-hmac-sha256" in headers:
        return "shopify"

    if "x-slack-signature" in headers:
        return "slack"

    if "x-signature-ed25519" in headers:
        return "discord"

    if "x-notion-signature" in headers:
        return "notion"

    if "x-supabase-signature" in headers:
        return "supabase"

    # ----------------------------------
    # Route provider fallback
    # ----------------------------------

    if route_provider:
        return route_provider

    return "generic"


# ============================================================
# Payload parsing
# ============================================================


def parse_payload(
    raw_body: bytes,
    content_type: str,
):
    """
    Parse webhook body.

    JSON bodies are converted into real Python objects.

    utf-8-sig is intentionally used so UTF-8 BOMs are removed.

    Example:

        b'\\xef\\xbb\\xbf{"id":"evt_123"}'

    becomes:

        {"id": "evt_123"}

    rather than a JSON string containing the BOM.
    """

    if not raw_body:
        return {}

    content_type = (content_type or "").lower()

    # ----------------------------------
    # JSON
    # ----------------------------------

    if (
        "application/json" in content_type
        or "application/*+json" in content_type
    ):
        try:
            raw_text = raw_body.decode("utf-8-sig")

            print(
                "[HOOKTRACE] Raw JSON body:",
                repr(raw_text),
            )

            parsed = json.loads(raw_text)

            print(
                "[HOOKTRACE] Parsed payload type:",
                type(parsed).__name__,
            )

            print(
                "[HOOKTRACE] Parsed payload:",
                parsed,
            )

            return parsed

        except (
            json.JSONDecodeError,
            UnicodeDecodeError,
        ) as exc:

            print(
                "[HOOKTRACE] JSON parsing failed:",
                exc,
            )

            # Preserve malformed payload instead of
            # silently dropping it.
            return raw_body.decode(
                "utf-8",
                errors="replace",
            )

    # ----------------------------------
    # Non-JSON
    # ----------------------------------

    try:
        return raw_body.decode(
            "utf-8",
            errors="replace",
        )

    except Exception:
        return {}


# ============================================================
# Relay
# ============================================================


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

    # IMPORTANT:
    # Preserve exact raw bytes for provider
    # signature verification.
    request.state.raw_body = raw_body

    print(
        "[HOOKTRACE] Raw body length:",
        len(raw_body),
    )

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

    content_type = request.headers.get(
        "content-type",
        "",
    )

    # ----------------------------------
    # Database
    # ----------------------------------

    db: Session = SessionLocal()

    try:

        # ====================================================
        # Load route
        # ====================================================

        route_config = db.execute(
            text(
                """
                SELECT
                    id,
                    secret,
                    mode,
                    provider
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
        route_mode = route_config["mode"]
        route_provider = route_config["provider"]

        print(
            "[HOOKTRACE] Route loaded:",
            f"id={route_id},",
            f"route={route},",
            f"provider={route_provider},",
            f"mode={route_mode}",
        )

        # ====================================================
        # Rate limiting
        # ====================================================

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

        # ====================================================
        # Detect provider
        # ====================================================

        provider = detect_provider(
            request,
            route_provider,
        )

        print(
            f"[HOOKTRACE] Detected provider: {provider}"
        )

        # ====================================================
        # Parse payload
        # ====================================================

        payload = parse_payload(
            raw_body,
            content_type,
        )

        print(
            "[HOOKTRACE] FINAL payload type:",
            type(payload).__name__,
        )

        print(
            "[HOOKTRACE] FINAL payload:",
            payload,
        )

        # ====================================================
        # Signature validation
        # ====================================================

        if (
            route_secret
            and route_mode != "dev"
        ):

            provider_module = PROVIDERS.get(
                provider
            )

            if provider_module:

                print(
                    "[HOOKTRACE] Using provider "
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

        # ====================================================
        # Idempotency protection
        # ====================================================

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

        # ====================================================
        # Extract provider event type
        # ====================================================

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

        # ----------------------------------------------------
        # Generic fallback
        #
        # Useful for providers/dev requests where the
        # provider module doesn't expose an extractor.
        # ----------------------------------------------------

        if event_type == "unknown" and isinstance(
            payload,
            dict,
        ):

            possible_event_type = (
                payload.get("type")
                or payload.get("event_type")
                or payload.get("event")
            )

            if possible_event_type:

                event_type = str(
                    possible_event_type
                )

        print(
            "[HOOKTRACE] Event metadata:",
            f"provider={provider},",
            f"event_type={event_type}",
        )

        # ====================================================
        # Persist event
        # ====================================================

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
            "[HOOKTRACE] Event persisted:",
            f"id={event.id},",
            f"provider={provider},",
            f"event_type={event_type},",
            f"payload_type={type(payload).__name__}",
        )

        # ====================================================
        # Usage tracking
        # ====================================================

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

        # ====================================================
        # Metrics
        # ====================================================

        webhooks_received.labels(
            provider=provider,
            route=route,
        ).inc()

        print(
            "[HOOKTRACE] Metric incremented"
        )

        # ====================================================
        # Enqueue worker
        # ====================================================

        redis_client.lpush(
            "webhook:ingress",
            str(event.id),
        )

        print(
            "[HOOKTRACE] Event queued:",
            event.id,
        )

        # ====================================================
        # Response
        # ====================================================

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

    except Exception as exc:

        db.rollback()

        print(
            "[HOOKTRACE] Relay error:",
            repr(exc),
        )

        raise

    finally:

        db.close()


# ============================================================
# Integration webhook
# ============================================================


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