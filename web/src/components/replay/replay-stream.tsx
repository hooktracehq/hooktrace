"use client"

import { ReplayRow } from "./replay-row"

type Replay = {
  id: string
  provider: string
  eventType: string
  status: string
  attempts: number
  started: string
}

type Props = {
  replays: Replay[]
  selected: Replay | null
  onSelect: (
    replay: Replay
  ) => void
}

export function ReplayStream({
  replays,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="h-full overflow-auto">

      <div
        className="
          sticky top-0 z-10
          grid
          grid-cols-[120px_1fr_140px_120px_140px]
          border-b border-border
          bg-background
          px-5 py-3
          text-xs uppercase
          tracking-wide
          text-muted-foreground
        "
      >
        <div>Provider</div>
        <div>Event</div>
        <div>Attempts</div>
        <div>Status</div>
        <div>Started</div>
      </div>

      {replays.map((replay) => (
        <ReplayRow
          key={replay.id}
          replay={replay}
          selected={
            selected?.id === replay.id
          }
          onClick={() =>
            onSelect(replay)
          }
        />
      ))}

    </div>
  )
}