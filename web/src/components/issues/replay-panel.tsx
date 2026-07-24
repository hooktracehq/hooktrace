"use client"

import {
  RotateCcw,
  ShieldAlert,
} from "lucide-react"

import { useReplayEvent } from "@/hooks/issues/useReplayEvent"

type ReplayPanelProps = {
  eventId: number
}

export function ReplayPanel({
  eventId,
}: ReplayPanelProps) {
  const replay = useReplayEvent()

  return (
    <div className="border-t border-border p-5">

      <div
        className="
          rounded-2xl
          border border-orange-500/20
          bg-orange-500/5
          p-4
        "
      >

        <div className="flex items-start gap-3">

          <div
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              border border-orange-500/20
              bg-orange-500/10
            "
          >
            <ShieldAlert className="h-5 w-5 text-orange-400" />
          </div>

          <div className="flex-1">

            <h3 className="text-sm font-semibold">
              Recovery Actions
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Replay this delivery back into the pipeline or perform
              additional recovery operations.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">

              <button
                disabled={replay.isPending}
                onClick={() => replay.mutate(eventId)}
                className="
                  flex items-center gap-2
                  rounded-xl
                  border border-orange-500/20
                  bg-orange-500/10
                  px-4 py-2
                  text-sm
                  text-orange-400
                  transition-colors
                  hover:bg-orange-500/15
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <RotateCcw className="h-4 w-4" />

                {replay.isPending
                  ? "Replaying..."
                  : "Replay Delivery"}
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}