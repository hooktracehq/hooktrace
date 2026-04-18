from fastapi import Request


def verify(request: Request, secret: str) -> bool:
    """
    Verifies Notion webhook using Authorization header.

    Expected format:
        Authorization: Bearer <secret>

    Returns:
        True if token matches, False otherwise.
    """
    auth = request.headers.get("authorization")

    # Reject if header is missing
    if not auth:
        return False

    # Simple token comparison
    return auth == f"Bearer {secret}"


def extract_event_type(payload: dict) -> str:
    """
    Extracts event type from Notion webhook payload.

    Falls back to "unknown" if not present.
    """
    return payload.get("type", "unknown")



async def handle_notion_webhook(payload: dict, headers: dict):
    """
    Handles Notion webhook events.

    Logs event type and returns normalized structure.

    Args:
        payload: Notion webhook JSON payload
        headers: Incoming request headers (currently unused)

    Returns:
        dict containing provider and event type
    """
    event_type = payload.get("type")

    print(f"[notion] event received: {event_type}")

    return {
        "provider": "notion",
        "event_type": event_type
    }