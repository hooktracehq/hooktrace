"use client"

import { useMemo, useState } from "react"

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { RoutesToolbar } from "./routes-toolbar"
import { RoutesStats } from "./routes-stats"
import { RoutesStream } from "./routes-stream"
import { RouteInspector } from "./route-inspector"

import { Route } from "@/types/route"

const MOCK_ROUTES = [
  {
    id: "1",
    provider: "stripe",
    path: "/webhooks/stripe",
    status: "active",
    throughput: 824,
    failures: 3,
    destinations: 2,
    lastSeen: "3s ago",
  },

  {
    id: "2",
    provider: "github",
    path: "/webhooks/github",
    status: "active",
    throughput: 412,
    failures: 0,
    destinations: 1,
    lastSeen: "1s ago",
  },

  {
    id: "3",
    provider: "shopify",
    path: "/webhooks/shopify",
    status: "error",
    throughput: 210,
    failures: 18,
    destinations: 3,
    lastSeen: "12s ago",
  },
]

export function RoutesWorkspace() {
  const [query, setQuery] =
    useState("")

  const [selected, setSelected] =
    useState<
      (typeof MOCK_ROUTES)[number] | null
    >(
      MOCK_ROUTES[0] ?? null
    )

  const filtered =
    useMemo(() => {
      return MOCK_ROUTES.filter(
        (route) =>
          `${route.provider} ${route.path}`
            .toLowerCase()
            .includes(
              query.toLowerCase()
            )
      )
    }, [query])

  const activeRoute =
    selected ??
    filtered[0] ??
    null

  return (
    <div
      className="
        flex h-[calc(100vh-92px)]
        flex-col overflow-hidden
        rounded-2xl border border-border
        bg-surface-1
      "
    >

      <RoutesToolbar
        query={query}
        setQuery={setQuery}
      />

      <RoutesStats
        routes={filtered as Route[]}
      />

      <PanelGroup direction="horizontal">

        <Panel
          defaultSize={70}
          minSize={50}
        >

          <RoutesStream
            routes={filtered as Route[]}
            selected={activeRoute as Route | null}
            onSelect={setSelected}
          />

        </Panel>

        <PanelResizeHandle className="w-2 bg-border/40" />

        <Panel
          defaultSize={30}
          minSize={24}
        >

          <div className="h-full border-l border-border">

            <RouteInspector
              route={activeRoute as Route | null}
            />

          </div>

        </Panel>

      </PanelGroup>

    </div>
  )
}