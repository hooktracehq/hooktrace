// "use client"

// import { useMemo, useState } from "react"

// import { EventToolbar } from "./event-toolbar"
// import { EventStream } from "./event-stream"
// import { EventInspector } from "./event-inspector"
// import { EventTimeline } from "./event-timeline"

// import type { Event } from "@/types/event"

// type Props = {
//   events: Event[]
// }

// export function EventWorkspace({
//   events,
// }: Props) {
//   const [selectedEvent, setSelectedEvent] =
//     useState<Event | null>(
//       events[0] || null
//     )

//   const [query, setQuery] =
//     useState("")

//   const filteredEvents = useMemo(() => {
//     if (!query) return events

//     return events.filter((event) => {
//       const search =
//         `${event.route} ${event.provider} ${event.event_type}`
//           .toLowerCase()

//       return search.includes(
//         query.toLowerCase()
//       )
//     })
//   }, [events, query])

//   return (
//     <div className="flex h-[calc(100vh-92px)] flex-col gap-4 overflow-hidden">

//       {/* Toolbar */}
//       <EventToolbar
//         query={query}
//         setQuery={setQuery}
//         total={filteredEvents.length}
//       />

//       {/* Main */}
//       <div className="grid min-h-0 flex-1 grid-cols-[1.2fr_420px] gap-4">

//         {/* Stream + Timeline */}
//         <div className="flex min-h-0 flex-col gap-4">

//           {/* Event Stream */}
//           <div className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
//             <EventStream
//               events={filteredEvents}
//               selectedEvent={selectedEvent}
//               onSelect={setSelectedEvent}
//             />
//           </div>

//           {/* Timeline */}
//           <div className="panel h-[220px] overflow-hidden">
//             <EventTimeline
//               event={selectedEvent}
//             />
//           </div>
//         </div>

//         {/* Inspector */}
//         <div className="panel min-h-0 overflow-hidden">
//           <EventInspector
//             event={selectedEvent}
//           />
//         </div>
//       </div>
//     </div>
//   )
// }



"use client"

import { useMemo, useState } from "react"

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"

import { EventToolbar } from "./event-toolbar"
import { EventStream } from "./event-stream"
import { EventInspector } from "./event-inspector"
import { EventTimeline } from "./event-timeline"

import type { Event } from "@/types/event"

type Props = {
  events: Event[]
  selectedEvent: Event | null
  onSelectEvent: (event: Event) => void
}

export function EventWorkspace({
  events,
  selectedEvent,
  onSelectEvent,
}: Props) {
  

  const [query, setQuery] =
  useState("")
  const [status, setStatus] =
  useState("")

const [provider, setProvider] =
  useState("")

    const filteredEvents = useMemo(() => {
      return events.filter((event) => {
    
        // Search
        const search =
          `${event.route} ${event.provider} ${event.event_type}`
            .toLowerCase()
    
        const matchesSearch =
          search.includes(
            query.toLowerCase()
          )
    
        // Status
        const matchesStatus =
          !status ||
          event.status === status
    
        // Provider
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

  return (
    <div className="flex h-[calc(100vh-92px)] flex-col overflow-hidden">

      {/* Toolbar */}
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

      {/* Workspace */}
      <div className="min-h-0 flex-1 overflow-hidden">

        <PanelGroup
          direction="vertical"
          className="h-full"
        >

          {/* TOP */}
          <Panel
            defaultSize={72}
            minSize={40}
          >

            <PanelGroup
              direction="horizontal"
              className="h-full"
            >

              {/* STREAM */}
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

              {/* RESIZER */}
              <PanelResizeHandle className="group relative w-2">

                <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-colors group-hover:bg-primary" />

              </PanelResizeHandle>

              {/* INSPECTOR */}
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

          {/* RESIZER */}
          <PanelResizeHandle className="group relative h-2">

            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border transition-colors group-hover:bg-primary" />

          </PanelResizeHandle>

          {/* TIMELINE */}
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