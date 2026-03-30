
"""
Webhook Receiver & Router
Connects frontend integrations to backend provider handlers
"""

from datetime import datetime
from typing import Dict, Any, Optional
import uuid
import hmac
import hashlib

from fastapi import APIRouter, Request, Header, HTTPException, Depends
from sqlalchemy import text

from database import SessionLocal
from auth import get_current_user


router = APIRouter(prefix="/webhook", tags=["webhooks"])


# -----------------------------
# Database Setup
# -----------------------------

CREATE_WEBHOOK_EVENTS_TABLE = """
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(255),
    payload JSONB NOT NULL,
    headers JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    attempt_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX idx_webhook_events_user_id ON webhook_events(user_id);
CREATE INDEX idx_webhook_events_provider ON webhook_events(provider);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
"""


# -----------------------------
# Provider Signature Verification
# -----------------------------

def verify_stripe_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify Stripe webhook signature"""
    try:
        expected_sig = hmac.new(
            secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        # Stripe sends signature like: t=timestamp,v1=signature
        sig_parts = dict(s.split('=') for s in signature.split(','))
        return hmac.compare_digest(expected_sig, sig_parts.get('v1', ''))
    except Exception:
        return False


def verify_github_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify GitHub webhook signature"""
    try:
        expected_sig = 'sha256=' + hmac.new(
            secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected_sig, signature)
    except Exception:
        return False


