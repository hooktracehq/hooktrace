"use client"

import type { Connection } from "@/types/connection"

type Props = {
  connections: Connection[]
}

export function ConnectionsStats({
  connections,
}: Props) {
  const healthy =
    connections.filter(
      (c) =>
        c.status ===
        "healthy"
    ).length

  const errors =
    connections.filter(
      (c) =>
        c.status ===
        "error"
    ).length

  return (
    <div className="grid grid-cols-4 border-b border-border">

      <Stat
        label="Providers"
        value={connections.length}
      />

      <Stat
        label="Healthy"
        value={healthy}
      />

      <Stat
        label="Errors"
        value={errors}
      />

      <Stat
        label="Events Today"
        value="128k"
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