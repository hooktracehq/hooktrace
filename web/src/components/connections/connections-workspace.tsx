
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

import { useConnections } from "@/hooks/connections/use-connections"

import { ConnectionsToolbar } from "./connections-toolbar"
import { ConnectionsStats } from "./connections-stats"
import { ConnectionsGrid } from "./connections-grid"
import { ConnectionInspector } from "./connection-inspector"

import { LoadingScreen } from "@/components/shared/loading-screen"

export function ConnectionsWorkspace() {
  const [query, setQuery] =
    useState("")

  const {
    data,
    isLoading,
  } = useConnections()

  const connections = useMemo(() => {
    return data?.items ?? []
  }, [data])

console.log("data from connections : ",data)


  const filtered = useMemo(() => {
    return connections.filter(
      (connection) =>
        connection.provider
          .toLowerCase()
          .includes(
            query.toLowerCase()
          )
    )
  }, [connections, query])

  const [
    selectedProvider,
    setSelectedProvider,
  ] = useState<string | null>(
    null
  )

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
      />

<ConnectionsStats />

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
    </div>
  )
}