"use client"

import { cn } from "@/lib/utils"
import type { Replay } from "@/types/replay-types"

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
  const statusStyles = {
    running: "bg-orange-500/10 text-orange-400",
    queued: "bg-yellow-500/10 text-yellow-400",
    completed: "bg-emerald-500/10 text-emerald-400",
    failed: "bg-rose-500/10 text-rose-400",
    partial: "bg-blue-500/10 text-blue-400",
  }

  const statusClass =
    statusStyles[
      replay.status as keyof typeof statusStyles
    ] ?? "bg-muted text-muted-foreground"

  return (
    <button
      onClick={onClick}
      className={cn(
        `
          grid
          grid-cols-[110px_1fr_160px_110px_120px]
          gap-x-4
          items-center
          w-full
          border-b border-border
          px-5 py-3
          text-left
          transition-colors
          hover:bg-white/[0.02]
        `,
        selected && "bg-white/[0.03]"
      )}
    >
      {/* Provider */}
      <div className="flex items-center min-w-0">
        <span
          className="
            max-w-full
            truncate
            rounded-full
            border border-border
            bg-background/30
            px-2 py-1
            text-xs
            uppercase
            tracking-wide
          "
        >
          {replay.provider || "unknown"}
        </span>
      </div>

      {/* Event Type */}
      <div className="min-w-0 truncate pr-2 text-sm">
        {replay.event_type || "unknown"}
      </div>

      {/* Attempts */}
      <div className="min-w-0">
        <div className="text-sm tabular-nums text-muted-foreground">
          {replay.attempts}{" "}
          {replay.attempts === 1
            ? "attempt"
            : "attempts"}
        </div>

        {replay.status === "running" && (
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-orange-500 transition-all"
              style={{
                width: `${Math.min(
                  Math.max(replay.attempts, 1) * 20,
                  100
                )}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs whitespace-nowrap",
            statusClass
          )}
        >
          {replay.status}
        </span>
      </div>

      {/* Started */}
      <div className="truncate text-sm text-muted-foreground whitespace-nowrap">
        {replay.started_at || replay.created_at}
      </div>
    </button>
  )
}