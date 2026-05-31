"use client"

import JsonView from "@uiw/react-json-view"

import {
  RotateCcw,
  Clock3,
  Eye,
  PlayCircle,
  Ban,
} from "lucide-react"

import { ReplayHistory } from "./replay-history"

type Replay = {
  id: string
  provider: string
  eventType: string
  status: string
  attempts: number
  started: string
}

type Props = {
  replay: Replay | null
}

export function ReplayInspector({
  replay,
}: Props) {
  if (!replay) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Select a replay
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">

      {/* Header */}
      <div className="border-b border-border p-5">

        <div className="flex items-center gap-3">

          <div
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              border border-orange-500/20
              bg-orange-500/10
            "
          >
            <RotateCcw className="h-5 w-5 text-orange-400" />
          </div>

          <div>
            <h2 className="font-semibold">
              Replay Inspector
            </h2>

            <p className="text-xs text-muted-foreground">
              replay details & controls
            </p>
          </div>

        </div>

      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* Details */}
        <div className="space-y-4 border-b border-border p-5 text-sm">

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Provider
            </span>

            <span className="font-medium">
              {replay.provider}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Event
            </span>

            <span className="font-medium">
              {replay.eventType}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Status
            </span>

            <span
              className={
                replay.status === "failed"
                  ? "text-rose-400"
                  : replay.status === "running"
                  ? "text-orange-400"
                  : "text-emerald-400"
              }
            >
              {replay.status}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Attempts
            </span>

            <span>{replay.attempts}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Started
            </span>

            <span>{replay.started}</span>
          </div>

        </div>

        {/* Payload */}
        <div className="border-b border-border p-5">

          <div className="mb-4 flex items-center gap-2">

            <Clock3 className="h-4 w-4 text-orange-400" />

            <h3 className="text-sm font-semibold">
              Replay Payload
            </h3>

          </div>

          <div className="overflow-hidden rounded-xl border border-border">

            <JsonView
              value={{
                replayId: replay.id,
                provider: replay.provider,
                eventType: replay.eventType,
                attempts: replay.attempts,
                status: replay.status,
                started: replay.started,
              }}
              displayDataTypes={false}
              displayObjectSize={false}
            />

          </div>

        </div>

        {/* Actions */}
        <div className="border-b border-border p-5">

          <h3 className="mb-4 text-sm font-semibold">
            Replay Actions
          </h3>

          <div className="space-y-3">

            <button
              className="
                flex w-full items-center justify-center gap-2
                rounded-xl
                border border-orange-500/20
                bg-orange-500/10
                px-4 py-3
                text-sm font-medium
                text-orange-400
                transition-colors
                hover:bg-orange-500/15
              "
            >
              <PlayCircle className="h-4 w-4" />
              Replay Again
            </button>

            <button
              className="
                flex w-full items-center justify-center gap-2
                rounded-xl
                border border-rose-500/20
                bg-rose-500/10
                px-4 py-3
                text-sm font-medium
                text-rose-400
                transition-colors
                hover:bg-rose-500/15
              "
            >
              <Ban className="h-4 w-4" />
              Cancel Replay
            </button>

            <button
              className="
                flex w-full items-center justify-center gap-2
                rounded-xl
                border border-border
                px-4 py-3
                text-sm
                transition-colors
                hover:bg-white/[0.03]
              "
            >
              <Eye className="h-4 w-4" />
              View Original Event
            </button>

          </div>

        </div>

        {/* Replay History */}
        <div className="p-5">

          <ReplayHistory />

        </div>

      </div>

    </div>
  )
}