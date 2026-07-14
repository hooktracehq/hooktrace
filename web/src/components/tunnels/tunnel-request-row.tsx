"use client"

import {
  ChevronRight,
  Clock3,
} from "lucide-react"

import clsx from "clsx"

import type { TunnelLog } from "@/types/tunnel"

type Props = {
  request: TunnelLog
  expanded: boolean
  onClick: () => void
}

const METHOD_COLORS = {
  GET: "bg-emerald-500/10 text-emerald-400",
  POST: "bg-blue-500/10 text-blue-400",
  PUT: "bg-amber-500/10 text-amber-400",
  PATCH: "bg-purple-500/10 text-purple-400",
  DELETE: "bg-red-500/10 text-red-400",
  OPTIONS: "bg-muted text-muted-foreground",
}

function getStatusColor(status: number) {
  if (status >= 200 && status < 300)
    return "text-emerald-400"

  if (status >= 300 && status < 400)
    return "text-blue-400"

  if (status >= 400 && status < 500)
    return "text-yellow-400"

  return "text-red-400"
}

export function TunnelRequestRow({
  request,
  expanded,
  onClick,
}: Props) {
  const methodColor =
    METHOD_COLORS[
      request.method.toUpperCase() as keyof typeof METHOD_COLORS
    ] ??
    "bg-muted text-muted-foreground"

  return (
    <button
      onClick={onClick}
      className={clsx(
        `
        w-full
        border-b
        border-border
        px-5
        py-4
        text-left
        transition-all
        hover:bg-muted/40
      `,
        expanded &&
          "bg-muted/50",
      )}
    >
      <div className="flex items-center gap-4">

        <ChevronRight
          className={clsx(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            expanded &&
              "rotate-90",
          )}
        />

        <span
          className={clsx(
            `
            rounded-md
            px-2.5
            py-1
            text-xs
            font-semibold
            `,
            methodColor,
          )}
        >
          {request.method}
        </span>

        <div className="min-w-0 flex-1">

          <p className="truncate font-medium">
            {request.path}
          </p>

        </div>

        <div
          className={clsx(
            "w-16 text-right font-semibold",
            getStatusColor(
              request.statusCode,
            ),
          )}
        >
          {request.statusCode}
        </div>

        <div
          className="
            flex
            w-24
            items-center
            justify-end
            gap-1
            text-muted-foreground
          "
        >
          <Clock3 className="h-3.5 w-3.5" />

          <span className="text-sm">
            {request.duration} ms
          </span>

        </div>

        <div
          className="
            w-44
            text-right
            text-sm
            text-muted-foreground
          "
        >
          {new Date(
            request.timestamp,
          ).toLocaleString()}
        </div>

      </div>
    </button>
  )
}