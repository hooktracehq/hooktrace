"use client"

import { Destination } from "@/types/destinations"

type Props = {
  destinations: Destination[]
}

export function DestinationsStats({
  destinations,
}: Props) {
  const active =
    destinations.filter(
      (d) => d.status === "healthy"
    ).length

  const failed =
    destinations.filter(
      (d) => d.status === "failed"
    ).length

  return (
    <div className="grid grid-cols-4 border-b border-border">

      <Stat
        label="Destinations"
        value={destinations.length}
      />

      <Stat
        label="Healthy"
        value={active}
      />

      <Stat
        label="Failed"
        value={failed}
      />

      <Stat
        label="Avg Latency"
        value="82ms"
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