"use client"

import { cn } from "@/lib/utils"
import type { Event } from "@/types/event"

type Props = {
  issue: Event
  selected?: boolean
  onClick?: () => void
}

export function IssueRow({
  issue,
  selected,
  onClick,
}: Props) {
  const status = "Failed"

  return (
    <button
      onClick={onClick}
      className={cn(
        `
        grid
        grid-cols-[120px_120px_1fr_1.4fr_100px_180px]
        items-center
        border-b border-border
        px-5 py-3
        text-left
        transition-colors
        hover:bg-white/[0.02]
        `,
        selected && "bg-white/[0.03]"
      )}
    >
      {/* Status */}

      <div>
        <span
          className="
          inline-flex
          items-center
          rounded-full
          border border-rose-500/20
          bg-rose-500/10
          px-2.5 py-1
          text-xs font-medium
          text-rose-400
          "
        >
          {status}
        </span>
      </div>

      {/* Provider */}

      <div>
        <span
          className="
          rounded-full
          border border-border
          bg-background/30
          px-2 py-1
          text-xs uppercase
          "
        >
          {issue.provider}
        </span>
      </div>

      {/* Route */}

      <div className="truncate font-medium">
        {issue.route}
      </div>

      {/* Error */}

      <div
        className="
        truncate
        text-sm
        text-rose-400
        "
      >
        {issue.last_error ?? "Unknown error"}
      </div>

      {/* Attempts */}

      <div className="text-sm">
        {issue.attempt_count ?? 0}
        <span className="text-muted-foreground">
          {" "}
          / 5
        </span>
      </div>

      {/* Updated */}

      <div className="text-sm text-muted-foreground">
        {new Date(issue.created_at).toLocaleString()}
      </div>
    </button>
  )
}