import hmac
import hashlib
from fastapi import Request


def _compute_signature(secret: str, payload: bytes) -> str:
    """
    Computes HMAC SHA256 signature for a given payload using the shared secret.

    GitHub signs payloads as:
        sha256=HMAC_HEX_DIGEST

    Returns:
        Signature string in the same format as GitHub header.
    """
    digest = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    return f"sha256={digest}"


def verify(request: Request, secret: str) -> bool:
    """
    Verifies GitHub webhook signature using X-Hub-Signature-256 header.

    Process:
    - Read signature from header
    - Recompute signature using request raw body
    - Compare using constant-time comparison to prevent timing attacks

    Returns:
        True if signature is valid, False otherwise.
    """
    sig_header = request.headers.get("x-hub-signature-256")

    # Reject if signature header is missing
    if not sig_header:
        return False

    # Raw request body must match exactly what GitHub signed
    payload = request.state.raw_body

    expected = _compute_signature(secret, payload)

    # Constant-time comparison to avoid timing attacks
    return hmac.compare_digest(expected, sig_header)


def extract_event_type(payload: dict) -> str:
    """
    Extracts event type from GitHub payload.

    Note:
    - Primary event type comes from header: X-GitHub-Event
    - Payload 'action' gives more granular context (e.g. opened, closed)

    This function falls back to payload action.
    """
    return payload.get("action", "unknown")




async def handle_github_webhook(payload: dict, headers: dict):
    """
    Handles GitHub webhook events.

    Extracts event type from headers and logs it.

    Args:
        payload: GitHub webhook JSON payload
        headers: Incoming request headers

    Returns:
        dict containing normalized provider and event type
    """
    event_type = headers.get("x-github-event")

    print(f"[github] event received: {event_type}")

    return {
        "provider": "github",
        "event_type": event_type
    }