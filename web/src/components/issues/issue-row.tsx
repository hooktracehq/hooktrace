"use client"

import { cn } from "@/lib/utils"

type Props = {
  issue: {
    provider: string
    route: string
    error: string
    retries: number
    severity: string
    timestamp: string
  }
  selected?: boolean
  onClick?: () => void
}

export function IssueRow({
  issue,
  selected,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        `
          grid
          grid-cols-[120px_1fr_1fr_120px_120px_140px]
          items-center
          border-b border-border
          px-5 py-3 text-left
          transition-colors
          hover:bg-white/[0.02]
        `,
        selected &&
          "bg-white/[0.03]"
      )}
    >

      <div>

        <span
          className="
            rounded-full border border-border
            bg-background/30
            px-2 py-1 text-xs uppercase
          "
        >
          {issue.provider}
        </span>

      </div>

      <div className="truncate font-medium">
        {issue.route}
      </div>

      <div className="truncate text-rose-400">
        {issue.error}
      </div>

      <div>
        {issue.retries}
      </div>

      <div>

        <span
          className="
            rounded-full
            bg-rose-500/10
            px-2 py-1 text-xs
            text-rose-400
          "
        >
          {issue.severity}
        </span>

      </div>

      <div className="text-muted-foreground">
        {issue.timestamp}
      </div>

    </button>
  )
}