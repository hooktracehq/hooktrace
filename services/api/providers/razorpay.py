import hmac
import hashlib
from fastapi import Request


def verify(request: Request, secret: str) -> bool:
    """
    Verify Razorpay webhook signature.
    """
    signature = request.headers.get("x-razorpay-signature")

    if not signature:
        return False

    payload = request.state.raw_body

    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected, signature)


def extract_event_type(payload: dict) -> str:
    return payload.get("event", "unknown")