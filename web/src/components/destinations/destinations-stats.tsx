"use client"

import { useDestinationStats } from "@/hooks/destinations/use-destination-stats"

export function DestinationsStats() {
  const {
    data,
    isLoading,
  } = useDestinationStats()

  return (
    <div className="grid grid-cols-4 border-b border-border">

      <Stat
        label="Targets"
        value={
          isLoading
            ? "..."
            : data?.targets ?? 0
        }
      />

      <Stat
        label="Healthy"
        value={
          isLoading
            ? "..."
            : data?.healthy ?? 0
        }
      />

      <Stat
        label="Failed"
        value={
          isLoading
            ? "..."
            : data?.failed ?? 0
        }
      />

      <Stat
        label="Successful"
        value={
          isLoading
            ? "..."
            : data?.deliveries ?? 0
        }
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