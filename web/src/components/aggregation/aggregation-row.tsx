"use client"

import { cn } from "@/lib/utils"

import type { AggregationRule } from "@/types/aggregation"

type Props = {
  rule: AggregationRule
  selected?: boolean
  onClick?: () => void
}

export function AggregationRow({
  rule,
  selected,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        `
        grid
        grid-cols-[1.5fr_140px_140px_140px_140px]
        items-center
        border-b border-border
        px-5 py-4
        text-left
        hover:bg-white/[0.03]
      `,
        selected &&
          "bg-white/[0.04]"
      )}
    >

      <div className="font-medium">
        {rule.name}
      </div>

      <div>{rule.window}</div>

      <div>{rule.buffered}</div>

      <div>{rule.batches}</div>

      <div>{rule.efficiency}%</div>

    </button>
  )
}