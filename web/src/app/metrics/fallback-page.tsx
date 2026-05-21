export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { promRangeQuery } from "@/lib/prometheus"
import MetricsClient from "./metrics-client"

export default async function MetricsPage() {
  
    const latency = await promRangeQuery(
      "histogram_quantile(0.95, rate(hooktrace_delivery_latency_seconds_bucket[5m])) or vector(0)"
    )

    const retries = await promRangeQuery(
      "rate(hooktrace_events_retried_total[5m]) or vector(0)"
    )

    const rejected = await promRangeQuery(
      "rate(hooktrace_events_failed_total[5m]) or vector(0)"
    )

    const incoming = await promRangeQuery(
      "rate(hooktrace_webhooks_received_total[5m]) or vector(0)"
    )

    const delivered = await promRangeQuery(
      "increase(hooktrace_events_delivered_total[5m]) or vector(0)"
    )

    const failed = await promRangeQuery(
      "increase(hooktrace_events_failed_total[5m]) or vector(0)"
    )

    return (
      <MetricsClient
        latency={latency || []}
        retries={retries || []}
        rejected={rejected || []}
        incoming={incoming || []}
        delivered={delivered || []}
        failed={failed || []}
      />
    )
}