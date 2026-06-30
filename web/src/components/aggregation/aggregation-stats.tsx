"use client"

import { useMemo } from "react"
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
      (sum, r) => sum + r.stats.batchesCreated,
      0
    )

    const saved = rules.reduce(
      (sum, r) => sum + r.stats.duplicatesSkipped,
      0
    )

    const reduction =
      processed > 0
        ? Math.round((saved / processed) * 100)
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
    <div className="grid grid-cols-4 gap-4 border-b border-border bg-muted/20 p-4">
      <Stat
        label="Active Rules"
        value={stats.activeRules}
        helper={`${rules.length} total configured`}
      />

      <Stat
        label="Events Processed"
        value={stats.processed.toLocaleString()}
        helper="Events evaluated"
      />

      <Stat
        label="Batches Created"
        value={stats.batches.toLocaleString()}
        helper="Webhook batches sent"
      />

      <Stat
        label="Traffic Reduced"
        value={`${stats.reduction}%`}
        helper={`${stats.saved.toLocaleString()} duplicate events removed`}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  helper,
}: {
  label: string
  value: string | number
  helper: string
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <h3 className="mt-2 text-3xl font-bold">
        {value}
      </h3>

      <p className="mt-2 text-xs text-muted-foreground">
        {helper}
      </p>
    </div>
  )
}