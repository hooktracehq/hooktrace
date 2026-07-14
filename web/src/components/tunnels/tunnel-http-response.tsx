"use client"

import {
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react"

import clsx from "clsx"

import { TunnelJsonViewer } from "./tunnel-json-viewer"

type Props = {
  status: number
  duration: number
  body: unknown
}

function statusColor(status: number) {
  if (status >= 200 && status < 300)
    return "text-emerald-400"

  if (status >= 300 && status < 400)
    return "text-blue-400"

  if (status >= 400 && status < 500)
    return "text-yellow-400"

  return "text-red-400"
}

export function TunnelHttpResponse({
  status,
  duration,
  body,
}: Props) {
  const success =
    status >= 200 &&
    status < 300

  return (
    <div className="space-y-5">

      <div
        className="
          grid
          gap-4
          md:grid-cols-2
        "
      >
        <div
          className="
            rounded-xl
            border
            border-border
            bg-card
            p-5
          "
        >
          <div className="flex items-center gap-3">

            {success ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400" />
            )}

            <div>

              <div className="text-sm text-muted-foreground">
                HTTP Status
              </div>

              <div
                className={clsx(
                  "mt-1 text-2xl font-semibold",
                  statusColor(status),
                )}
              >
                {status}
              </div>

            </div>

          </div>

        </div>

        <div
          className="
            rounded-xl
            border
            border-border
            bg-card
            p-5
          "
        >
          <div className="flex items-center gap-3">

            <Clock3 className="h-5 w-5 text-orange-400" />

            <div>

              <div className="text-sm text-muted-foreground">
                Response Time
              </div>

              <div className="mt-1 text-2xl font-semibold">
                {duration} ms
              </div>

            </div>

          </div>

        </div>

      </div>

      <TunnelJsonViewer
        title="Response Body"
        data={body}
      />

    </div>
  )
}