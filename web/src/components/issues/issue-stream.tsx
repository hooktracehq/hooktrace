"use client"

import {
  AlertTriangle,
  ShieldCheck,
} from "lucide-react"

import { IssueRow } from "./issue-row"

import type { Event } from "@/types/event"

type Props = {
  issues: Event[]
  selected: Event | null
  onSelect: (issue: Event) => void
  loading?: boolean
}

export function IssueStream({
  issues,
  selected,
  onSelect,
  loading = false,
}: Props) {
  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <AlertTriangle className="h-8 w-8 text-muted-foreground/50" />

        <div>
          <p className="font-medium">
            Loading operational issues...
          </p>

          <p className="text-sm text-muted-foreground">
            Fetching failed deliveries and recovery information.
          </p>
        </div>
      </div>
    )
  }

  if (!issues.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">

        <div
          className="
            mb-6 flex h-16 w-16 items-center justify-center
            rounded-2xl border border-emerald-500/20
            bg-emerald-500/10
          "
        >
          <ShieldCheck className="h-8 w-8 text-emerald-400" />
        </div>

        <h2 className="text-lg font-semibold">
          No Operational Issues
        </h2>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Everything looks healthy. All webhook deliveries are operating
          normally and there are no active recovery actions.
        </p>

        <div className="mt-8 space-y-2 text-sm">

          <div className="flex items-center justify-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>No failed deliveries</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>No active retries</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>No dead letters</span>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">

      <div
        className="
          sticky top-0 z-10
          grid
          grid-cols-[120px_120px_1fr_1.4fr_100px_180px]
          border-b border-border
          bg-background/95
          px-5 py-3
          text-xs uppercase tracking-wide
          text-muted-foreground
        "
      >
        <div>Status</div>
        <div>Provider</div>
        <div>Route</div>
        <div>Last Error</div>
        <div>Attempts</div>
        <div>Updated</div>
      </div>

      {issues.map((issue) => (
        <IssueRow
          key={issue.id}
          issue={issue}
          selected={selected?.id === issue.id}
          onClick={() => onSelect(issue)}
        />
      ))}

    </div>
  )
}