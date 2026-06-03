"use client"

import type { AggregationRule } from "@/types/aggregation"

type Props = {
  rules: AggregationRule[]
}

export function AggregationStats({
  rules,
}: Props) {
  return (
    <div className="grid grid-cols-4 border-b border-border">

      <Stat
        label="Active Rules"
        value={rules.length}
      />

      <Stat
        label="Buffered Events"
        value="18.2k"
      />

      <Stat
        label="Batches Created"
        value="4.1k"
      />

      <Stat
        label="Reduction"
        value="72%"
      />

    </div>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="border-r border-border p-5 last:border-r-0">

      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <h3 className="mt-2 text-4xl font-bold">
        {value}
      </h3>

    </div>
  )
}