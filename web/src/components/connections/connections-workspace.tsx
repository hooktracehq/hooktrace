"use client"

import {
  useMemo,
  useState,
} from "react"

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import type { Connection } from "@/types/connection"

import { ConnectionsToolbar } from "./connections-toolbar"
import { ConnectionsStats } from "./connections-stats"
import { ConnectionsGrid } from "./connections-grid"
import { ConnectionInspector } from "./connection-inspector"

const MOCK_CONNECTIONS: Connection[] = [
  {
    id: "1",

    provider: "Stripe",

    status: "healthy",

    accountName: "Acme Inc",

    accountId: "acct_1ABCXYZ",

    connectedAt: "34 days ago",

    lastSync: "2s ago",

    apiVersion: "2025-10",

    webhookUrl:
      "https://api.hooktrace.dev/stripe",

    secret:
      "whsec_xxxxxxxxx",

    eventsReceived: 82412,

    rateLimitRemaining: 9999,
  },

  {
    id: "2",

    provider: "GitHub",

    status: "healthy",

    accountName: "Hooktrace Org",

    accountId: "org_hooktrace",

    connectedAt: "18 days ago",

    lastSync: "4s ago",

    apiVersion: "v3",

    webhookUrl:
      "https://api.hooktrace.dev/github",

    secret:
      "ghsec_xxxxxxxxx",

    eventsReceived: 18422,

    rateLimitRemaining: 5000,
  },

  {
    id: "3",

    provider: "Shopify",

    status: "error",

    accountName: "Demo Store",

    accountId: "shop_8421",

    connectedAt: "8 days ago",

    lastSync: "2m ago",

    apiVersion: "2025-01",

    webhookUrl:
      "https://api.hooktrace.dev/shopify",

    secret:
      "shopify_xxxxx",

    eventsReceived: 928,

    rateLimitRemaining: 0,
  },
]

export function ConnectionsWorkspace() {
  const [query, setQuery] =
    useState("")

  const [selected, setSelected] =
    useState<Connection | null>(
      MOCK_CONNECTIONS[0]
    )

  const filtered =
    useMemo(() => {
      return MOCK_CONNECTIONS.filter(
        (connection) =>
          connection.provider
            .toLowerCase()
            .includes(
              query.toLowerCase()
            )
      )
    }, [query])

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
      <ConnectionsToolbar
        query={query}
        setQuery={setQuery}
      />

      <ConnectionsStats
        connections={filtered}
      />

      <PanelGroup direction="horizontal">
        <Panel
          defaultSize={65}
          minSize={45}
        >
          <ConnectionsGrid
            connections={filtered}
            selected={selected}
            onSelect={setSelected}
          />
        </Panel>

        <PanelResizeHandle className="w-2 bg-border/40" />

        <Panel
          defaultSize={35}
          minSize={25}
        >
          <div className="h-full border-l border-border">
            <ConnectionInspector
              connection={selected}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}