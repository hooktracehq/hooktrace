"use client"

import {
  RotateCcw,
  Search,
  PlayCircle,
} from "lucide-react"

type Props = {
  query: string
  setQuery: (value: string) => void
}

export function ReplayToolbar({
  query,
  setQuery,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">

      <div className="flex items-center gap-3">

        <div className="h-2 w-2 rounded-full bg-orange-500" />

        <h1 className="text-lg font-semibold">
          Replay Queue
        </h1>

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
            placeholder="Search replays..."
            className="
              bg-transparent text-sm
              outline-none
            "
          />
        </div>

        <button
          className="
            flex items-center gap-2
            rounded-xl border border-orange-500/20
            bg-orange-500/10
            px-4 py-2
            text-sm text-orange-400
          "
        >
          <PlayCircle className="h-4 w-4" />
          Replay All Failed
        </button>

      </div>

    </div>
  )
}