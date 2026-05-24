"use client"

import {
  RotateCcw,
  ShieldAlert,
} from "lucide-react"

export function ReplayPanel() {
  return (
    <div className="border-t border-border p-5">

      <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">

        <div className="flex items-start gap-3">

          <div
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl border border-orange-500/20
              bg-orange-500/10
            "
          >
            <ShieldAlert className="h-5 w-5 text-orange-400" />
          </div>

          <div className="flex-1">

            <h3 className="text-sm font-semibold">
              Replay Failed Event
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              retry this failed delivery back into the pipeline
            </p>

            <button
              className="
                mt-4 flex items-center gap-2
                rounded-xl border border-orange-500/20
                bg-orange-500/10
                px-4 py-2 text-sm
                text-orange-400
              "
            >

              <RotateCcw className="h-4 w-4" />

              Replay Event

            </button>

          </div>

        </div>

      </div>
    </div>
  )
}