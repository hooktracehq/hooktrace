import stripe
from fastapi import Request


def verify(request: Request, secret: str) -> bool:
    """
    Verifies Stripe webhook signature.

    Stripe sends a signature header:
        stripe-signature

    Verification uses:
    - Raw request body (must be exact, unmodified)
    - Signature header
    - Endpoint signing secret

    Stripe SDK handles:
    - Timestamp validation
    - Signature verification

    Returns:
        True if signature is valid, False otherwise.
    """
    payload = request.state.raw_body
    sig_header = request.headers.get("stripe-signature")

    # Reject if signature header is missing
    if not sig_header:
        return False

    try:
        # Validate signature using Stripe SDK
        stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=secret,
        )
        return True

    except stripe.error.SignatureVerificationError:
        # Signature mismatch or invalid
        return False

    except Exception:
        # Any unexpected error during verification
        return False


def extract_event_type(payload: dict) -> str:
    """
    Extracts event type from Stripe webhook payload.

    Example:
        payment_intent.succeeded

    Returns:
        Event type string or "unknown" if not present.
    """
    return payload.get("type", "unknown")




async def handle_stripe_webhook(payload: dict, headers: dict):
    """
    Handles Stripe webhook events.

    Logs event type and applies basic example processing logic.

    Args:
        payload: Stripe webhook JSON payload
        headers: Incoming request headers (currently unused)

    Returns:
        dict containing provider and event type
    """
    event_type = payload.get("type")

    print(f"[stripe] received event: {event_type}")

    # Example processing logic for successful payment events
    if event_type == "payment_intent.succeeded":
        print("Payment succeeded")

    return {
        "provider": "stripe",
        "event_type": event_type
    }