"use client"

import { cn } from "@/lib/utils"
import { Destination } from "@/types/destinations"

type Props = {
  destination: Destination
  selected?: boolean
  onClick?: () => void
}

export function DestinationRow({
  destination,
  selected,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        `
          grid
          grid-cols-[1.5fr_120px_120px_120px_180px]
          items-center
          border-b
          border-border
          px-5
          py-4
          text-left
          hover:bg-white/[0.03]
        `,
        selected &&
          "bg-white/[0.04]"
      )}
    >
      <div className="font-medium">
        {destination.name}
      </div>

      <div>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs",
            destination.enabled
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-yellow-500/10 text-yellow-400"
          )}
        >
          {destination.enabled
            ? "Healthy"
            : "Paused"}
        </span>
      </div>

      <div>
        {destination.successCount}
      </div>

      <div>
        {destination.errorCount}
      </div>

      <div className="text-xs text-muted-foreground">
        {destination.lastUsed
          ? new Date(
              destination.lastUsed
            ).toLocaleString()
          : "Never"}
      </div>
    </button>
  )
}