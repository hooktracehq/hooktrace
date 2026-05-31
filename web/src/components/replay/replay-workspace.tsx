"use client"

import { useMemo, useState } from "react"

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { ReplayToolbar } from "./replay-toolbar"
import { ReplayStats } from "./replay-stats"
import { ReplayStream } from "./replay-stream"
import { ReplayInspector } from "./replay-inspector"

const MOCK_REPLAYS = Array.from({
  length: 25,
}).map((_, i) => ({
  id: `replay_${i}`,
  provider:
    i % 2 === 0
      ? "stripe"
      : "github",

  eventType:
    i % 2 === 0
      ? "payment.succeeded"
      : "repo.push",

  status:
    i % 3 === 0
      ? "running"
      : i % 4 === 0
      ? "failed"
      : "completed",

  attempts:
    Math.floor(
      Math.random() * 4
    ) + 1,

  started: `${i + 1}m ago`,
}))

export function ReplayWorkspace() {
  const [query, setQuery] =
    useState("")

  const [selected, setSelected] =
    useState<
      (typeof MOCK_REPLAYS)[number] | null
    >(null)

  const filtered =
    useMemo(() => {
      return MOCK_REPLAYS.filter(
        (item) =>
          `${item.provider} ${item.eventType}`
            .toLowerCase()
            .includes(
              query.toLowerCase()
            )
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

      <ReplayToolbar
        query={query}
        setQuery={setQuery}
      />

      <ReplayStats />

      <PanelGroup direction="horizontal">

        <Panel
          defaultSize={68}
          minSize={45}
        >

          <ReplayStream
            replays={filtered}
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

            <ReplayInspector
              replay={selected}
            />

          </div>

        </Panel>

      </PanelGroup>

    </div>
  )
}