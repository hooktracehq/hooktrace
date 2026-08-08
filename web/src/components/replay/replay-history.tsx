"use client"

import {
  CheckCircle2,
  XCircle,
  Clock3,
  Loader2,
} from "lucide-react"

export type ReplayHistoryItem = {
  id: number
  attempt: number
  status: string
  started_at: string | null
  finished_at: string | null
  error: string | null
}

type Props = {
  history: ReplayHistoryItem[]
}

function formatTime(value: string | null) {
  if (!value) return "—"

  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function ReplayHistory({
  history,
}: Props) {
  return (
    <div className="rounded-xl border border-border">

      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">
          Replay History
        </h3>
      </div>

      {history.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          No replay attempts yet.
        </div>
      ) : (
        <div className="space-y-3 p-4">

          {history.map((item) => {

            const isSuccess =
              item.status === "completed"

            const isFailed =
              item.status === "failed"

            const isRunning =
              item.status === "running"

            return (
              <div
                key={item.id}
                className="flex items-center justify-between"
              >

                <div className="flex items-center gap-3">

                  {isSuccess && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}

                  {isFailed && (
                    <XCircle className="h-4 w-4 text-rose-400" />
                  )}

                  {isRunning && (
                    <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                  )}

                  {!isSuccess &&
                    !isFailed &&
                    !isRunning && (
                      <Clock3 className="h-4 w-4 text-muted-foreground" />
                    )}

                  <div>
                    <p className="text-sm">
                      Attempt #{item.attempt}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatTime(item.started_at)}
                    </p>

                    {item.error && (
                      <p className="mt-1 max-w-[220px] truncate text-xs text-rose-400">
                        {item.error}
                      </p>
                    )}
                  </div>

                </div>

                <span
                  className={
                    isSuccess
                      ? "text-xs text-emerald-400"
                      : isFailed
                      ? "text-xs text-rose-400"
                      : isRunning
                      ? "text-xs text-orange-400"
                      : "text-xs text-muted-foreground"
                  }
                >
                  {item.status}
                </span>

              </div>
            )
          })}

        </div>
      )}

    </div>
  )
}