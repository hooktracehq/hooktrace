from fastapi import Request
from nacl.signing import VerifyKey
from nacl.exceptions import BadSignatureError


def verify(request: Request, public_key: str) -> bool:
    """
    Verifies incoming webhook requests using Ed25519 signature validation.

    Expected headers:
    - x-signature-ed25519: hex-encoded signature
    - x-signature-timestamp: timestamp used in signature

    The verification is performed by concatenating:
        timestamp + raw_body

    and validating it against the provided public key.

    Returns:
        True if signature is valid, False otherwise.
    """
    signature = request.headers.get("x-signature-ed25519")
    timestamp = request.headers.get("x-signature-timestamp")

    # Reject request if required headers are missing
    if not signature or not timestamp:
        return False

    # Raw request body must be preserved exactly for signature verification
    body = request.state.raw_body

    try:
        # Initialize verify key from hex-encoded public key
        verify_key = VerifyKey(bytes.fromhex(public_key))

        # Perform signature verification
        verify_key.verify(
            timestamp.encode() + body,
            bytes.fromhex(signature)
        )
        return True

    except BadSignatureError:
        # Signature mismatch indicates tampering or invalid request
        return False


def extract_event_type(payload: dict) -> str:
    """
    Extracts a normalized event type from webhook payload.

    Falls back to "unknown" if no type field is present.
    """
    return payload.get("type", "unknown")




async def handle_discord_webhook(payload: dict, headers: dict):
    """
    Handles Discord webhook payloads.

    Extracts the Discord gateway event type (`t`) and logs it.

    Args:
        payload: JSON payload from Discord webhook
        headers: Incoming request headers (currently unused)

    Returns:
        dict containing normalized provider and event type
    """
    # Discord uses 't' field for event type in gateway/webhook payloads
    event_type = payload.get("t")

    print(f"[discord] event received: {event_type}")

    return {
        "provider": "discord",
        "event_type": event_type
    }