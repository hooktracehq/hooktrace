# from fastapi import APIRouter, Request, status
# from fastapi.responses import JSONResponse
# from sqlalchemy.orm import Session
# from sqlalchemy.exc import IntegrityError
# from sqlalchemy import text
# from rate_limit import check_rate_limit

# from database import SessionLocal
# from models import WebhookEvent
# from redis_client import redis_client

# from security import verify_signature
# from providers import stripe as stripe_provider
# from providers import github as github_provider

# from metrics import (
#     webhooks_received,
#     webhooks_deduplicated,
#     webhooks_invalid_signature,
# )

# router = APIRouter()
# @router.post("/r/{token}/{route}", status_code=status.HTTP_202_ACCEPTED)
# async def relay(token: str, route: str, request: Request):
#     raw_body = await request.body()

#     try:
#         payload = await request.json()
#     except Exception:
#         payload = raw_body.decode(errors="ignore") if raw_body else None

#     headers = dict(request.headers)
#     idempotency_key = request.headers.get("idempotency-key")
#     signature = request.headers.get("x-signature")
#     timestamp = request.headers.get("x-timestamp")

#     provider = None
#     if "stripe-signature" in request.headers:
#         provider = "stripe"
#     elif "x-hub-signature-256" in request.headers:
#         provider = "github"

#     db: Session = SessionLocal()

#     try:
#         route_config = db.execute(
#             text(
#                 """
#                 SELECT id, secret, mode, dev_target, prod_target
#                 FROM webhook_routes
#                 WHERE token = :token AND route = :route
#                 """
#             ),
#             {"token": token, "route": route},
#         ).mappings().first()

#         if not route_config:
#             return JSONResponse(
#                 status_code=404, content={"detail": "Route not found"}
#             )

#         route_id = route_config["id"]
#         route_secret = route_config["secret"]

#         # Signature validation
#         if route_secret and route_config["mode"] != "dev":
#             if provider == "stripe":
#                 if not stripe_provider.verify(request, route_secret):
#                     webhooks_invalid_signature.inc()
#                     return JSONResponse(
#                         status_code=401,
#                         content={"detail": "Invalid Stripe signature"},
#                     )

#             elif provider == "github":
#                 if not github_provider.verify(request, route_secret):
#                     webhooks_invalid_signature.inc()
#                     return JSONResponse(
#                         status_code=401,
#                         content={"detail": "Invalid GitHub signature"},
#                     )

#             else:
#                 if not signature:
#                     webhooks_invalid_signature.inc()
#                     return JSONResponse(
#                         status_code=401,
#                         content={"detail": "Missing signature"},
#                     )

#                 if not verify_signature(
#                     route_secret, raw_body, signature, timestamp
#                 ):
#                     webhooks_invalid_signature.inc()
#                     return JSONResponse(
#                         status_code=401,
#                         content={"detail": "Invalid signature"},
#                     )

#         # 🧠 Idempotency Protection (DB-level dedupe)
#         if idempotency_key:
#             existing = db.execute(
#                 text(
#                     """
#                     SELECT id FROM webhook_events
# WHERE route_id = :route_id
# AND idempotency_key = :key
#                     """
#                 ),
#                 {
#                     "route_id": route_id,
#                     "key": idempotency_key,
#                 },
#             ).fetchone()

#             if existing:
#                 webhooks_deduplicated.inc()
#                 return {"accepted": True, "deduplicated": True}

#         # 🎯 Resolve delivery target
#         delivery_target = (
#             route_config["dev_target"]
#             if route_config["mode"] == "dev"
#             else route_config["prod_target"]
#         )

#         if not delivery_target:
#             return JSONResponse(
#                 status_code=400,
#                 content={"detail": "No delivery target configured"},
#             )

#         # 📦 Persist event
#         event = WebhookEvent(
#     route_id=route_id,
#     headers=headers,
#     payload=payload,
#     status="pending",
#     idempotency_key=idempotency_key
# )

#         db.add(event)
#         db.commit()
#         db.refresh(event)

