// "use client"

// import type { Event } from "@/types/event"

// import { EventRow } from "./event-row"

// type Props = {
//   events: Event[]
//   selectedEvent: Event | null
//   onSelect: (event: Event) => void
// }

// export function EventStream({
//   events,
//   selectedEvent,
//   onSelect,
// }: Props) {
//   return (
//     <div className="flex h-full flex-col overflow-hidden">

//       {/* Header */}
//       <div className="grid h-11 grid-cols-[120px_1fr_120px_120px_140px] items-center border-b border-border px-4 text-[11px] uppercase tracking-wide text-muted-foreground">

//         <div>Status</div>
//         <div>Route</div>
//         <div>Provider</div>
//         <div>Attempts</div>
//         <div>Created</div>
//       </div>

//       {/* Rows */}
//       <div className="flex-1 overflow-y-auto">

//         {events.map((event) => (
//           <EventRow
//             key={event.id}
//             event={event}
//             selected={
//               selectedEvent?.id === event.id
//             }
//             onClick={() =>
//               onSelect(event)
//             }
//           />
//         ))}
//       </div>
//     </div>
//   )
// }



"use client"

import { motion } from "framer-motion"

import type { Event } from "@/types/event"

import { EventRow } from "./event-row"

import {
  useRef,
} from "react"

import {
  useVirtualizer,
} from "@tanstack/react-virtual"

type Props = {
  events: Event[]
  selectedEvent: Event | null
  onSelect: (event: Event) => void
}

export function EventStream({
  events,
  selectedEvent,
  onSelect,
}: Props)
{
  const parentRef =
  useRef<HTMLDivElement>(null)

const virtualizer =
  useVirtualizer({
    count: events.length,
    getScrollElement: () =>
      parentRef.current,
    estimateSize: () => 72,
    overscan: 8,
  })

const items =
  virtualizer.getVirtualItems()
  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* Header */}
      <div className="grid h-12 shrink-0 grid-cols-[120px_1fr_120px_120px_140px] items-center border-b border-border bg-surface-2 px-4 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">

        <div>Status</div>
        <div>Route</div>
        <div>Provider</div>
        <div>Attempts</div>
        <div>Created</div>
      </div>

      {/* Empty */}
      {!events.length && (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Waiting for events...
        </div>
      )}

      {/* Rows */}
      <div
  ref={parentRef}
  className="flex-1 overflow-y-auto"
>

  <div
    style={{
      height:
        virtualizer.getTotalSize(),
      position: "relative",
    }}
  >

    {items.map(
      (virtualRow) => {
        const event =
          events[
            virtualRow.index
          ]

        if (!event)
          return null

        return (
          <div
            key={event.id}
            className="absolute left-0 top-0 w-full"
            style={{
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >

            <motion.div
              initial={{
                opacity: 0,
                y: -6,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.18,
              }}
            >

              <EventRow
                event={event}
                selected={
                  selectedEvent?.id ===
                  event.id
                }
                onClick={() =>
                  onSelect(event)
                }
              />

            </motion.div>

          </div>
        )
      }
    )}
  </div>
</div>
    </div>
  )
}