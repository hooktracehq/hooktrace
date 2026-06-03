"use client"

import type { AggregationRule } from "@/types/aggregation"

import { AggregationRow } from "./aggregation-row"

type Props = {
  rules: AggregationRule[]
  selected: AggregationRule | null
  onSelect: (
    rule: AggregationRule
  ) => void
}

export function AggregationStream({
  rules,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="h-full overflow-auto">

      <div
        className="
          grid
          grid-cols-[1.5fr_140px_140px_140px_140px]
          border-b border-border
          px-5 py-4
          text-xs uppercase
          text-muted-foreground
        "
      >
        <div>Rule</div>
        <div>Window</div>
        <div>Buffered</div>
        <div>Batches</div>
        <div>Efficiency</div>
      </div>

      {rules.map((rule) => (
        <AggregationRow
          key={rule.id}
          rule={rule}
          selected={
            selected?.id ===
            rule.id
          }
          onClick={() =>
            onSelect(rule)
          }
        />
      ))}
    </div>
  )
}