"use client"

import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Gauge,
  Timer,
} from "lucide-react"

import { MetricsCard } from "./metrics-card"

type Props = {
  received: number
  delivered: number
  failed: number
  retried: number
  successRate: number
  latency: number
}

export function MetricsOverview({
  received,
  delivered,
  failed,
  retried,
  successRate,
  latency,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <MetricsCard
        label="Received"
        value={received}
        icon={Activity}
      />

      <MetricsCard
        label="Delivered"
        value={delivered}
        icon={CheckCircle2}
        color="text-emerald-500"
      />

      <MetricsCard
        label="Failed"
        value={failed}
        icon={AlertTriangle}
        color="text-red-500"
      />

      <MetricsCard
        label="Retried"
        value={retried}
        icon={RotateCcw}
        color="text-amber-500"
      />

      <MetricsCard
        label="Success Rate"
        value={`${successRate}%`}
        icon={Gauge}
        color="text-green-500"
      />

      <MetricsCard
        label="Avg Latency"
        value={`${latency.toFixed(3)} s`}
        icon={Timer}
        color="text-sky-500"
      />
    </div>
  )
}