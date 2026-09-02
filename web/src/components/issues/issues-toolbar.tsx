"use client"

import {
  AlertTriangle,
  RotateCcw,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

import { apiFetch } from "@/lib/api"

type Props = {
  query: string
  setQuery: (v: string) => void
  selected: {
    id: number
  } | null
  onReplayComplete: () => void
}

export function IssuesToolbar({
  query,
  setQuery,
  selected,
  onReplayComplete,
}: Props) {
  const [replaying, setReplaying] = useState(false)

  async function handleReplay() {
    if (!selected || replaying) return

    const eventId = selected.id

    setReplaying(true)

    try {
      const result = await apiFetch(
        `/events/${eventId}/replay`,
        {
          method: "POST",
        },
      )

      console.log(
        "[IssuesToolbar] replay response:",
        result,
      )

      toast.success(
        `Event #${eventId} replay queued`,
      )

      onReplayComplete()
    } catch (error) {
      console.error(
        "[IssuesToolbar] replay failed:",
        error,
      )

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to replay event",
      )
    } finally {
      setReplaying(false)
    }
  }

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
          type="button"
          onClick={handleReplay}
          disabled={!selected || replaying}
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
            disabled:opacity-40
          "
        >
          <RotateCcw
            className={
              replaying
                ? "h-4 w-4 animate-spin"
                : "h-4 w-4"
            }
          />

          {replaying
            ? "Replaying..."
            : selected
              ? "Replay Selected"
              : "Select an Issue"}
        </button>

      </div>

    </div>
  )
}