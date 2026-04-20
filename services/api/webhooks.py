"""
Webhook Receiver & Router
Connects frontend integrations to backend provider handlers
"""

from datetime import datetime
from fastapi import APIRouter, Request, Header, HTTPException
from sqlalchemy import text
from typing import Optional
import json

from .database import SessionLocal
from ..worker.delivery_targets_router import route_webhook_to_targets 
from ..api.redis_client import redis_client
from ..api.ws import manager  

router = APIRouter(prefix="/webhook", tags=["webhooks"])


@router.post("/{token}")
async def receive_webhook(
    request: Request,
    token: str,
    x_stripe_signature: Optional[str] = Header(None),
    x_hub_signature_256: Optional[str] = Header(None),
    x_shopify_hmac_sha256: Optional[str] = Header(None),
):
    db = SessionLocal()

    try:
        # -----------------------------
        # Parse request safely
        # -----------------------------
        body = await request.body()
        payload = json.loads(body) if body else {}
        headers = dict(request.headers)

        # -----------------------------
        # Lookup route
        # -----------------------------
        route = db.execute(
            text("""
                SELECT id, user_id, provider
                FROM webhook_routes
                WHERE token = :token
            """),
            {"token": token}
        ).fetchone()

        if not route:
            raise HTTPException(status_code=404, detail="Invalid webhook token")

        route_id = route[0]
        user_id = route[1]
        provider = route[2]

        # -----------------------------
        # Fallback provider detection
        # -----------------------------
        if not provider:
            if "type" in payload:
                provider = "stripe"
            elif "event" in payload:
                provider = "supabase"
            elif "hook" in payload:
                provider = "shopify"
            else:
                provider = "unknown"

        # -----------------------------
        # Detect event type
        # -----------------------------
        if provider == "stripe":
            event_type = payload.get("type")
        elif provider == "github":
            event_type = headers.get("x-github-event")
        elif provider == "shopify":
            event_type = headers.get("x-shopify-topic")
        elif provider == "slack":
            event_type = payload.get("type")
        elif provider == "discord":
            event_type = payload.get("t")
        else:
            event_type = payload.get("type") or payload.get("event")

        # -----------------------------
        # INITIAL STATUS
        # -----------------------------
        status = "pending"

        # -----------------------------
        # Store event
        # -----------------------------
        result = db.execute(
            text("""
                INSERT INTO webhook_events
                (route_id, provider, event_type, payload, headers, status)
                VALUES (:route_id, :provider, :event_type, :payload, :headers, :status)
                RETURNING id
            """),
            {
                "route_id": route_id,
                "provider": provider,
                "event_type": event_type,
                "payload": json.dumps(payload),
                "headers": json.dumps(headers),
                "status": status
            }
        )

        event_id = result.fetchone()[0]
        db.commit()

        # -----------------------------
        # Queue for async processing
        # -----------------------------
        redis_client.lpush("webhook:queue", str(event_id))

        # -----------------------------
        # OPTIONAL handler
        # -----------------------------
        handler = get_provider_handler(provider)

        if handler:
            try:
                await handler(payload, headers)

                status = "delivered"

                db.execute(
                    text("""
                        UPDATE webhook_events
                        SET status = :status,
                            processed_at = CURRENT_TIMESTAMP
                        WHERE id = :id
                    """),
                    {"id": event_id, "status": status}
                )
                db.commit()

            except Exception as e:
                print("Handler error:", e)

                status = "failed"

                db.execute(
                    text("""
                        UPDATE webhook_events
                        SET status = :status
                        WHERE id = :id
                    """),
                    {"id": event_id, "status": status}
                )
                db.commit()

        # -----------------------------
        # 🔥 BROADCAST FINAL STATE
        # -----------------------------
        await manager.broadcast(json.dumps({
            "id": event_id,
            "provider": provider,
            "event_type": event_type,
            "status": status,
            "route": "stripe-webhook",
            "attempt_count": 0,
            "created_at": datetime.utcnow().isoformat()
        }))

        # -----------------------------
        # FINAL RESPONSE
        # -----------------------------
        return {
            "success": True,
            "event_id": event_id,
            "provider": provider,
            "event_type": event_type,
            "status": status  
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        db.close()


# -----------------------------
# Provider Handler Loader
# -----------------------------
def get_provider_handler(provider: str):
    try:
        module = __import__(
            f"services.api.providers.{provider}",
            fromlist=[f"handle_{provider}_webhook"]
        )
        return getattr(module, f"handle_{provider}_webhook")
    except Exception:
        return None