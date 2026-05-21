"use client"

import { MetricsOverview } from "@/components/metrics/metrics-overview"

import { MetricsChart } from "@/components/metrics/metrics-chart"

import { ProviderDistribution } from "@/components/metrics/provider-distribution"

import { LatencyChart } from "@/components/metrics/latency-chart"

type Props = {
  total: number
  failures: number
  retries: number
  latency: number

  throughputData: {
    time: string
    events: number
  }[]

  providerData: {
    name: string
    value: number
  }[]

  latencyData: {
    time: string
    latency: number
  }[]
}

export default function MetricsClient({
  total,
  failures,
  retries,
  latency,
  throughputData,
  providerData,
  latencyData,
}: Props) {
  return (
    <div className="space-y-6">

      <MetricsOverview
        total={total}
        failures={failures}
        retries={retries}
        latency={latency}
      />

      <MetricsChart
        data={throughputData}
      />

      <div className="grid gap-6 xl:grid-cols-2">

        <ProviderDistribution
          data={providerData}
        />

        <LatencyChart
          data={latencyData}
        />

      </div>

    </div>
  )
}