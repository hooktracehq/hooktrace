"use client"

import { motion } from "framer-motion"
import {
  CheckCircle2,
  AlertTriangle,
  Zap,
  Play,
} from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { useState } from "react"
import type { DeliveryTarget, TargetStats } from "@/types/delivery-target"

import TargetLogs from "../target-logs"




export default function DeliveryTargetDetailClient({
    target,
    stats,
    user,
  }: {
    target: DeliveryTarget
    stats: TargetStats
    user: { email: string; avatar_url?: string }
  }){
  const successRate = stats?.successRate || 0
  const isHealthy = successRate >= 95

  const [loading, setLoading] = useState(false)

  async function testTarget() {
    setLoading(true)
  
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${target.id}/test`,
        { method: "POST", credentials: "include" }
      )
    } finally {
      setLoading(false)
      location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{target.name}</h1>
            <p className="text-sm text-muted-foreground">
              {target.type}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserNav user={user} />
          </div>
        </div>

        {/* Status */}
        <div className={`p-4 rounded-xl border flex justify-between ${
          isHealthy ? "bg-emerald-50" : "bg-amber-50"
        }`}>
          <div className="flex items-center gap-3">

            {isHealthy ? (
              <CheckCircle2 className="text-emerald-600" />
            ) : (
              <AlertTriangle className="text-amber-600" />
            )}

<div>
  <p className="font-semibold text-sm">
    {isHealthy ? "Healthy" : "Issues detected"}
  </p>

  <p className="text-xs text-muted-foreground">
    Success rate: {successRate}%
  </p>

  <p className="text-xs text-muted-foreground">
    Last used: {stats?.lastUsed ? new Date(stats.lastUsed).toLocaleString() : "Never"}
  </p>
</div>
          </div>

          <button
  onClick={testTarget}
  disabled={loading}
  className="flex items-center gap-2 px-3 py-1.5 border rounded-md"
>
  <Play className="w-4 h-4" />
  {loading ? "Testing..." : "Test"}
</button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">

          <Card label="Success" value={stats.successCount} />
          <Card label="Errors" value={stats.errorCount} />
          <Card label="Rate" value={`${stats.successRate}%`} />

        </div>

        {/* Config */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-4">Configuration</h2>

          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
            {JSON.stringify(target.config, null, 2)}
          </pre>
        </div>


        {/* Providers */}
<div className="rounded-xl border bg-card p-6">
  <h2 className="font-semibold mb-4">Providers</h2>

  <div className="flex gap-2 flex-wrap">
    {target.providers?.length ? (
      target.providers.map((p: string) => (
        <span
          key={p}
          className="text-xs px-2 py-1 rounded bg-muted"
        >
          {p}
        </span>
      ))
    ) : (
      <span className="text-xs text-muted-foreground">
        No provider restrictions
      </span>
    )}
  </div>
</div>

        {/* Insights */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-4">Observability Insight</h2>

          <p className="text-sm text-muted-foreground">
         {successRate >= 98
          ? "Delivery pipeline is highly stable with minimal failure rate."
          : successRate >= 90
          ? "Minor delivery issues detected. Monitor retry behavior."
          : "Significant failures detected. Check endpoint health, retries, or configuration."}
</p>
        </div>
        <TargetLogs targetId={target.id} />

      </div>
    </div>
  )
}




/* ---------------- UI ---------------- */

function Card({
    label,
    value,
  }: {
    label: string
    value: string | number
  }) {
  return (
    <motion.div
      className="rounded-xl border bg-card p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>

    </motion.div>
  )
  
}