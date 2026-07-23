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

      {/* Left */}

      <div className="flex items-center gap-3">

        <div className="flex items-center gap-2">

          <AlertTriangle className="h-4 w-4 text-rose-400" />

          <h1 className="text-lg font-semibold">
            Issues & Recovery
          </h1>

        </div>

        <span className="text-sm text-muted-foreground">
          Operational issues, recovery & replay
        </span>

      </div>

      {/* Right */}

      <div className="flex items-center gap-3">

        <div
          className="
            flex
            w-[340px]
            items-center
            gap-2
            rounded-xl
            border
            border-border
            bg-background/30
            px-3
            py-2
          "
        >
          <Search className="h-4 w-4 text-muted-foreground" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issues, routes, providers..."
            className="
              w-full
              bg-transparent
              text-sm
              outline-none
              placeholder:text-muted-foreground
            "
          />
        </div>

        <button
          className="
            flex items-center gap-2
            rounded-xl
            border border-orange-500/20
            bg-orange-500/10
            px-4 py-2
            text-sm
            text-orange-400
            transition-colors
            hover:bg-orange-500/15
          "
        >
          <RotateCcw className="h-4 w-4" />

          Replay Selected
        </button>

      </div>

    </div>
  )
}