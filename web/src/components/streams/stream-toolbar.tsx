"use client"

import {
  Pause,
  Play,
  Search,
  Wifi,
} from "lucide-react"

type Props = {
  paused: boolean
  setPaused: (v: boolean) => void
  query: string
  setQuery: (v: string) => void
}

export function StreamToolbar({
  paused,
  setPaused,
  query,
  setQuery,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">

      <div className="flex items-center gap-3">

        <div className="flex items-center gap-2">

          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

          <h1 className="text-lg font-semibold">
            Live Streams
          </h1>

        </div>

        <span className="text-xs text-muted-foreground">
          realtime ingress traffic
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
            placeholder="Filter stream..."
            className="
              bg-transparent text-sm
              outline-none placeholder:text-muted-foreground
            "
          />

        </div>

        <button
          onClick={() =>
            setPaused(!paused)
          }
          className="
            flex items-center gap-2
            rounded-xl border border-border
            bg-background/20
            px-4 py-2 text-sm
            transition-colors hover:bg-white/[0.03]
          "
        >

          {paused ? (
            <>
              <Play className="h-4 w-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          )}

        </button>

        <div
          className="
            flex items-center gap-2
            rounded-xl border border-emerald-500/20
            bg-emerald-500/10
            px-3 py-2
            text-sm text-emerald-400
          "
        >

          <Wifi className="h-4 w-4" />

          Connected

        </div>

      </div>

    </div>
  )
}