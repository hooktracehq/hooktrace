"use client"

import type { Connection } from "@/types/connection"

import { ConnectionCard } from "./connection-card"

type Props = {
  connections: Connection[]
  selected: Connection | null
  onSelect: (
    connection: Connection
  ) => void
}

export function ConnectionsGrid({
  connections,
  selected,
  onSelect,
}: Props) {
  return (
    <div
      className="
        grid gap-5 p-5
        md:grid-cols-2
        xl:grid-cols-3
      "
    >
      {connections.map(
        (connection) => (
          <ConnectionCard
            key={connection.id}
            connection={connection}
            selected={
              selected?.id ===
              connection.id
            }
            onClick={() =>
              onSelect(connection)
            }
          />
        )
      )}
    </div>
  )
}