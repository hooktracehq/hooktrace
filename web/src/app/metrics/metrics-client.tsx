
"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

/* ---------------- Types ---------------- */

type MetricsData = {
  latency: [number, string][]
  retries: [number, string][]
  rejected: [number, string][]
  incoming: [number, string][]
  delivered: [number, string][]
  failed: [number, string][]
}

/* ---------------- Helpers ---------------- */

const latest = (series?: [number, string][]) => {
  if (!series || series.length === 0) return 0
  return Number(series[series.length - 1][1] || 0)
}

const formatTime = (ts: number) =>
  new Date(ts * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

const transform = (series?: [number, string][]) =>
  (series || []).map(([ts, val]) => ({
    time: formatTime(ts),
    value: Number(val) || 0,
  }))

/* ---------------- Component ---------------- */

export default function MetricsClient(props: MetricsData) {
  const [metrics, setMetrics] = useState(props)
  const [isLive, setIsLive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState("")

  useEffect(() => {
    if (!isLive) return

    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/metrics")
        const data = await res.json()
        setMetrics(data)
        setLastUpdate(new Date().toLocaleTimeString())
      } catch (err) {
        console.error(err)
      }
    }

    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [isLive])

  const deliveryResults = metrics.delivered.map((point, i) => ({
    time: formatTime(point[0]),
    success: Number(point[1] || 0),
    failed: Number(metrics.failed[i]?.[1] || 0),
  }))

  return (
    <div className="min-h-screen bg-background px-6 py-10 space-y-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metrics</h1>
          <p className="text-muted-foreground text-sm">
            System performance & webhook health
          </p>
        </div>

        <button
          onClick={() => setIsLive(!isLive)}
          className="flex items-center gap-2 border px-3 py-2 rounded-lg text-sm"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          />
          {isLive ? "Live" : "Paused"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Incoming" value={latest(metrics.incoming)} />
        <StatCard label="Delivered" value={latest(metrics.delivered)} />
        <StatCard label="Failed" value={latest(metrics.failed)} />
        <StatCard label="Retries" value={latest(metrics.retries)} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">

        <MetricPanel
          title="Latency (p95)"
          data={transform(metrics.latency)}
          unit="s"
        />

        <MetricPanel
          title="Retry Rate"
          data={transform(metrics.retries)}
          unit="ops/s"
        />

        <MetricPanel
          title="Rejected"
          data={transform(metrics.rejected)}
          unit="ops/s"
        />

        <MetricPanel
          title="Incoming"
          data={transform(metrics.incoming)}
          unit="ops/s"
        />

        <DeliveryPanel
          title="Delivery Results"
          data={deliveryResults}
        />

      </div>

      {lastUpdate && (
        <p className="text-xs text-muted-foreground">
          Last updated: {lastUpdate}
        </p>
      )}
    </div>
  )
}

/* ---------------- UI Components ---------------- */

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-4 bg-card">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value.toFixed(0)}</p>
    </div>
  )
}

function MetricPanel({
  title,
  data,
  unit,
}: {
  title: string
  data: { time: string; value: number }[]
  unit?: string
}) {
  if (!data.length) {
    return (
      <div className="border p-4 rounded-xl text-sm text-muted-foreground">
        {title}: No data
      </div>
    )
  }

  const latestValue = data[data.length - 1].value

  return (
    <div className="rounded-xl border p-4 bg-card">
      <h3 className="text-sm mb-2">{title}</h3>

      <p className="text-xl font-bold mb-2">
        {latestValue.toFixed(2)} {unit}
      </p>

      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" hide />
          <YAxis hide />
          <Tooltip formatter={(v) => `${v} ${unit || ""}`} />
          <Line dataKey="value" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function DeliveryPanel({
  title,
  data,
}: {
  title: string
  data: { time: string; success: number; failed: number }[]
}) {
  if (!data.length) {
    return (
      <div className="border p-4 rounded-xl text-sm text-muted-foreground">
        {title}: No data
      </div>
    )
  }

  const latest = data[data.length - 1]
  const total = latest.success + latest.failed
  const successRate = total ? ((latest.success / total) * 100).toFixed(1) : "0"

  return (
    <div className="rounded-xl border p-4 bg-card">
      <h3 className="text-sm mb-2">{title}</h3>

      <p className="text-xl font-bold text-green-600 mb-2">
        {successRate}% success
      </p>

      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis hide />
          <Tooltip />
          <Line dataKey="success" stroke="green" dot={false} />
          <Line dataKey="failed" stroke="red" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}