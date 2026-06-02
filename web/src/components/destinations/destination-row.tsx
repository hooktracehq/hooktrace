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
          grid-cols-[1.5fr_140px_140px_140px_140px]
          items-center
          border-b border-border
          px-5 py-4
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

            destination.status ===
              "healthy" &&
              "bg-emerald-500/10 text-emerald-400",

            destination.status ===
              "failed" &&
              "bg-rose-500/10 text-rose-400"
          )}
        >
          {destination.status}
        </span>
      </div>

      <div>
        {destination.delivered}
      </div>

      <div>
        {destination.latency}
      </div>

      <div>
        {destination.lastSeen}
      </div>

    </button>
  )
}