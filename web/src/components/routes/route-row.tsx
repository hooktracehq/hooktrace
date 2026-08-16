"use client"

import {
  Copy,
  ExternalLink,
  Link2,
} from "lucide-react"

import { cn } from "@/lib/utils"

import type { Route } from "@/types/route"

type Props = {
  route: Route
  selected?: boolean
  onClick?: () => void
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001"

export function RouteRow({
  route,
  selected,
  onClick,
}: Props) {
  const endpoint =
    `${API_URL}/r/${route.token}/${route.path}`

  async function copyEndpoint(
    event: React.MouseEvent
  ) {
    event.stopPropagation()

    try {
      await navigator.clipboard.writeText(
        endpoint
      )
    } catch {
      // Clipboard failures should not break
      // route interaction.
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        `
          grid
          grid-cols-[120px_minmax(180px,1fr)_100px_100px_100px_100px_140px]
          items-center
          border-b border-border
          px-5 py-4
          text-left
          transition-colors
          hover:bg-white/[0.03]
        `,
        selected &&
          "bg-white/[0.04]"
      )}
    >
      <div className="truncate text-sm">
        {route.provider}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {route.path}
        </p>

        <div className="mt-1 flex items-center gap-1.5">
          <Link2 className="h-3 w-3 text-muted-foreground" />

          <span className="truncate font-mono text-[10px] text-muted-foreground">
            {endpoint}
          </span>
        </div>
      </div>

      <div>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs",
            route.status === "active" &&
              "bg-emerald-500/10 text-emerald-400",
            route.status === "paused" &&
              "bg-amber-500/10 text-amber-400",
            route.status === "error" &&
              "bg-rose-500/10 text-rose-400"
          )}
        >
          {route.status}
        </span>
      </div>

      <div className="text-sm">
        {route.throughput}/m
      </div>

      <div className="text-sm">
        {route.failures}
      </div>

      <div className="text-sm">
        {route.destinations}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs text-muted-foreground">
          {route.lastSeen ?? "Never"}
        </span>

        <span className="flex items-center gap-1">
          <span
            role="button"
            tabIndex={0}
            onClick={copyEndpoint}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault()
                void copyEndpoint(
                  event as unknown as React.MouseEvent
                )
              }
            }}
            className="
              rounded-md p-1.5
              text-muted-foreground
              hover:bg-accent
              hover:text-foreground
            "
            title="Copy endpoint"
          >
            <Copy className="h-3.5 w-3.5" />
          </span>

          <a
            href={`/events?route=${encodeURIComponent(
              route.path
            )}`}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="
              rounded-md p-1.5
              text-muted-foreground
              hover:bg-accent
              hover:text-foreground
            "
            title="View events"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </span>
      </div>
    </button>
  )
}