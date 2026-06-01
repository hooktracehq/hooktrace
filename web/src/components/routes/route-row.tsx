"use client"

import { cn } from "@/lib/utils"
import { Route } from "@/types/route"

type Props = {
  route: Route
  selected?: boolean
  onClick?: () => void
}

export function RouteRow({
  route,
  selected,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        `
          grid
          grid-cols-[120px_1fr_120px_120px_120px_120px_140px]
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
      <div>{route.provider}</div>

      <div>{route.path}</div>

      <div>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs",

            route.status ===
              "active" &&
              "bg-emerald-500/10 text-emerald-400",

            route.status ===
              "paused" &&
              "bg-amber-500/10 text-amber-400",

            route.status ===
              "error" &&
              "bg-rose-500/10 text-rose-400"
          )}
        >
          {route.status}
        </span>
      </div>

      <div>{route.throughput}/m</div>

      <div>{route.failures}</div>

      <div>{route.destinations}</div>

      <div>{route.lastSeen}</div>
    </button>
  )
}