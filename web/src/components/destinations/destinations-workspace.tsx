"use client"

import { useMemo, useState } from "react"

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { useDestinations } from "@/hooks/destinations/use-destinations"

import { LoadingScreen } from "@/components/shared/loading-screen"

import { DestinationsToolbar } from "./destinations-toolbar"
import { DestinationsStats } from "./destinations-stats"
import { DestinationsStream } from "./destinations-stream"
import { DestinationInspector } from "./destination-inspector"

export function DestinationsWorkspace() {
  const [query, setQuery] =
    useState("")

  const {
    data,
    isLoading,
  } = useDestinations()

  const destinations = useMemo(() => {
    return data?.items ?? []
  }, [data])

  const filtered = useMemo(() => {
    return destinations.filter(
      (destination) =>
        destination.name
          .toLowerCase()
          .includes(
            query.toLowerCase()
          )
    )
  }, [destinations, query])

  const [
    selectedId,
    setSelectedId,
  ] = useState<string | null>(
    null
  )

  const selected = useMemo(() => {
    if (!filtered.length) {
      return null
    }

    return (
      filtered.find(
        (destination) =>
          destination.id ===
          selectedId
      ) ?? filtered[0]
    )
  }, [
    filtered,
    selectedId,
  ])

  if (isLoading) {
    return (
      <LoadingScreen
        title="Loading delivery targets..."
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
     <DestinationsToolbar
  query={query}
  setQuery={setQuery}
  onCreated={(target) => {
    setSelectedId(target.id)
  }}
/>

      <DestinationsStats />

      <PanelGroup direction="horizontal">

        <Panel
          defaultSize={72}
          minSize={50}
        >
          <DestinationsStream
            destinations={filtered}
            selected={selected}
            onSelect={(destination) =>
              setSelectedId(
                destination.id
              )
            }
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
  onUpdated={(updated) => {
    setSelectedId(updated.id)
  }}
  onDeleted={(id) => {
    if (selectedId === id) {
      setSelectedId(null)
    }
  }}
/>

          </div>
        </Panel>

      </PanelGroup>

    </div>
  )
}