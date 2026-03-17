from fastapi import Request


def verify(request: Request, secret: str) -> bool:
    """
    Verify Notion webhook using Authorization header.
    """
    auth = request.headers.get("authorization")

    if not auth:
        return False

    return auth == f"Bearer {secret}"


def extract_event_type(payload: dict) -> str:
    return payload.get("type", "unknown")