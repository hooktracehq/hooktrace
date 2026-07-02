"use client"

import { Layers3 } from "lucide-react"

import type { AggregationRule } from "@/types/aggregation"

import { AggregationRow } from "./aggregation-row"

type Props = {
  rules: AggregationRule[]
  selected: AggregationRule | null
  onSelect: (rule: AggregationRule) => void
}

export function AggregationStream({
  rules,
  selected,
  onSelect,
}: Props) {
  if (rules.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">

        <Layers3 className="mb-4 h-10 w-10 text-muted-foreground/30" />

        <h3 className="font-semibold">
          No aggregation rules found
        </h3>

        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Create an aggregation rule to batch similar webhook events,
          reduce duplicate deliveries, and optimize downstream traffic.
        </p>

      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">

      {/* Header */}

      <div
        className="
          sticky
          top-0
          z-20
          grid
          grid-cols-[100px_1.8fr_140px_130px_140px]
          items-center
          border-b
          border-border
          bg-background/95
          px-5
          py-4
          text-xs
          font-semibold
          uppercase
          tracking-wider
          text-muted-foreground
          backdrop-blur
        "
      >
        <div>Status</div>

        <div>
          Rule & Patterns
          <span className="ml-2 text-[10px] font-normal normal-case">
            ({rules.length})
          </span>
        </div>

        <div>Provider</div>

        <div>Strategy</div>

        <div>Events Saved</div>
      </div>

      {/* Rows */}

      <div className="divide-y divide-border/40">
        {rules.map((rule) => (
          <AggregationRow
            key={rule.id}
            rule={rule}
            selected={selected?.id === rule.id}
            onClick={() => onSelect(rule)}
          />
        ))}
      </div>

    </div>
  )
}