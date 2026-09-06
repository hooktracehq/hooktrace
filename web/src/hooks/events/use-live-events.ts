// "use client"

// import { useEffect } from "react"
// import { useQueryClient } from "@tanstack/react-query"

// import type { Event } from "@/types/event"
// import type { EventsResponse } from "@/lib/services/events"

// export function useLiveEvents() {
//   const queryClient = useQueryClient()

//   useEffect(() => {
//     const apiUrl =
//       process.env.NEXT_PUBLIC_API_URL ||
//       "http://localhost:3001"

//     const url = new URL(apiUrl)

//     const protocol =
//       url.protocol === "https:" ? "wss:" : "ws:"

//     const ws = new WebSocket(
//       `${protocol}//${url.host}/ws/stream`
//     )

//     ws.onopen = () => {
//       console.log(
//         "🟢 Events realtime websocket connected"
//       )
//     }

//     ws.onmessage = (message) => {
//       try {
//         const event: Event = JSON.parse(
//           message.data
//         )

//         queryClient.setQueryData<EventsResponse>(
//           ["events"],
//           (old) => {
//             if (!old) {
//               return {
//                 items: [event],
//                 limit: 50,
//                 offset: 0,
//               }
//             }

//             const existingIndex =
//               old.items.findIndex(
//                 (item) => item.id === event.id
//               )

//             // New event
//             if (existingIndex === -1) {
//               return {
//                 ...old,
//                 items: [
//                   event,
//                   ...old.items,
//                 ],
//               }
//             }

//             // Existing event status/update
//             const items = [...old.items]

//             items[existingIndex] = {
//               ...items[existingIndex],
//               ...event,
//             }

//             return {
//               ...old,
//               items,
//             }
//           }
//         )
//       } catch (error) {
//         console.error(
//           "Invalid realtime event payload:",
//           error
//         )
//       }
//     }

//     ws.onclose = () => {
//       console.log(
//         "🔴 Events realtime websocket disconnected"
//       )
//     }

//     ws.onerror = (error) => {
//       console.error(
//         "Events realtime websocket error:",
//         error
//       )
//     }

//     return () => {
//       ws.close()
//     }
//   }, [queryClient])
// }





"use client"

export function useLiveEvents() {
  // Realtime events are handled by the global
  // useRealtimeSystem() connection.
  //
  // This hook remains as a compatibility hook
  // for EventsWorkspaceClient.
}