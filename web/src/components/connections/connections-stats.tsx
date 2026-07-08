"use client"

import { useConnectionsStats } from "@/hooks/connections/use-connections-stats"

export function ConnectionsStats() {
  const {
    data,
    isLoading,
  } = useConnectionsStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 border-b border-border">
        <Stat label="Providers" value="--" />
        <Stat label="Healthy" value="--" />
        <Stat label="Errors" value="--" />
        <Stat label="Events Today" value="--" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 border-b border-border">

      <Stat
        label="Providers"
        value={data?.providers ?? 0}
      />

      <Stat
        label="Healthy"
        value={data?.healthy ?? 0}
      />

      <Stat
        label="Errors"
        value={data?.errors ?? 0}
      />

      <Stat
        label="Events Today"
        value={data?.events_today ?? 0}
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