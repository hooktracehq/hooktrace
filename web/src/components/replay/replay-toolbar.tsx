"use client"

import {
  Search,
  PlayCircle,
} from "lucide-react"
import { useState } from "react"

type Props = {
  query: string
  setQuery: (value: string) => void
  onReplayCreated?: () => void
}

export function ReplayToolbar({
  query,
  setQuery,
  onReplayCreated,
}: Props) {
  const [replaying, setReplaying] = useState(false)

  async function handleReplayAllFailed() {
    if (replaying) return

    try {
      setReplaying(true)

      const response = await fetch(
        "http://localhost:3001/replays/failed",
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to replay failed events"
        )
      }

      console.log(
        "[Replay] All failed events queued:",
        data
      )

      // Refresh Replay Queue
      onReplayCreated?.()

    } catch (error) {
      console.error(
        "Failed to replay all failed events:",
        error
      )

      alert(
        error instanceof Error
          ? error.message
          : "Failed to replay failed events"
      )
    } finally {
      setReplaying(false)
    }
  }

  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">

      {/* Left */}
      <div className="flex items-center gap-3">

        <div className="h-2 w-2 rounded-full bg-orange-500" />

        <h1 className="text-lg font-semibold">
          Replay Queue
        </h1>

      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        {/* Search */}
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
              w-48
              bg-transparent
              text-sm
              outline-none
            "
          />
        </div>

        {/* Replay All Failed */}
        <button
          type="button"
          onClick={handleReplayAllFailed}
          disabled={replaying}
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
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <PlayCircle
            className={
              replaying
                ? "h-4 w-4 animate-spin"
                : "h-4 w-4"
            }
          />

          {replaying
            ? "Replaying..."
            : "Replay All Failed"}
        </button>

      </div>

    </div>
  )
}