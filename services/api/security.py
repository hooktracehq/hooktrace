



import hmac
import hashlib
import time
import json
from typing import Optional

from services.shared.redis_client import redis_client


REPLAY_WINDOW_SECONDS = 300


# ============================================================
# Payload helpers
# ============================================================


def safe_json(data):
    return (
        json.dumps(
            data,
            separators=(",", ":"),
            sort_keys=True,
        )
        or str(data)
    )


def canonical_payload(payload) -> bytes:
    """
    Convert payload into bytes for signature verification.

    IMPORTANT:
    Raw webhook bytes are preserved exactly.

    This is critical because webhook signatures are generally
    calculated against the exact request body.
    """

    if isinstance(payload, bytes):
        return payload

    if isinstance(payload, str):
        return payload.encode()

    return safe_json(payload).encode()


# ============================================================
# Replay protection
# ============================================================


def is_replay(signature: str) -> bool:
    if not signature:
        return False

    cache_key = f"webhook:replay:{signature}"

    if redis_client.exists(cache_key):
        return True

    redis_client.setex(
        cache_key,
        REPLAY_WINDOW_SECONDS,
        "1",
    )

    return False


# ============================================================
# Generic HMAC verification
# ============================================================


def verify_signature(
    secret,
    payload,
    signature,
    timestamp=None,
):
    """
    Verify Hooktrace generic HMAC-SHA256 signature.

    Signature format:

        HMAC_SHA256(
            secret,
            timestamp + "." + raw_body
        )

    When timestamp is omitted:

        HMAC_SHA256(
            secret,
            raw_body
        )
    """

    # ----------------------------------
    # Basic validation
    # ----------------------------------

    if not secret:
        print(
            "[HOOKTRACE][SIG] Missing secret"
        )
        return False

    if not signature:
        print(
            "[HOOKTRACE][SIG] Missing signature"
        )
        return False

    # ----------------------------------
    # Preserve exact body
    # ----------------------------------

    payload_bytes = canonical_payload(
        payload
    )

    print(
        "[HOOKTRACE][SIG] "
        f"payload_length={len(payload_bytes)}"
    )

    # ----------------------------------
    # Timestamp validation
    # ----------------------------------

    if timestamp:

        try:

            timestamp_int = int(timestamp)
            now = int(time.time())

            age = abs(
                now - timestamp_int
            )

            print(
                "[HOOKTRACE][SIG] "
                f"timestamp={timestamp_int}"
            )

            print(
                "[HOOKTRACE][SIG] "
                f"timestamp_age={age}s"
            )

            if age > REPLAY_WINDOW_SECONDS:

                print(
                    "[HOOKTRACE][SIG] "
                    "timestamp outside replay window"
                )

                return False

        except (
            TypeError,
            ValueError,
        ):

            print(
                "[HOOKTRACE][SIG] "
                "invalid timestamp"
            )

            return False

    # ----------------------------------
    # Build signed message
    # ----------------------------------

    message = payload_bytes

    if timestamp:

        message = (
            f"{timestamp}.".encode()
            + payload_bytes
        )

    # ----------------------------------
    # Calculate expected HMAC
    # ----------------------------------

    expected = hmac.new(
        secret.encode(),
        message,
        hashlib.sha256,
    ).hexdigest()

    print(
        "[HOOKTRACE][SIG] "
        f"expected_signature_length={len(expected)}"
    )

    print(
        "[HOOKTRACE][SIG] "
        f"received_signature_length={len(signature)}"
    )

    print(
        "[HOOKTRACE][SIG] "
        f"signature_match={hmac.compare_digest(expected, signature)}"
    )

    # ----------------------------------
    # Replay protection
    # ----------------------------------

    if is_replay(signature):

        print(
            "[HOOKTRACE][SIG] "
            "replay detected"
        )

        return False

    # ----------------------------------
    # Final comparison
    # ----------------------------------

    return hmac.compare_digest(
        expected,
        signature,
    )


# ============================================================
# Signature generation
# ============================================================


def generate_signature(
    secret,
    payload,
):
    """
    Generate a generic Hooktrace HMAC signature.

    Returns:

        signature, timestamp
    """

    payload_bytes = canonical_payload(
        payload
    )

    timestamp = str(
        int(time.time())
    )

    message = (
        f"{timestamp}.".encode()
        + payload_bytes
    )

    signature = hmac.new(
        secret.encode(),
        message,
        hashlib.sha256,
    ).hexdigest()

    return signature, timestamp


# ============================================================
# Provider signature verification
# ============================================================


def verify_provider_signature(
    provider,
    secret,
    payload,
    headers,
):
    """
    Provider-specific signature verification.

    Generic Hooktrace signatures use:

        x-signature
        x-timestamp
    """

    provider = (
        provider or ""
    ).lower()

    normalized_headers = {
        k.lower(): v
        for k, v in headers.items()
    }

    # ----------------------------------
    # Stripe
    # ----------------------------------

    if provider == "stripe":

        signature = normalized_headers.get(
            "stripe-signature"
        )

        if not signature:
            return False

        # Existing provider-specific handling
        # remains delegated to the Stripe module.
        return False

    # ----------------------------------
    # GitHub
    # ----------------------------------

    if provider == "github":

        signature = normalized_headers.get(
            "x-hub-signature-256"
        )

        if not signature:
            return False

        return False

    # ----------------------------------
    # Slack
    # ----------------------------------

    if provider == "slack":

        signature = normalized_headers.get(
            "x-slack-signature"
        )

        if not signature:
            return False

        return False

    # ----------------------------------
    # Generic
    # ----------------------------------

    signature = normalized_headers.get(
        "x-signature"
    )

    timestamp = normalized_headers.get(
        "x-timestamp"
    )

    if not signature:
        return False

    return verify_signature(
        secret,
        payload,
        signature,
        timestamp,
    )