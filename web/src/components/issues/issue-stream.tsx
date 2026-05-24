"use client"

import { IssueRow } from "./issue-row"

type Issue = {
  provider: string
  route: string
  error: string
  retries: number
  severity: string
  timestamp: string
}

type Props = {
  issues: Issue[]
  selected: Issue | null
  onSelect: (issue: Issue) => void
}

export function IssueStream({
  issues,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="h-full overflow-auto">

      <div
        className="
          sticky top-0 z-10
          grid
          grid-cols-[120px_1fr_1fr_120px_120px_140px]
          border-b border-border
          bg-background/95
          px-5 py-3
          text-xs uppercase tracking-wide
          text-muted-foreground
        "
      >

        <div>Provider</div>
        <div>Route</div>
        <div>Error</div>
        <div>Retries</div>
        <div>Severity</div>
        <div>Time</div>

      </div>

      {issues.map((issue, i) => (
        <IssueRow
          key={i}
          issue={issue}
          selected={
            selected === issue
          }
          onClick={() =>
            onSelect(issue)
          }
        />
      ))}

    </div>
  )
}