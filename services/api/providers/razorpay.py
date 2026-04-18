import hmac
import hashlib
from fastapi import Request


def verify(request: Request, secret: str) -> bool:
    """
    Verifies Razorpay webhook signature using HMAC SHA256.

    Razorpay sends a signature in the header:
        x-razorpay-signature

    The signature is computed as:
        HMAC_SHA256(secret, raw_request_body)

    Verification steps:
    - Extract signature from header
    - Recompute signature using raw body and shared secret
    - Compare using constant-time comparison

    Returns:
        True if signature is valid, False otherwise.
    """
    signature = request.headers.get("x-razorpay-signature")

    # Reject if signature header is missing
    if not signature:
        return False

    # Raw body must match exactly what Razorpay signed
    payload = request.state.raw_body

    # Compute expected signature
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    # Constant-time comparison to prevent timing attacks
    return hmac.compare_digest(expected, signature)


def extract_event_type(payload: dict) -> str:
    """
    Extracts event type from Razorpay webhook payload.

    Razorpay uses 'event' field to indicate event type.

    Returns:
        Event type string or "unknown" if not present.
    """
    return payload.get("event", "unknown")



async def handle_razorpay_webhook(payload: dict, headers: dict):
    """
    Handles Razorpay webhook events.

    Logs event type and returns normalized structure.

    Args:
        payload: Razorpay webhook JSON payload
        headers: Incoming request headers (currently unused)

    Returns:
        dict containing provider and event type
    """
    event_type = payload.get("event")

    print(f"[razorpay] event received: {event_type}")

    return {
        "provider": "razorpay",
        "event_type": event_type
    }