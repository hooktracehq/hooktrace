"use client"

import {
  AlertTriangle,
  RotateCcw,
} from "lucide-react"

const failures = [
  {
    id: "evt_182",
    route: "/stripe/webhook",
    provider: "stripe",
    time: "2m ago",
    retrying: true,
  },

  {
    id: "evt_183",
    route: "/github/events",
    provider: "github",
    time: "4m ago",
    retrying: false,
  },

  {
    id: "evt_184",
    route: "/shopify/orders",
    provider: "shopify",
    time: "8m ago",
    retrying: true,
  },
]

export function RecentFailures() {
  return (
    <div
      className="
        col-span-12 xl:col-span-4
        rounded-2xl border border-border
        bg-surface-1
        p-6
      "
    >

      <div className="mb-6 flex items-center gap-3">

        <div
          className="
            flex h-10 w-10 items-center justify-center
            rounded-xl border border-border
            bg-background/40
          "
        >
          <AlertTriangle className="h-5 w-5 text-rose-400" />
        </div>

        <div>

          <h2 className="text-lg font-semibold">
            Recent Failures
          </h2>

          <p className="text-sm text-muted-foreground">
            delivery failures & retries
          </p>

        </div>

      </div>

      <div className="space-y-4">

        {failures.map((failure) => (
          <div
            key={failure.id}
            className="
              rounded-xl border border-border
              bg-background/30
              p-4
            "
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium">
                  {failure.route}
                </p>

                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">

                  <span>
                    {failure.provider}
                  </span>

                  <span>•</span>

                  <span>
                    {failure.time}
                  </span>

                </div>

              </div>

              {failure.retrying && (
                <div
                  className="
                    inline-flex items-center gap-1
                    rounded-full
                    border border-orange-500/20
                    bg-orange-500/10
                    px-2 py-1
                    text-[10px]
                    font-medium
                    uppercase tracking-wide
                    text-orange-400
                  "
                >
                  <RotateCcw className="h-3 w-3" />
                  retrying
                </div>
              )}

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}