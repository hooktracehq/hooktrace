"use client"

import { Layers3, Search } from "lucide-react"

type Props = {
  query: string
  setQuery: React.Dispatch<React.SetStateAction<string>>
}

export function AggregationToolbar({
  query,
  setQuery,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">

      <div className="flex items-center gap-3">

        <Layers3 className="h-5 w-5 text-orange-400" />

        <div>
          <h2 className="text-xl font-semibold">
            Aggregation Rules
          </h2>

          <p className="text-sm text-muted-foreground">
            event batching & coalescing
          </p>
        </div>

      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">

        <Search className="h-4 w-4 text-muted-foreground" />

        <input
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          placeholder="Search rules..."
          className="bg-transparent outline-none"
        />

      </div>

    </div>
  )
}