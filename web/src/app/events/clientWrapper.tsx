// "use client"

// import { useEffect, useState } from "react"
// import { useQueryClient } from "@tanstack/react-query"

// import { EventsTable } from "@/components/events/event-table"

// import { useEvents } from "@/hooks/use-events"

// import type { Event } from "@/types/event"
// import type { EventsResponse } from "@/lib/services/events"

// type Props = {
//   initialEvents: Event[]
//   status?: string
// }

// export function EventsLiveWrapper({
//   initialEvents,
//   status,
// }: Props) {
//   const queryClient = useQueryClient()

//   const { data } = useEvents(
//     status
//       ? { status }
//       : undefined
//   )

//   const events =
//     data?.items ??
//     initialEvents

//   const [newIds, setNewIds] =
//     useState<Set<number>>(
//       new Set()
//     )

//   useEffect(() => {
//     if (status) return

//     const ws = new WebSocket(
//       `${process.env.NEXT_PUBLIC_WS_URL}/ws/events`
//     )

//     ws.onmessage = (message) => {
//       const event: Event = JSON.parse(
//         message.data
//       )

//       queryClient.setQueryData(
//         ["events"],
//         (old: EventsResponse | undefined) => {
//           if (!old) {
//             return {
//               items: [event],
//             }
//           }

//           return {
//             ...old,
//             items: [
//               event,
//               ...old.items,
//             ],
//           }
//         }
//       )

//       setNewIds((prev) => {
//         const next = new Set(prev)
//         next.add(event.id)
//         return next
//       })

//       setTimeout(() => {
//         setNewIds((prev) => {
//           const next = new Set(prev)
//           next.delete(event.id)
//           return next
//         })
//       }, 2000)
//     }

//     return () => ws.close()
//   }, [queryClient, status])

//   return (
//     <EventsTable
//       events={events}
//       newIds={newIds}
//     />
//   )
// }