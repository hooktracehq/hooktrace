"use client"

import { AlertTriangle, X } from "lucide-react"

export function IncidentBanner() {
  return (
    <div
      className="
        flex items-center justify-between
        rounded-2xl border border-amber-500/20
        bg-amber-500/10
        px-5 py-4
      "
    >

      <div className="flex items-center gap-3">

        <div
          className="
            flex h-10 w-10 items-center justify-center
            rounded-xl border border-amber-500/20
            bg-amber-500/10
          "
        >
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>

        <div>

          <p className="text-sm font-semibold text-amber-300">
            Stripe delivery latency elevated
          </p>

          <p className="mt-1 text-xs text-amber-200/70">
            delivery retries increasing in eu-west workers
          </p>

        </div>

      </div>

      <button
        className="
          rounded-lg border border-white/10
          p-2 text-muted-foreground
          transition-colors hover:bg-white/5
        "
      >
        <X className="h-4 w-4" />
      </button>

    </div>
  )
}