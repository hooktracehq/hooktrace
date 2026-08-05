"use client"

import { useMemo, useState } from "react"

// import { useWebhookStream } from "@/hooks/streams/useWebhookStream"

import type { Event } from "@/types/event"

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { LiveStreamTable } from "./live-stream-table"
import { StreamInspector } from "./stream-inspector"

type Props = {
  query: string
  paused: boolean
events : Event[]
  provider: string
  statusFilter: string
  eventType: string
}

export function LiveStream({
  events,
  query,
  paused,
  provider,
  statusFilter,
  eventType,
}: Props) {

  // const {
  //   events,
  // } = useWebhookStream("/ws/events")

  const [selected, setSelected] =
    useState<Event | null>(null)

  const filtered = useMemo(() => {

    if (paused) {
      return []
    }

    return events.filter((event) => {

      // Search
      const matchesQuery = `
        ${event.provider}
        ${event.route}
        ${event.event_type ?? ""}
        ${event.status}
      `
        .toLowerCase()
        .includes(query.toLowerCase())

      if (!matchesQuery) {
        return false
      }

      // Provider
      if (
        provider &&
        event.provider !== provider
      ) {
        return false
      }

      // Status
      if (
        statusFilter &&
        event.status !== statusFilter
      ) {
        return false
      }

      // Event Type
      if (
        eventType &&
        event.event_type !== eventType
      ) {
        return false
      }

      return true

    })

  }, [
    events,
    paused,
    query,
    provider,
    statusFilter,
    eventType,
  ])

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

      <PanelResizeHandle
        className="w-2 bg-border/40"
      />

      <Panel
        defaultSize={28}
        minSize={20}
      >

        <div
          className="
            h-full
            border-l border-border
            bg-background/20
          "
        >

          <StreamInspector
            event={selected}
          />

        </div>

      </Panel>

    </PanelGroup>
  )
}