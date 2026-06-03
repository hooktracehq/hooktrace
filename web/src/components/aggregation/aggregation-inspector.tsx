"use client"

import { Layers3 } from "lucide-react"

import type { AggregationRule } from "@/types/aggregation"

type Props = {
  rule: AggregationRule | null
}

export function AggregationInspector({
  rule,
}: Props) {
  if (!rule) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a rule
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">

      <div className="border-b border-border p-5">

        <div className="flex items-center gap-3">

          <Layers3 className="h-5 w-5 text-orange-400" />

          <div>
            <h2 className="font-semibold">
              Rule Inspector
            </h2>

            <p className="text-sm text-muted-foreground">
              aggregation details
            </p>
          </div>

        </div>

      </div>

      <div className="space-y-4 p-5 text-sm">

        <Info
          label="Rule"
          value={rule.name}
        />

        <Info
          label="Window"
          value={rule.window}
        />

        <Info
          label="Buffered"
          value={rule.buffered}
        />

        <Info
          label="Batches"
          value={rule.batches}
        />

        <Info
          label="Efficiency"
          value={`${rule.efficiency}%`}
        />

      </div>

      <div className="border-t border-border p-5">

        <h3 className="mb-3 font-medium">
          Description
        </h3>

        <p className="text-sm text-muted-foreground">
          {rule.description}
        </p>

      </div>

    </div>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}