def verify_shopify_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify Shopify webhook signature"""
    try:
        expected_sig = hmac.new(
            secret.encode(),
            payload,
            hashlib.sha256
        ).digest().hex()
        return hmac.compare_digest(expected_sig, signature)
    except Exception:
        return False


# -----------------------------
# Webhook Receiver Endpoint
# -----------------------------

@router.post("/{user_identifier}/{provider}")
async def receive_webhook(
    request: Request,
    user_identifier: str,
    provider: str,
    # Provider-specific signature headers
    x_stripe_signature: Optional[str] = Header(None),
    x_hub_signature_256: Optional[str] = Header(None),  # GitHub
    x_shopify_hmac_sha256: Optional[str] = Header(None),  # Shopify
):
    """
    Universal webhook receiver
    Accepts webhooks from any provider and routes to appropriate handler
    
    URL Format: /webhook/{user_email_or_id}/{provider}
    Example: /webhook/john@example.com/stripe
    """
    db = SessionLocal()
    
    try:
        # Get request body
        body = await request.body()
        payload = await request.json()
        
        # Get all headers
        headers = dict(request.headers)
        
        # Find user
        user = db.execute(
            text("""
                SELECT id FROM users 
                WHERE email = :identifier OR id = :identifier
            """),
            {"identifier": user_identifier}
        ).fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = str(user[0])
        
        # Verify signature if configured
        # TODO: Get webhook secret from user's integration config
        # For now, skip verification in dev mode
        
        # Determine event type
        event_type = None
        if provider == "stripe":
            event_type = payload.get("type")
        elif provider == "github":
            event_type = headers.get("x-github-event")
        elif provider == "shopify":
            event_type = headers.get("x-shopify-topic")
        elif provider == "slack":
            event_type = payload.get("type")
        elif provider == "discord":
            event_type = payload.get("t")  # Event type
        
        # Store webhook event
        event_id = str(uuid.uuid4())
        db.execute(
            text("""
                INSERT INTO webhook_events 
                (id, user_id, provider, event_type, payload, headers, status)
                VALUES (:id, :user_id, :provider, :event_type, :payload, :headers, 'received')
            """),
            {
                "id": event_id,
                "user_id": user_id,
                "provider": provider,
                "event_type": event_type,
                "payload": payload,
                "headers": headers,
            }
        )
        db.commit()
        
        # Process webhook asynchronously
        try:
            # Import provider handler
            handler = get_provider_handler(provider)
            
            if handler:
                # Call provider-specific handler
                result = await handler(payload, headers)
                
                # Update status
                db.execute(
                    text("""
                        UPDATE webhook_events 
                        SET status = 'processed', 
                            processed_at = CURRENT_TIMESTAMP
                        WHERE id = :id
                    """),
                    {"id": event_id}
                )
                db.commit()
                
                # Forward to delivery targets
                from services.workers.delivery_targets_router import route_webhook_to_targets
                
                delivery_result = route_webhook_to_targets(
                    user_id=user_id,
                    webhook_data=payload,
                    provider=provider
                )
                
                # Forward to dev tunnels if any
                from services.tunnels.tunnel_manager import forward_to_tunnels
                
                tunnel_result = await forward_to_tunnels(
                    user_id=user_id,
                    provider=provider,
                    payload=payload,
                    headers=headers
                )
                
                return {
                    "success": True,
                    "event_id": event_id,
                    "provider": provider,
                    "event_type": event_type,
                    "delivery": delivery_result,
                    "tunnels": tunnel_result,
                }
            else:
                # No handler, just store
                return {
                    "success": True,
                    "event_id": event_id,
                    "provider": provider,
                    "event_type": event_type,
                    "message": "Webhook received but no handler configured"
                }
                
        except Exception as e:
            # Update error status
            db.execute(
                text("""
                    UPDATE webhook_events 
                    SET status = 'error',
                        last_error = :error,
                        attempt_count = attempt_count + 1
                    WHERE id = :id
                """),
                {"id": event_id, "error": str(e)}
            )
            db.commit()
            
            # Still return success to provider
            return {
                "success": True,
                "event_id": event_id,
                "error": str(e)
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
    """Dynamically load provider handler"""
    try:
        if provider == "stripe":
            from services.providers.stripe import handle_stripe_webhook
            return handle_stripe_webhook
        elif provider == "github":
            from services.providers.github import handle_github_webhook
            return handle_github_webhook
        elif provider == "shopify":
            from services.providers.shopify import handle_shopify_webhook
            return handle_shopify_webhook
        elif provider == "slack":
            from services.providers.slack import handle_slack_webhook
            return handle_slack_webhook
        elif provider == "discord":
            from services.providers.discord import handle_discord_webhook
            return handle_discord_webhook
        elif provider == "notion":
            from services.providers.notion import handle_notion_webhook
            return handle_notion_webhook
        elif provider == "razorpay":
            from services.providers.razorpay import handle_razorpay_webhook
            return handle_razorpay_webhook
        elif provider == "supabase":
            from services.providers.supabase import handle_supabase_webhook
            return handle_supabase_webhook
        else:
            return None
    except ImportError:
        return None


# -----------------------------
# Webhook Events API
# -----------------------------

@router.get("/events")
def list_webhook_events(
    status: Optional[str] = None,
    provider: Optional[str] = None,
    user_id: str = Depends(get_current_user)
):
    """List webhook events for current user"""
    db = SessionLocal()
    try:
        query = """
            SELECT 
                id, provider, event_type, status, 
                attempt_count, created_at, last_error
            FROM webhook_events
            WHERE user_id = :user_id
        """
        params = {"user_id": user_id}
        
        if status:
            if status == "dlq":
                query += " AND status = 'failed' AND attempt_count >= 5"
            else:
                query += " AND status = :status"
                if status == "failed":
                    query += " AND attempt_count < 5"
                params["status"] = status
        
        if provider:
            query += " AND provider = :provider"
            params["provider"] = provider
        
        query += " ORDER BY created_at DESC LIMIT 100"
        
        events = db.execute(text(query), params).fetchall()
        
        return {
            "items": [
                {
                    "id": str(row[0]),
                    "provider": row[1],
                    "event_type": row[2],
                    "status": row[3],
                    "attempt_count": row[4],
                    "created_at": row[5].isoformat() if row[5] else None,
                    "last_error": row[6],
                }
                for row in events
            ]
        }
    finally:
        db.close()


@router.get("/events/{event_id}")
def get_webhook_event(
    event_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get detailed webhook event"""
    db = SessionLocal()
    try:
        event = db.execute(
            text("""
                SELECT 
                    id, provider, event_type, payload, headers,
                    status, attempt_count, last_error, 
                    created_at, processed_at
                FROM webhook_events
                WHERE id = :id AND user_id = :user_id
            """),
            {"id": event_id, "user_id": user_id}
        ).fetchone()
        
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        return {
            "id": str(event[0]),
            "provider": event[1],
            "event_type": event[2],
            "payload": event[3],
            "headers": event[4],
            "status": event[5],
            "attempt_count": event[6],
            "last_error": event[7],
            "created_at": event[8].isoformat() if event[8] else None,
            "processed_at": event[9].isoformat() if event[9] else None,
        }
    finally:
        db.close()