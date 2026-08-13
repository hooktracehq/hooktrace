
"use client"

import { formatDistanceToNow } from "date-fns"

import {
  Clock3,
  RotateCcw,
  Zap,
  ChevronRight,
} from "lucide-react"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

import type { Event } from "@/types/event"

type Props = {
  event: Event
  selected?: boolean
  onClick?: () => void
}

function StatusDot({
  status,
}: {
  status: string
}) {
  if (
    status === "delivered" ||
    status === "success"
  ) {
    return (
      <div className="relative flex items-center justify-center">
        <div className="absolute h-3 w-3 animate-ping rounded-full bg-emerald-500/30" />

        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
    )
  }

  return (
    <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500" />
  )
}

function StatusBadge({
  status,
}: {
  status: string
}) {
  const styles = {
    delivered:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",

    success:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",

    failed:
      "border-rose-500/20 bg-rose-500/10 text-rose-500",

    pending:
      "border-amber-500/20 bg-amber-500/10 text-amber-500",

    retrying:
      "border-amber-500/20 bg-amber-500/10 text-amber-500",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-medium uppercase tracking-wide",
        styles[
          status as keyof typeof styles
        ] ||
          styles.pending
      )}
    >
      {status}
    </div>
  )
}

export function EventRow({
  event,
  selected,
  onClick,
}: Props) {
  return (
    <motion.button
      layout
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.18,
      }}
      onClick={onClick}
      className={cn(
        `
        group relative grid
        h-[76px] w-full
        grid-cols-[140px_1fr_120px_110px_150px_40px]
        items-center
        border-b border-border
        px-4 text-left
        transition-all duration-200
        `,
        selected
          ? "bg-surface-2"
          : "hover:bg-surface-2/60"
      )}
    >
      {/* Selected Glow */}
      {selected && (
        <>
          <div className="absolute left-0 top-0 h-full w-[2px] bg-primary" />

          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        </>
      )}

      {/* STATUS */}
      <div className="flex items-center gap-3">

        <StatusDot
          status={event.status}
        />

        <StatusBadge
          status={event.status}
        />

      </div>

      {/* ROUTE */}
      <div className="min-w-0">

        <div className="flex items-center gap-2">

          <Zap className="h-3.5 w-3.5 text-primary" />

          <p className="truncate text-sm font-medium text-foreground">
            {event.route}
          </p>

        </div>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {event.event_type ||
            "unknown.event"}
        </p>

      </div>

      {/* PROVIDER */}
      <div>

        <div className="inline-flex items-center rounded-md border border-border bg-surface-1 px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">

          {event.provider ||
            "generic"}

        </div>

      </div>

      {/* ATTEMPTS */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">

        <RotateCcw className="h-3.5 w-3.5" />

        <span>
          {event.attempt_count ?? 0}
        </span>

      </div>

      {/* TIME */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">

        <Clock3 className="h-3.5 w-3.5" />

        {event.created_at
          ? formatDistanceToNow(
              new Date(
                event.created_at
              ),
              {
                addSuffix: true,
              }
            )
          : "-"}

      </div>

      {/* ACTION */}
      <div className="flex justify-end">

        <ChevronRight
          className={cn(
            "h-4 w-4 text-muted-foreground transition-all duration-200",
            "opacity-0 translate-x-1",
            "group-hover:translate-x-0 group-hover:opacity-100",
            selected &&
              "opacity-100 translate-x-0 text-primary"
          )}
        />

      </div>

    </motion.button>
  )
}