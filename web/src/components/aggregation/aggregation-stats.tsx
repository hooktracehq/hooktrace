"use client"

import { useMemo } from "react"

import {
  Layers3,
  Package,
  ShieldCheck,
  TrendingDown,
} from "lucide-react"

import type { AggregationRule } from "@/types/aggregation"

type Props = {
  rules: AggregationRule[]
}

export function AggregationStats({
  rules,
}: Props) {
  const stats = useMemo(() => {
    const activeRules = rules.filter(
      (r) => r.enabled
    ).length

    const processed = rules.reduce(
      (sum, r) => sum + r.stats.eventsProcessed,
      0
    )

    const batches = rules.reduce(
      (sum, r) =>
        sum + r.stats.batchesCreated,
      0
    )

    const saved = rules.reduce(
      (sum, r) =>
        sum + r.stats.duplicatesSkipped,
      0
    )

    const reduction =
      processed > 0
        ? Math.round(
            (saved / processed) * 100
          )
        : 0

    return {
      activeRules,
      processed,
      batches,
      saved,
      reduction,
    }
  }, [rules])

  return (
    <div className="grid grid-cols-4 gap-4 border-b border-border bg-muted/20 p-5">

      <Stat
        icon={
          <Layers3 className="h-5 w-5 text-orange-500" />
        }
        label="Active Rules"
        value={stats.activeRules}
        helper={`${rules.length} configured`}
      />

      <Stat
        icon={
          <Package className="h-5 w-5 text-sky-500" />
        }
        label="Events Processed"
        value={stats.processed.toLocaleString()}
        helper="Webhook events evaluated"
      />

      <Stat
        icon={
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
        }
        label="Batches Produced"
        value={stats.batches.toLocaleString()}
        helper="Grouped webhook deliveries"
      />

      <Stat
        icon={
          <TrendingDown className="h-5 w-5 text-violet-500" />
        }
        label="Traffic Reduction"
        value={`${stats.reduction}%`}
        helper={`${stats.saved.toLocaleString()} duplicate events skipped`}
      />

    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  helper: string
}) {
  return (
    <div
      className="
        rounded-xl
        border
        bg-card
        p-5
        transition-all
        hover:border-primary/30
        hover:shadow-sm
      "
    >
      <div className="flex items-center justify-between">

        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>

        {icon}

      </div>

      <h3 className="mt-4 text-3xl font-bold tracking-tight">
        {value}
      </h3>

      <p className="mt-2 text-xs text-muted-foreground">
        {helper}
      </p>

    </div>
  )
}