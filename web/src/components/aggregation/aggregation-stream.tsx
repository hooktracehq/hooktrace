"use client"

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
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No aggregation rules found.
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">

      {/* Table Header */}
      <div
        className="
          sticky
          top-0
          z-10
          grid
          grid-cols-[90px_1.7fr_130px_120px_120px]
          border-b
          border-border
          bg-background/95
          px-5
          py-4
          text-xs
          font-medium
          uppercase
          tracking-wide
          text-muted-foreground
          backdrop-blur
        "
      >
        <div>Status</div>
        <div>Rule</div>
        <div>Provider</div>
        <div>Mode</div>
        <div>Traffic Saved</div>
      </div>

      {/* Rules */}
      {rules.map((rule) => (
        <AggregationRow
          key={rule.id}
          rule={rule}
          selected={selected?.id === rule.id}
          onClick={() => onSelect(rule)}
        />
      ))}

    </div>
  )
}