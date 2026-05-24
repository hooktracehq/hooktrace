"use client"

import JsonView from "@uiw/react-json-view"

import {
  AlertTriangle,
  RotateCcw,
} from "lucide-react"

import { ReplayPanel } from "./replay-panel"

type Issue = {
  provider: string
  route: string
  error: string
  retries: number
  severity: string
  timestamp: string
}

type Props = {
  issue: Issue | null
}

export function IssueInspector({
  issue,
}: Props) {

  if (!issue) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Select an issue
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">

      <div className="border-b border-border p-5">

        <div className="flex items-center gap-3">

          <div
            className="
              flex h-11 w-11 items-center justify-center
              rounded-xl border border-rose-500/20
              bg-rose-500/10
            "
          >
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>

          <div>

            <h2 className="text-lg font-semibold">
              Issue Inspector
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              delivery failure diagnostics
            </p>

          </div>

        </div>

      </div>

      <div className="space-y-3 border-b border-border p-5 text-sm">

        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Provider
          </span>

          <span>
            {issue.provider}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Retries
          </span>

          <span>
            {issue.retries}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Severity
          </span>

          <span className="text-rose-400">
            {issue.severity}
          </span>
        </div>

      </div>

      <div className="flex-1 overflow-auto p-5">

        <div className="mb-4 flex items-center gap-2">

          <RotateCcw className="h-4 w-4 text-orange-400" />

          <h3 className="text-sm font-semibold">
            Failure Payload
          </h3>

        </div>

        <div
          className="
            overflow-hidden rounded-xl
            border border-border
            bg-background/40 p-4
          "
        >

          <JsonView
            value={{
              provider: issue.provider,
              route: issue.route,
              error: issue.error,
              retries: issue.retries,
            }}
            displayDataTypes={false}
            displayObjectSize={false}
          />

        </div>

      </div>

      <ReplayPanel />

    </div>
  )
}