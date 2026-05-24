"use client"

import {
  AlertTriangle,
  RotateCcw,
  Search,
} from "lucide-react"

type Props = {
  query: string
  setQuery: (v: string) => void
}

export function IssuesToolbar({
  query,
  setQuery,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">

      <div className="flex items-center gap-3">

        <div className="flex items-center gap-2">

          <div className="h-2 w-2 rounded-full bg-rose-500" />

          <h1 className="text-lg font-semibold">
            Issues / DLQ
          </h1>

        </div>

        <span className="text-sm text-muted-foreground">
          failed deliveries & retries
        </span>

      </div>

      <div className="flex items-center gap-3">

        <div
          className="
            flex items-center gap-2
            rounded-xl border border-border
            bg-background/30
            px-3 py-2
          "
        >

          <Search className="h-4 w-4 text-muted-foreground" />

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search failures..."
            className="
              bg-transparent text-sm
              outline-none placeholder:text-muted-foreground
            "
          />

        </div>

        <button
          className="
            flex items-center gap-2
            rounded-xl border border-orange-500/20
            bg-orange-500/10
            px-4 py-2 text-sm
            text-orange-400
          "
        >

          <RotateCcw className="h-4 w-4" />

          Replay Failed

        </button>

      </div>

    </div>
  )
}