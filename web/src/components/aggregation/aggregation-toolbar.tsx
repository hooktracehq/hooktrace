"use client"

import { Layers3, Search, X } from "lucide-react"

type Props = {
  query: string
  setQuery: React.Dispatch<React.SetStateAction<string>>
}

export function AggregationToolbar({
  query,
  setQuery,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-background px-6 py-5">

      {/* Left */}
      <div className="flex items-center gap-4">

        <div className="rounded-xl bg-orange-500/10 p-2">
          <Layers3 className="h-5 w-5 text-orange-500" />
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            Aggregation Rules
          </h2>

          <p className="text-sm text-muted-foreground">
            Batch, deduplicate and optimize high-volume webhook traffic.
          </p>
        </div>

      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        <div className="relative w-80">

          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search rules, providers..."
            className="
              h-10
              w-full
              rounded-xl
              border
              border-border
              bg-background
              pl-10
              pr-10
              text-sm
              outline-none
              transition
              focus:border-orange-500
              focus:ring-2
              focus:ring-orange-500/20
            "
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}

        </div>

      </div>

    </div>
  )
}