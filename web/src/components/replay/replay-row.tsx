"use client"

import { cn } from "@/lib/utils"

type Replay = {
  id: string
  provider: string
  eventType: string
  status: string
  attempts: number
  started: string
}

type Props = {
  replay: Replay
  selected?: boolean
  onClick?: () => void
}

export function ReplayRow({
  replay,
  selected,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        `
          grid
          grid-cols-[110px_1fr_160px_110px_120px]
          gap-x-4
          items-center
          border-b border-border
          px-5 py-3
          text-left
          w-full
          hover:bg-white/[0.02]
        `,
        selected && "bg-white/[0.03]"
      )}
    >

      {/* Provider */}
      <div className="flex items-center">
        <span
          className="
            rounded-full border border-border
            bg-background/30
            px-2 py-1 text-xs uppercase
            tracking-wide
            whitespace-nowrap
          "
        >
          {replay.provider}
        </span>
      </div>

      {/* Event Type */}
      <div className="truncate pr-2 text-sm">
        {replay.eventType}
      </div>

      {/* Attempts + Progress Bar */}
      <div className="space-y-1.5 min-w-0">
        <div className="text-sm tabular-nums text-muted-foreground">
          {replay.attempts} {replay.attempts === 1 ? "retry" : "retries"}
        </div>

        {replay.status === "running" && (
          <div className="h-1 w-full rounded-full bg-border">
            <div
              className="h-1 rounded-full bg-orange-500 transition-all"
              style={{
                width: `${Math.min(replay.attempts * 20, 100)}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs whitespace-nowrap",

            replay.status === "running" &&
              "bg-orange-500/10 text-orange-400",

            replay.status === "completed" &&
              "bg-emerald-500/10 text-emerald-400",

            replay.status === "failed" &&
              "bg-rose-500/10 text-rose-400"
          )}
        >
          {replay.status}
        </span>
      </div>

      {/* Started */}
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {replay.started}
      </div>

    </button>
  )
}