#         webhooks_received.labels(token=token, route=route).inc()

#         # 🚚 Enqueue
#         redis_client.lpush("webhook:queue", str(event.id))

#         return {"accepted": True}

#     except IntegrityError:
#         db.rollback()
#         webhooks_deduplicated.inc()
#         return {"accepted": True, "deduplicated": True}

#     finally:
#         db.close()






from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
from rate_limit import check_rate_limit

from database import SessionLocal
from models import WebhookEvent
from redis_client import redis_client

from security import verify_signature
from providers import stripe as stripe_provider
from providers import github as github_provider

from metrics import (
    webhooks_received,
    webhooks_deduplicated,
    webhooks_invalid_signature,
)

router = APIRouter()

@router.post("/r/{token}/{route}", status_code=status.HTTP_202_ACCEPTED)
async def relay(token: str, route: str, request: Request):

    raw_body = await request.body()

    try:
        payload = await request.json()
    except Exception:
        payload = raw_body.decode(errors="ignore") if raw_body else None

    headers = dict(request.headers)
    idempotency_key = request.headers.get("idempotency-key")
    signature = request.headers.get("x-signature")
    timestamp = request.headers.get("x-timestamp")

    provider = None
    if "stripe-signature" in request.headers:
        provider = "stripe"
    elif "x-hub-signature-256" in request.headers:
        provider = "github"

    db: Session = SessionLocal()

    try:
        route_config = db.execute(
            text(
                """
                SELECT id, secret, mode, dev_target, prod_target
                FROM webhook_routes
                WHERE token = :token AND route = :route
                """
            ),
            {"token": token, "route": route},
        ).mappings().first()

        if not route_config:
            return JSONResponse(
                status_code=404, content={"detail": "Route not found"}
            )

        route_id = route_config["id"]
        route_secret = route_config["secret"]

        # 🚦 Rate Limit Check (NEW)
        if not check_rate_limit(token, route):
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded"},
            )

        # Signature validation
        if route_secret and route_config["mode"] != "dev":
            if provider == "stripe":
                if not stripe_provider.verify(request, route_secret):
                    webhooks_invalid_signature.inc()
                    return JSONResponse(
                        status_code=401,
                        content={"detail": "Invalid Stripe signature"},
                    )

            elif provider == "github":
                if not github_provider.verify(request, route_secret):
                    webhooks_invalid_signature.inc()
                    return JSONResponse(
                        status_code=401,
                        content={"detail": "Invalid GitHub signature"},
                    )

            else:
                if not signature:
                    webhooks_invalid_signature.inc()
                    return JSONResponse(
                        status_code=401,
                        content={"detail": "Missing signature"},
                    )

                if not verify_signature(
                    route_secret, raw_body, signature, timestamp
                ):
                    webhooks_invalid_signature.inc()
                    return JSONResponse(
                        status_code=401,
                        content={"detail": "Invalid signature"},
                    )

        # 🧠 Idempotency Protection (DB-level dedupe)
        if idempotency_key:
            existing = db.execute(
                text(
                    """
                    SELECT id FROM webhook_events
                    WHERE route_id = :route_id
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
                return {"accepted": True, "deduplicated": True}

        # 🎯 Resolve delivery target
        delivery_target = (
            route_config["dev_target"]
            if route_config["mode"] == "dev"
            else route_config["prod_target"]
        )

        if not delivery_target:
            return JSONResponse(
                status_code=400,
                content={"detail": "No delivery target configured"},
            )

        # 📦 Persist event
        event = WebhookEvent(
            route_id=route_id,
            headers=headers,
            payload=payload,
            status="pending",
            idempotency_key=idempotency_key
        )

        db.add(event)
        db.commit()
        db.refresh(event)

        webhooks_received.labels(token=token, route=route).inc()

        # 🚚 Enqueue
        redis_client.lpush("webhook:queue", str(event.id))

        return {"accepted": True}

    except IntegrityError:
        db.rollback()
        webhooks_deduplicated.inc()
        return {"accepted": True, "deduplicated": True}

    finally:
        db.close()