"use client"

import { useMemo, useState } from "react"

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { DestinationsToolbar } from "./destinations-toolbar"
import { DestinationsStats } from "./destinations-stats"
import { DestinationsStream } from "./destinations-stream"
import { DestinationInspector } from "./destination-inspector"
import { Destination } from "@/types/destinations"

const MOCK_DESTINATIONS = [
    {
      id: "1",
      name: "production-api",
      status: "healthy",
  
      delivered: 12482,
      latency: "82ms",
      lastSeen: "2s ago",
  
      endpoint:
        "https://api.hooktrace.dev/production",
  
      method: "POST",
  
      retries: 0,
  
      successRate: 99.8,
  
      createdAt:
        "2026-08-01T10:00:00Z",
    },
  
    {
      id: "2",
      name: "analytics-worker",
      status: "healthy",
  
      delivered: 8521,
      latency: "64ms",
      lastSeen: "1s ago",
  
      endpoint:
        "https://api.hooktrace.dev/analytics",
  
      method: "POST",
  
      retries: 1,
  
      successRate: 99.5,
  
      createdAt:
        "2026-08-02T14:00:00Z",
    },
  
    {
      id: "3",
      name: "audit-logger",
      status: "failed",
  
      delivered: 420,
      latency: "1.2s",
      lastSeen: "32s ago",
  
      endpoint:
        "https://api.hooktrace.dev/audit",
  
      method: "POST",
  
      retries: 8,
  
      successRate: 87.2,
  
      createdAt:
        "2026-08-03T09:00:00Z",
    },
  ]

export function DestinationsWorkspace() {
  const [query, setQuery] =
    useState("")

  const [selected, setSelected] =
    useState<Destination | null>(
      MOCK_DESTINATIONS[0] as Destination ?? null
    )

  const filtered =
    useMemo(() => {
      return MOCK_DESTINATIONS.filter(
        (destination) =>
          destination.name
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

      <DestinationsToolbar
        query={query}
        setQuery={setQuery}
      />

      <DestinationsStats
        destinations={filtered as Destination[]}
      />

      <PanelGroup direction="horizontal">

        <Panel
          defaultSize={72}
          minSize={50}
        >

          <DestinationsStream
            destinations={filtered as Destination[]}
            selected={selected}
            onSelect={setSelected}
          />

        </Panel>

        <PanelResizeHandle className="w-2 bg-border/40" />

        <Panel
          defaultSize={28}
          minSize={24}
        >

          <div className="h-full border-l border-border">

            <DestinationInspector
              destination={selected}
            />

          </div>

        </Panel>

      </PanelGroup>

    </div>
  )
}