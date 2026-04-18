from fastapi import Request


def verify(request: Request, secret: str) -> bool:
    """
    Verifies Notion webhook requests using Authorization header.

    Expected format:
        Authorization: Bearer <secret>

    This performs a direct comparison with the configured secret.

    Returns:
        True if the provided token matches the expected secret, False otherwise.
    """
    auth = request.headers.get("authorization")

    # Reject if Authorization header is missing
    if not auth:
        return False

    # Validate Bearer token
    return auth == f"Bearer {secret}"


def extract_event_type(payload: dict) -> str:
    """
    Extracts event type from Notion webhook payload.

    Returns:
        Event type string or "unknown" if not present.
    """
    return payload.get("type", "unknown")