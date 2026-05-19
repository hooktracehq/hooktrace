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

type Props = {
  events: Event[]
  selectedEvent: Event | null
  onSelect: (event: Event) => void
}

export function EventStream({
  events,
  selectedEvent,
  onSelect,
}: Props) {
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
      <div className="flex-1 overflow-y-auto">

        {events.map(
          (event, index) => (
            <motion.div
              key={event.id}
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.18,
                delay:
                  index * 0.015,
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
          )
        )}
      </div>
    </div>
  )
}