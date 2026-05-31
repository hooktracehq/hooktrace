"use client"

import {
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react"

const history = [
  {
    attempt: 1,
    status: "failed",
    time: "12:01 PM",
  },
  {
    attempt: 2,
    status: "failed",
    time: "12:03 PM",
  },
  {
    attempt: 3,
    status: "success",
    time: "12:05 PM",
  },
]

export function ReplayHistory() {
  return (
    <div className="rounded-xl border border-border">

      <div className="border-b border-border px-4 py-3">

        <h3 className="text-sm font-semibold">
          Replay History
        </h3>

      </div>

      <div className="space-y-3 p-4">

        {history.map((item) => (
          <div
            key={item.attempt}
            className="flex items-center justify-between"
          >

            <div className="flex items-center gap-3">

              {item.status === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-400" />
              )}

              <div>
                <p className="text-sm">
                  Attempt #{item.attempt}
                </p>

                <p className="text-xs text-muted-foreground">
                  {item.time}
                </p>
              </div>

            </div>

            <span
              className={
                item.status === "success"
                  ? "text-emerald-400 text-xs"
                  : "text-rose-400 text-xs"
              }
            >
              {item.status}
            </span>

          </div>
        ))}

      </div>

    </div>
  )
}