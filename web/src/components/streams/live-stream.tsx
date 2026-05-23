"use client"

import { useMemo, useState } from "react"

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { LiveStreamTable } from "./live-stream-table"

import { StreamInspector } from "./stream-inspector"

const rows = Array.from({
  length: 30,
}).map((_, i) => ({
  provider:
    i % 2 === 0
      ? "stripe"
      : "github",

  route:
    i % 2 === 0
      ? "/webhooks/stripe"
      : "/webhooks/github",

  eventType:
    i % 2 === 0
      ? "payment.succeeded"
      : "repo.push",

  status:
    i % 4 === 0
      ? "failed"
      : "success",

  latency: `${40 + i}ms`,

  timestamp: `${i + 1}s ago`,
}))

type Props = {
  query: string
}

export function LiveStream({
  query,
}: Props) {

  const [selected, setSelected] =
    useState<
      (typeof rows)[number] | null
    >(null)

  const filtered =
    useMemo(() => {

      return rows.filter((row) =>
        `
          ${row.provider}
          ${row.route}
          ${row.eventType}
        `
          .toLowerCase()
          .includes(query.toLowerCase())
      )

    }, [query])

  return (
    <PanelGroup direction="horizontal">

      <Panel
        defaultSize={72}
        minSize={45}
      >

        <LiveStreamTable
          rows={filtered}
          selected={selected}
          onSelect={setSelected}
        />

      </Panel>

      <PanelResizeHandle className="w-2 bg-border/40" />

      <Panel
        defaultSize={28}
        minSize={20}
      >

        <div className="h-full border-l border-border bg-background/20">

          <StreamInspector
            event={selected}
          />

        </div>

      </Panel>

    </PanelGroup>
  )
}