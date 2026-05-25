"use client"

import { formatDistanceToNow } from "date-fns"

import {
  AlertTriangle,
  CheckCircle2,
  Radio,
  RotateCcw,
} from "lucide-react"

import { useRealtimeStore } from "@/stores/realtime-store"

function Icon({
  level,
}: {
  level?: string
}) {
  if (level === "error") {
    return (
      <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
    )
  }

  if (
    level === "success"
  ) {
    return (
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
    )
  }

  return (
    <Radio className="h-3.5 w-3.5 text-orange-400" />
  )
}

export function ActivityFeed() {
  const activities =
    useRealtimeStore(
      (s) => s.activities
    )

  return (
    <div
      className="
        rounded-2xl border border-border
        bg-background/40
        backdrop-blur-xl
      "
    >

      <div className="border-b border-border px-4 py-3">

        <div className="flex items-center gap-2">

          <RotateCcw className="h-4 w-4 text-orange-400" />

          <h2 className="text-sm font-semibold">
            Activity Feed
          </h2>

        </div>

      </div>

      <div className="max-h-[380px] overflow-auto">

        {activities.map(
          (activity) => (
            <div
              key={activity.id}
              className="
                flex items-start gap-3
                border-b border-border
                px-4 py-3
              "
            >

              <div className="mt-0.5">
                <Icon
                  level={
                    activity.level
                  }
                />
              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm">
                  {
                    activity.message
                  }
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDistanceToNow(
                    new Date(
                      activity.timestamp
                    ),
                    {
                      addSuffix: true,
                    }
                  )}
                </p>

              </div>

            </div>
          )
        )}

      </div>

    </div>
  )
}