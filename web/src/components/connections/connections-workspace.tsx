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

import {
  useConnections,
} from "@/hooks/connections/use-connections"

import { ConnectionsToolbar } from "./connections-toolbar"
import { ConnectionsStats } from "./connections-stats"
import { ConnectionsGrid } from "./connections-grid"
import { ConnectionInspector } from "./connection-inspector"
import { ConnectProviderDialog } from "./connect-provider-dialog"

import { LoadingScreen } from "@/components/shared/loading-screen"

export function ConnectionsWorkspace() {
  const [query, setQuery] =
    useState("")

  const [connectOpen, setConnectOpen] =
    useState(false)

  const [selectedProvider, setSelectedProvider] =
    useState<string | null>(null)

  const {
    data,
    isLoading,
  } = useConnections()

  const connections = useMemo(() => {
    return data?.items ?? []
  }, [data])

  const filtered = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase()

    if (!normalizedQuery) {
      return connections
    }

    return connections.filter(
      (connection) =>
        connection.provider
          .toLowerCase()
          .includes(normalizedQuery)
    )
  }, [connections, query])

  const selected = useMemo(() => {
    if (!filtered.length) {
      return null
    }

    return (
      filtered.find(
        (connection) =>
          connection.provider ===
          selectedProvider
      ) ?? filtered[0]
    )
  }, [
    filtered,
    selectedProvider,
  ])

  if (isLoading) {
    return (
      <LoadingScreen
        title="Loading connections..."
      />
    )
  }

  return (
    <>
      <div
        className="
          flex
          h-[calc(100vh-92px)]
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-surface-1
        "
      >
        <ConnectionsToolbar
          query={query}
          setQuery={setQuery}
          onConnect={() =>
            setConnectOpen(true)
          }
        />

        <ConnectionsStats />

        {filtered.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <h3 className="font-medium">
                {query
                  ? "No providers found"
                  : "No providers connected"}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {query
                  ? "Try another provider name."
                  : "Connect a provider to create your first webhook endpoint."}
              </p>

              {!query && (
                <button
                  type="button"
                  onClick={() =>
                    setConnectOpen(true)
                  }
                  className="
                    mt-4
                    rounded-lg
                    bg-primary
                    px-4
                    py-2
                    text-sm
                    font-medium
                    text-primary-foreground
                  "
                >
                  Connect Provider
                </button>
              )}
            </div>
          </div>
        ) : (
          <PanelGroup direction="horizontal">
            <Panel
              defaultSize={65}
              minSize={45}
            >
              <ConnectionsGrid
                connections={filtered}
                selected={selected}
                onSelect={(connection) =>
                  setSelectedProvider(
                    connection.provider
                  )
                }
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
        )}
      </div>

      <ConnectProviderDialog
        open={connectOpen}
        onClose={() =>
          setConnectOpen(false)
        }
      />
    </>
  )
}