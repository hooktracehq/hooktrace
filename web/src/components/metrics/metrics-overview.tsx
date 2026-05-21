"use client"

import {
  Activity,
  AlertTriangle,
  RotateCcw,
  Timer,
} from "lucide-react"

import { MetricsCard } from "./metrics-card"

type Props = {
  total: number
  failures: number
  retries: number
  latency: number
}

export function MetricsOverview({
  total,
  failures,
  retries,
  latency,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <MetricsCard
        label="Total Events"
        value={total}
        icon={Activity}
      />

      <MetricsCard
        label="Failures"
        value={failures}
        icon={AlertTriangle}
        color="text-red-500"
      />

      <MetricsCard
        label="Retries"
        value={retries}
        icon={RotateCcw}
        color="text-amber-500"
      />

      <MetricsCard
        label="Avg Latency"
        value={`${latency}ms`}
        icon={Timer}
        color="text-sky-500"
      />

    </div>
  )
}