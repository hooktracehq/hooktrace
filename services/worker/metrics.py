from prometheus_client import Counter, Histogram

events_delivered = Counter(
    "hooktrace_events_delivered_total",
    "Successfully delivered webhook events",
    ["provider"],
)

events_failed = Counter(
    "hooktrace_events_failed_total",
    "Webhook events permanently failed",
    ["provider"],
)

events_retried = Counter(
    "hooktrace_events_retried_total",
    "Webhook delivery retries",
    ["provider"],
)


delivery_latency = Histogram(
    "hooktrace_delivery_latency_seconds",
    "Time taken to deliver webhook",
    ["provider"],
    buckets=(0.1, 0.3, 0.5, 1, 2, 5, 10),
)