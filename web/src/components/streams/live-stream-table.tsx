"use client"

import { StreamRow } from "./stream-row"
import type { Event } from "@/types/event"

type Props = {
  rows: Event[]
  selected: Event | null
  onSelect: (row: Event) => void
}

export function LiveStreamTable({
  rows,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="h-full overflow-auto">

      <div
        className="
          sticky top-0 z-10
          grid
          grid-cols-[120px_1fr_180px_120px_120px_140px]
          border-b border-border
          bg-background/95
          px-5 py-3
          text-xs uppercase tracking-wide
          text-muted-foreground
          backdrop-blur
        "
      >

        <div>Provider</div>
        <div>Route</div>
        <div>Event</div>
        <div>Status</div>
        <div>Latency</div>
        <div>Time</div>

      </div>

      {rows.map((row, i) => (
        <StreamRow
          key={i}
          provider={row.provider}
          route={row.route}
          status={row.status}
          latency={row.latency_ms ?? 0}
          timestamp={new Date(row.created_at ?? new Date())}
          eventType={row.event_type}
          selected={
            selected === row
          }
          onClick={() =>
            onSelect(row)
          }
        />
      ))}

    </div>
  )
}