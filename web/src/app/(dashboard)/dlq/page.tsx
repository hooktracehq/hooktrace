"use client"

import { useMemo, useState } from "react"

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { IssuesToolbar } from "@/components/issues/issues-toolbar"

import { IssueStats } from "@/components/issues/issue-stats"

import { IssueStream } from "@/components/issues/issue-stream"

import { IssueInspector } from "@/components/issues/issue-inspector"

const issues = Array.from({
  length: 18,
}).map((_, i) => ({
  provider:
    i % 2 === 0
      ? "stripe"
      : "github",

  route:
    i % 2 === 0
      ? "/webhooks/stripe"
      : "/webhooks/github",

  error:
    i % 2 === 0
      ? "signature verification failed"
      : "timeout exceeded",

  retries: i % 4,

  severity:
    i % 3 === 0
      ? "critical"
      : "warning",

  timestamp: `${i + 1}m ago`,
}))

export default function IssuesWorkspace() {

  const [query, setQuery] =
    useState("")

  const [selected, setSelected] =
    useState<
      (typeof issues)[number] | null
    >(null)

  const filtered =
    useMemo(() => {

      return issues.filter((issue) =>
        `
          ${issue.provider}
          ${issue.route}
          ${issue.error}
        `
          .toLowerCase()
          .includes(query.toLowerCase())
      )

    }, [query])

  return (
    <div
      className="
        flex h-[calc(100vh-92px)]
        flex-col overflow-hidden
        rounded-2xl border border-border
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
          />

        </Panel>

        <PanelResizeHandle className="w-2 bg-border/40" />

        <Panel
          defaultSize={32}
          minSize={24}
        >

          <div className="h-full border-l border-border bg-background/20">

            <IssueInspector
              issue={selected}
            />

          </div>

        </Panel>

      </PanelGroup>

    </div>
  )
}