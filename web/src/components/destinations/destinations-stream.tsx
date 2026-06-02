"use client"

import { Destination } from "@/types/destinations"
import { DestinationRow } from "./destination-row"

type Props = {
  destinations: Destination[]
  selected: Destination | null
  onSelect: (destination: Destination) => void
}

export function DestinationsStream({
  destinations,
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
        <div>Destination</div>
        <div>Status</div>
        <div>Delivered</div>
        <div>Latency</div>
        <div>Last Seen</div>
      </div>

      {destinations.map((destination) => (
        <DestinationRow
          key={destination.id}
          destination={destination}
          selected={
            selected?.id ===
            destination.id
          }
          onClick={() =>
            onSelect(destination)
          }
        />
      ))}
    </div>
  )
}