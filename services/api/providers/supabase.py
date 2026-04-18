from fastapi import Request


def verify(request: Request, secret: str) -> bool:
    """
    Verifies Supabase webhook using a shared secret header.

    Expected header:
        x-supabase-signature

    This performs a direct comparison between the incoming signature
    and the configured secret.

    Returns:
        True if signature matches, False otherwise.
    """
    signature = request.headers.get("x-supabase-signature")

    # Reject if signature header is missing
    if not signature:
        return False

    # Simple equality check against shared secret
    return signature == secret


def extract_event_type(payload: dict) -> str:
    """
    Extracts event type from Supabase webhook payload.

    Returns:
        Event type string or "unknown" if not present.
    """
    return payload.get("type", "unknown")



async def handle_supabase_webhook(payload: dict, headers: dict):
    """
    Handles Supabase webhook events.

    Logs event type and returns normalized structure.

    Args:
        payload: Supabase webhook JSON payload
        headers: Incoming request headers (currently unused)

    Returns:
        dict containing provider and event type
    """
    event_type = payload.get("type")

    print(f"[supabase] event received: {event_type}")

    return {
        "provider": "supabase",
        "event_type": event_type
    }