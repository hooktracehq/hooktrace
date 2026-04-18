import hmac
import hashlib
from fastapi import Request


def verify(request: Request, secret: str) -> bool:
    """
    Verifies Slack webhook requests using signing secret.

    Slack sends:
        x-slack-request-timestamp
        x-slack-signature

    Signature format:
        v0=HMAC_SHA256(secret, "v0:timestamp:raw_body")

    Verification steps:
    - Extract timestamp and signature from headers
    - Build base string: "v0:timestamp:body"
    - Compute HMAC SHA256 digest
    - Compare with provided signature using constant-time comparison

    Returns:
        True if signature is valid, False otherwise.
    """

    timestamp = request.headers.get("x-slack-request-timestamp")
    signature = request.headers.get("x-slack-signature")

    # Reject if required headers are missing
    if not timestamp or not signature:
        return False

    # Slack requires exact raw body string for signature validation
    body = request.state.raw_body.decode()

    # Construct base string as per Slack specification
    base_string = f"v0:{timestamp}:{body}"

    # Compute HMAC SHA256 digest
    digest = hmac.new(
        secret.encode(),
        base_string.encode(),
        hashlib.sha256
    ).hexdigest()

    expected = f"v0={digest}"

    # Constant-time comparison to prevent timing attacks
    return hmac.compare_digest(expected, signature)


def extract_event_type(payload: dict) -> str:
    """
    Extracts event type from Slack webhook payload.

    Returns:
        Event type string or "unknown" if not present.
    """
    return payload.get("type", "unknown")