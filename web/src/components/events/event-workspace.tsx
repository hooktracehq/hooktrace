"use client"

import { useMemo, useState } from "react"
import { LoadingScreen } from "@/components/shared/loading-screen"


import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { Loader2 } from "lucide-react"

import { EventToolbar } from "./event-toolbar"
import { EventStream } from "./event-stream"
import { EventInspector } from "./event-inspector"
import { EventTimeline } from "./event-timeline"

import type { Event } from "@/types/event"

type Props = {
  events: Event[]
  selectedEvent: Event | null
  loading: boolean
  onSelectEvent: (event: Event) => void
}

export function EventWorkspace({
  events,
  selectedEvent,
  loading,
  onSelectEvent,
}: Props) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("")
  const [provider, setProvider] = useState("")

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const search =
        `${event.route} ${event.provider} ${event.event_type}`.toLowerCase()

      const matchesSearch = search.includes(
        query.toLowerCase()
      )

      const matchesStatus =
        !status ||
        event.status === status

      const matchesProvider =
        !provider ||
        event.provider === provider

      return (
        matchesSearch &&
        matchesStatus &&
        matchesProvider
      )
    })
  }, [
    events,
    query,
    status,
    provider,
  ])

  if (loading) {
    return (
      <LoadingScreen
        title="Events"
        description="Fetching webhook events..."
      />
    )
  }

  return (
    <div className="flex h-[calc(100vh-92px)] flex-col overflow-hidden">

      <div className="mb-4">
        <EventToolbar
          query={query}
          setQuery={setQuery}
          count={filteredEvents.length}
          status={status}
          setStatus={setStatus}
          provider={provider}
          setProvider={setProvider}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">

        <PanelGroup
          direction="vertical"
          className="h-full"
        >

          <Panel
            defaultSize={72}
            minSize={40}
          >

            <PanelGroup
              direction="horizontal"
              className="h-full"
            >

              <Panel
                defaultSize={72}
                minSize={40}
              >

                <div className="panel h-full overflow-hidden">

                  <EventStream
                    events={filteredEvents}
                    selectedEvent={selectedEvent}
                    onSelect={onSelectEvent}
                  />

                </div>

              </Panel>

              <PanelResizeHandle className="group relative w-2">

                <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-colors group-hover:bg-primary" />

              </PanelResizeHandle>

              <Panel
                defaultSize={28}
                minSize={20}
              >

                <div className="panel h-full overflow-hidden">

                  <EventInspector
                    event={selectedEvent}
                  />

                </div>

              </Panel>

            </PanelGroup>

          </Panel>

          <PanelResizeHandle className="group relative h-2">

            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border transition-colors group-hover:bg-primary" />

          </PanelResizeHandle>

          <Panel
            defaultSize={28}
            minSize={18}
          >

            <div className="panel h-full overflow-hidden">

              <EventTimeline
                event={selectedEvent}
              />

            </div>

          </Panel>

        </PanelGroup>

      </div>
    </div>
  )
}