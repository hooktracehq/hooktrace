"use client"

import type {
  DestinationLog,
} from "@/types/destinations"

type Props = {
  logs: DestinationLog[]
}

export default function DestinationLogs({
  logs,
}: Props) {
  if (!logs.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No deliveries yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">

      {logs.map(log => (

        <div
          key={log.id}
          className="rounded-xl border p-3"
        >

          <div className="flex justify-between">

            <span
              className={
                log.status === "success"
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {log.status}
            </span>

            <span>
              {log.status_code ?? "-"}
            </span>

          </div>

          <div className="mt-2 text-xs text-muted-foreground">

            Attempt {log.attempt}

          </div>

          <div className="mt-2 text-xs break-all">

            {log.response}

          </div>

        </div>

      ))}

    </div>
  )
}