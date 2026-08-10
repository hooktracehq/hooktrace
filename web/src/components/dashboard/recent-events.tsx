"use client"

import Link from "next/link"

import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  RotateCcw,
  XCircle,
} from "lucide-react"

import type {
  DashboardEvent,
} from "@/hooks/dashboard/use-dashboard-overview"

type Props = {
  events?: DashboardEvent[] | null
}

function StatusIcon({
  status,
}: {
  status: string
}) {
  if (status === "delivered") {
    return (
      <div
        className="
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-emerald-500/10
        "
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div
        className="
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-rose-500/10
        "
      >
        <XCircle className="h-3.5 w-3.5 text-rose-400" />
      </div>
    )
  }

  if (
    status === "retrying" ||
    status === "processing"
  ) {
    return (
      <div
        className="
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-orange-500/10
        "
      >
        <RotateCcw className="h-3.5 w-3.5 text-orange-400" />
      </div>
    )
  }

  return (
    <div
      className="
        flex
        h-7
        w-7
        shrink-0
        items-center
        justify-center
        rounded-lg
        bg-white/[0.04]
      "
    >
      <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  )
}

export function RecentEvents({
  events = [],
}: Props) {
  const safeEvents =
    Array.isArray(events)
      ? events
      : []

  return (
    <div>
      {/* Header */}

      <div
        className="
          mb-5
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-orange-500/10
            "
          >
            <Activity className="h-4 w-4 text-orange-400" />
          </div>

          <div>
            <h2 className="text-sm font-semibold">
              Recent Events
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Latest webhook activity
            </p>
          </div>
        </div>

        <Link
          href="/events"
          className="
            flex
            shrink-0
            items-center
            gap-1
            text-xs
            text-muted-foreground
            transition-colors
            hover:text-foreground
          "
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Empty */}

      {safeEvents.length === 0 ? (
        <div
          className="
            flex
            min-h-[260px]
            items-center
            justify-center
            rounded-xl
            border
            border-dashed
            border-border
            bg-background/10
          "
        >
          <div className="text-center">
            <div
              className="
                mx-auto
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-white/[0.03]
              "
            >
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>

            <p className="mt-3 text-sm font-medium">
              No recent events
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Webhook activity will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {safeEvents
            .slice(0, 8)
            .map((event) => (
              <Link
                key={event.id}
                href={`/events?id=${event.id}`}
                className="
                  group
                  grid
                  grid-cols-[auto_minmax(0,1fr)_auto]
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-transparent
                  px-3
                  py-2.5
                  transition-colors
                  hover:border-border
                  hover:bg-white/[0.02]
                "
              >
                <StatusIcon
                  status={event.status}
                />

                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-sm
                      font-medium
                    "
                  >
                    {event.event_type ||
                      "Webhook event"}
                  </p>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-[11px]
                      text-muted-foreground
                    "
                  >
                    {event.provider ||
                      "unknown"}
                    {" · "}
                    {event.route ||
                      "unknown route"}
                  </p>
                </div>

                <div
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-3
                  "
                >
                  {event.latency_ms != null && (
                    <span
                      className="
                        hidden
                        items-center
                        gap-1
                        text-[11px]
                        text-muted-foreground
                        sm:flex
                      "
                    >
                      <Clock3 className="h-3 w-3" />
                      {event.latency_ms}ms
                    </span>
                  )}

                  <span className="text-[11px] text-muted-foreground">
                    {formatTime(event.created_at)}
                  </span>

                  <ArrowRight
                    className="
                      hidden
                      h-3.5
                      w-3.5
                      text-muted-foreground
                      transition-transform
                      group-hover:translate-x-0.5
                      sm:block
                    "
                  />
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  )
}

function formatTime(
  value: string | null | undefined
) {
  if (!value) {
    return "—"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}