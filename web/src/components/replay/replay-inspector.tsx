"use client"

import JsonView from "@uiw/react-json-view"
import type { Replay } from "@/types/replay-types"
import { useEffect, useState } from "react"

import {
  RotateCcw,
  Clock3,
  Eye,
  PlayCircle,
  Ban,
  Loader2,
} from "lucide-react"

import {
  ReplayHistory,
  type ReplayHistoryItem,
} from "./replay-history"

type Props = {
  replay: Replay | null
  onReplayCreated?: () => void | Promise<void>
}

export function ReplayInspector({
  replay,
  onReplayCreated,
}: Props) {
  const [history, setHistory] =
    useState<ReplayHistoryItem[]>([])

  const [loadingHistory, setLoadingHistory] =
    useState(false)

  const [replaying, setReplaying] =
    useState(false)

  const [cancelling, setCancelling] =
    useState(false)

  /*
   * Load replay history whenever
   * the selected replay changes.
   */
  useEffect(() => {
    if (!replay) {
      setHistory([])
      return
    }

    const selectedReplay = replay

    let cancelled = false

    async function loadHistory() {
      try {
        setLoadingHistory(true)

        const response = await fetch(
          `http://localhost:3001/replays/${selectedReplay.id}/history`,
          {
            credentials: "include",
          }
        )

        if (!response.ok) {
          throw new Error(
            `Failed to load replay history: ${response.status}`
          )
        }

        const data: ReplayHistoryItem[] =
          await response.json()

        if (!cancelled) {
          setHistory(data)
        }
      } catch (error) {
        console.error(
          "Failed to load replay history:",
          error
        )

        if (!cancelled) {
          setHistory([])
        }
      } finally {
        if (!cancelled) {
          setLoadingHistory(false)
        }
      }
    }

    loadHistory()

    return () => {
      cancelled = true
    }
  }, [replay])

  /*
   * Nothing selected
   */
  if (!replay) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Select a replay
      </div>
    )
  }

  /*
   * Stable non-null reference.
   *
   * This prevents TypeScript from complaining
   * that replay could become null inside
   * event handlers.
   */
  const selectedReplay = replay

  const provider =
    selectedReplay.provider || "unknown"

  const eventType =
    selectedReplay.event_type || "unknown"

  const status =
    selectedReplay.status || "queued"

  const attempts =
    selectedReplay.attempts || 0

  const started =
    selectedReplay.started_at ||
    selectedReplay.created_at

  /*
   * --------------------------------------------------
   * Replay Again
   * --------------------------------------------------
   *
   * Creates a NEW replay job for the original
   * webhook event.
   */
  async function handleReplayAgain() {
    if (!selectedReplay.event_id) {
      console.error(
        "Cannot replay: missing event_id"
      )
      return
    }

    try {
      setReplaying(true)

      const response = await fetch(
        "http://localhost:3001/replays",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_ids: [
              selectedReplay.event_id,
            ],
          }),
        }
      )

      if (!response.ok) {
        const errorText =
          await response.text()

        throw new Error(
          `Failed to create replay: ${errorText}`
        )
      }

      const data = await response.json()

      console.log(
        "Replay job created:",
        data
      )

      /*
       * Refresh replay list.
       */
      await onReplayCreated?.()

    } catch (error) {
      console.error(
        "Failed to replay event:",
        error
      )
    } finally {
      setReplaying(false)
    }
  }

  /*
   * --------------------------------------------------
   * Cancel Replay
   * --------------------------------------------------
   *
   * Requires backend endpoint:
   *
   * POST /replays/{replay_job_id}/cancel
   */
  async function handleCancelReplay() {
    if (
      status !== "queued" &&
      status !== "running"
    ) {
      return
    }

    try {
      setCancelling(true)

      const response = await fetch(
        `http://localhost:3001/replays/${selectedReplay.id}/cancel`,
        {
          method: "POST",
          credentials: "include",
        }
      )

      if (!response.ok) {
        const errorText =
          await response.text()

        throw new Error(
          `Failed to cancel replay: ${errorText}`
        )
      }

      const data =
        await response.json()

      console.log(
        "Replay cancelled:",
        data
      )

      /*
       * Refresh replay list.
       */
      await onReplayCreated?.()

    } catch (error) {
      console.error(
        "Failed to cancel replay:",
        error
      )
    } finally {
      setCancelling(false)
    }
  }

  /*
   * --------------------------------------------------
   * View Original Event
   * --------------------------------------------------
   */
  function handleViewOriginalEvent() {
    if (!selectedReplay.event_id) {
      console.error(
        "Cannot view original event: missing event_id"
      )
      return
    }

    window.location.href =
      `/events?event=${selectedReplay.event_id}`
  }

  /*
   * Cancel is only valid for jobs that haven't
   * finished yet.
   */
  const canCancel =
    status === "queued" ||
    status === "running"

  /*
   * Payload shown in the inspector.
   */
  const replayPayload = {
    replayId: selectedReplay.id,
    eventId: selectedReplay.event_id,
    provider,
    eventType,
    attempts,
    status,
    started,
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

          <div className="min-w-0">

            <h2 className="font-semibold">
              Replay Inspector
            </h2>

            <p className="truncate text-xs text-muted-foreground">
              {selectedReplay.id}
            </p>

          </div>

        </div>

      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* Details */}
        <div className="space-y-4 border-b border-border p-5 text-sm">

          {/* Provider */}
          <div className="flex items-center justify-between gap-4">

            <span className="text-muted-foreground">
              Provider
            </span>

            <span className="font-medium">
              {provider}
            </span>

          </div>

          {/* Event */}
          <div className="flex items-center justify-between gap-4">

            <span className="text-muted-foreground">
              Event
            </span>

            <span className="max-w-[220px] truncate font-medium">
              {eventType}
            </span>

          </div>

          {/* Status */}
          <div className="flex items-center justify-between gap-4">

            <span className="text-muted-foreground">
              Status
            </span>

            <span
              className={
                status === "failed"
                  ? "text-rose-400"
                  : status === "running"
                  ? "text-orange-400"
                  : status === "queued"
                  ? "text-yellow-400"
                  : status === "cancelled"
                  ? "text-muted-foreground"
                  : "text-emerald-400"
              }
            >
              {status}
            </span>

          </div>

          {/* Attempts */}
          <div className="flex items-center justify-between gap-4">

            <span className="text-muted-foreground">
              Attempts
            </span>

            <span className="tabular-nums">
              {attempts}
            </span>

          </div>

          {/* Event ID */}
          <div className="flex items-center justify-between gap-4">

            <span className="text-muted-foreground">
              Event ID
            </span>

            <span className="font-mono text-xs">
              {selectedReplay.event_id ?? "—"}
            </span>

          </div>

          {/* Started */}
          <div className="flex items-center justify-between gap-4">

            <span className="text-muted-foreground">
              Started
            </span>

            <span className="max-w-[220px] truncate text-xs">
              {started}
            </span>

          </div>

        </div>

        {/* Replay Payload */}
        <div className="border-b border-border p-5">

          <div className="mb-4 flex items-center gap-2">

            <Clock3 className="h-4 w-4 text-orange-400" />

            <h3 className="text-sm font-semibold">
              Replay Payload
            </h3>

          </div>

          <div
            className="
              max-h-[420px]
              overflow-auto
              rounded-xl
              border
              border-border
              bg-background/30
              p-3
            "
          >

            <JsonView
              value={replayPayload}
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

            {/* Replay Again */}
            <button
              onClick={
                handleReplayAgain
              }
              disabled={
                replaying ||
                !selectedReplay.event_id
              }
              className="
                flex w-full
                items-center justify-center gap-2
                rounded-xl
                border border-orange-500/20
                bg-orange-500/10
                px-4 py-3
                text-sm font-medium
                text-orange-400
                transition-colors
                hover:bg-orange-500/15
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >

              {replaying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}

              {replaying
                ? "Creating Replay..."
                : "Replay Again"}

            </button>

            {/* Cancel Replay */}
            <button
              onClick={
                handleCancelReplay
              }
              disabled={
                !canCancel ||
                cancelling
              }
              className="
                flex w-full
                items-center justify-center gap-2
                rounded-xl
                border border-rose-500/20
                bg-rose-500/10
                px-4 py-3
                text-sm font-medium
                text-rose-400
                transition-colors
                hover:bg-rose-500/15
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >

              {cancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ban className="h-4 w-4" />
              )}

              {cancelling
                ? "Cancelling..."
                : "Cancel Replay"}

            </button>

            {/* View Original Event */}
            <button
              onClick={
                handleViewOriginalEvent
              }
              disabled={
                !selectedReplay.event_id
              }
              className="
                flex w-full
                items-center justify-center gap-2
                rounded-xl
                border border-border
                px-4 py-3
                text-sm
                transition-colors
                hover:bg-white/[0.03]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >

              <Eye className="h-4 w-4" />

              View Original Event

            </button>

          </div>

        </div>

        {/* Replay History */}
        <div className="p-5">

          {loadingHistory ? (

            <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
              Loading replay history...
            </div>

          ) : history.length === 0 ? (

            <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
              No replay attempts yet.
            </div>

          ) : (

            <ReplayHistory
              history={history}
            />

          )}

        </div>

      </div>

    </div>
  )
}