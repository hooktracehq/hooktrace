from prometheus_client import (
    Counter,
)

# ==========================================
# WEBHOOK INGESTION METRICS (API)
# ==========================================

webhooks_received = Counter(
    "hooktrace_webhooks_received_total",
    "Total number of webhooks received",
    ["provider", "route"],
)

webhooks_deduplicated = Counter(
    "hooktrace_webhooks_deduplicated_total",
    "Duplicate webhooks ignored",
)

webhooks_invalid_signature = Counter(
    "hooktrace_webhooks_invalid_signature_total",
    "Webhooks rejected due to invalid signature",
)