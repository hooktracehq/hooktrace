"use client"

import { useMemo, useState } from "react"
import { useWebhookStream } from "@/hooks/streams/useWebhookStream"
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
}
export function LiveStream({
  query,
  paused,
}: Props) {

  const {
    events,
  } = useWebhookStream("/ws/events")

  const [selected, setSelected] =
    useState<typeof events[number] | null>(null)

  const filtered = useMemo(() => {

    const list = paused ? [] : events

    return list.filter(event =>
      `
        ${event.provider}
        ${event.route}
        ${event.event_type ?? "webhook"}
        ${event.status}
      `
        .toLowerCase()
        .includes(query.toLowerCase())
    )

  }, [events, paused, query])

  return (
    <PanelGroup direction="horizontal">

      <Panel
        defaultSize={72}
        minSize={45}
      >

        <LiveStreamTable
          rows={filtered as Event[]}
          selected={selected as Event | null}
          onSelect={setSelected as (row: Event) => void}
        />

      </Panel>

      <PanelResizeHandle className="w-2 bg-border/40" />

      <Panel
        defaultSize={28}
        minSize={20}
      >

        <div className="h-full border-l border-border bg-background/20">

          <StreamInspector
            event={selected as Event | null}
          />

        </div>

      </Panel>

    </PanelGroup>
  )
}