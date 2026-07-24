"use client"

import JsonView from "@uiw/react-json-view"

import type { Event } from "@/types/event"

import {
  AlertTriangle,
  RotateCcw,
} from "lucide-react"

import { ReplayPanel } from "./replay-panel"

type Props = {
  issue: Event | null
}

export function IssueInspector({
  issue,
}: Props) {
  if (!issue) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <AlertTriangle className="mb-4 h-10 w-10 text-muted-foreground/40" />

        <h3 className="text-base font-medium">
          Select a delivery
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Choose a failed delivery from the stream to inspect
          diagnostics, payload, retries and recovery actions.
        </p>
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
              flex h-11 w-11 items-center justify-center
              rounded-xl
              border border-rose-500/20
              bg-rose-500/10
            "
          >
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>

          <div>

            <h2 className="text-lg font-semibold">
              Delivery Details
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Operational diagnostics & recovery
            </p>

          </div>

        </div>

      </div>

      {/* Overview */}

      <div className="space-y-4 border-b border-border p-5 text-sm">

        <div className="flex items-center justify-between">

          <span className="text-muted-foreground">
            Status
          </span>

          <span
            className={`
              rounded-full
              px-2.5
              py-1
              text-xs
              font-medium
              ${
                issue.status === "retrying"
                  ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                  : "border border-rose-500/20 bg-rose-500/10 text-rose-400"
              }
            `}
          >
            {issue.status === "retrying"
              ? "Retrying"
              : "Dead Letter"}
          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-muted-foreground">
            Provider
          </span>

          <span>{issue.provider}</span>

        </div>

        <div className="flex justify-between gap-6">

          <span className="text-muted-foreground">
            Route
          </span>

          <span className="truncate text-right">
            {issue.route}
          </span>

        </div>

        <div className="flex justify-between gap-6">

          <span className="text-muted-foreground">
            Event Type
          </span>

          <span className="truncate text-right">
            {issue.event_type}
          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-muted-foreground">
            Attempts
          </span>

          <span>
            {issue.attempt_count ?? 0} / 5
          </span>

        </div>

        <div className="flex justify-between gap-6">

          <span className="text-muted-foreground">
            Last Error
          </span>

          <span className="max-w-[220px] break-words text-right text-rose-400">
            {issue.last_error ?? "-"}
          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-muted-foreground">
            Created
          </span>

          <span>
            {new Date(issue.created_at).toLocaleString()}
          </span>

        </div>

      </div>

      {/* Failure Details */}

      <div className="flex-1 overflow-auto p-5">

        <div className="mb-4 flex items-center gap-2">

          <RotateCcw className="h-4 w-4 text-orange-400" />

          <h3 className="text-sm font-semibold">
            Failure Details
          </h3>

        </div>

        <div
          className="
            overflow-hidden
            rounded-xl
            border border-border
            bg-background/40
            p-4
          "
        >
          <JsonView
            value={{
              id: issue.id,
              status: issue.status,
              provider: issue.provider,
              route: issue.route,
              event_type: issue.event_type,
              attempts: issue.attempt_count,
              last_error: issue.last_error,
              created_at: issue.created_at,
              payload: issue.payload,
            }}
            displayDataTypes={false}
            displayObjectSize={false}
          />
        </div>

      </div>

      <ReplayPanel eventId={issue.id} />

    </div>
  )
}