"use client"

import { useMemo, useState } from "react"

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { IssuesToolbar } from "./issues-toolbar"
import { IssueStats } from "./issue-stats"
import { IssueStream } from "./issue-stream"
import { IssueInspector } from "./issue-inspector"

import { useDlq } from "@/hooks/events/useDlq"

import type { Event } from "@/types/event"

export function IssuesWorkspace() {
  const { data, isLoading } = useDlq()

  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Event | null>(null)

  const issues = data?.items ?? []

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()

    if (!search) return issues

    return issues.filter((issue) =>
      [
        issue.provider,
        issue.route,
        issue.event_type,
        issue.last_error,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    )
  }, [issues, query])

  return (
    <div
      className="
        flex
        h-[calc(100vh-92px)]
        flex-col
        overflow-hidden
        rounded-2xl
        border border-border
        bg-surface-1
      "
    >
      <IssuesToolbar
        query={query}
        setQuery={setQuery}
      />

      <IssueStats />

      <PanelGroup direction="horizontal">

        <Panel
          defaultSize={68}
          minSize={45}
        >
          <IssueStream
            issues={filtered}
            selected={selected}
            onSelect={setSelected}
            loading={isLoading}
          />
        </Panel>

        <PanelResizeHandle className="w-2 bg-border/40" />

        <Panel
          defaultSize={32}
          minSize={24}
        >
          <div className="h-full border-l border-border bg-background/20">
            <IssueInspector issue={selected} />
          </div>
        </Panel>

      </PanelGroup>
    </div>
  )
}