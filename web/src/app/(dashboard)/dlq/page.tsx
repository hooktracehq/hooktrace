"use client"

import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { IssuesToolbar } from "@/components/issues/issues-toolbar"
import { IssueStats } from "@/components/issues/issue-stats"
import { IssueStream } from "@/components/issues/issue-stream"
import { IssueInspector } from "@/components/issues/issue-inspector"

import { useDlq } from "@/hooks/events/useDlq"

import type { Event } from "@/types/event"

export default function IssuesWorkspace() {
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
  } = useDlq()

  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Event | null>(null)

  const issues = data?.items ?? []

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()

    if (!search) {
      return issues
    }

    return issues.filter((issue) =>
      [
        issue.provider,
        issue.route,
        issue.last_error,
        issue.event_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    )
  }, [issues, query])

  function handleSelect(issue: Event) {
    console.log("[IssuesWorkspace] selecting:", issue)

    setSelected(issue)
  }

  async function handleReplayComplete() {
    setSelected(null)

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["events", "dlq"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["issue-stats"],
      }),
    ])
  }

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
        selected={selected}
        onReplayComplete={handleReplayComplete}
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
            onSelect={handleSelect}
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