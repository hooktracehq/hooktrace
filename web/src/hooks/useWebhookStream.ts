import { useEffect, useState } from "react"

import { WebhookEvent } from "@/lib/constants/events"


// export function useWebhookStream(token: string) {
//   const [events, setEvents] = useState<WebhookEvent[]>([])

//   useEffect(() => {
//     const ws = new WebSocket(`ws://localhost:8000/ws/${token}`)

//     ws.onmessage = (event) => {
//       const data: WebhookEvent = JSON.parse(event.data)

//       setEvents((prev) => [data, ...prev])
//     }

//     return () => ws.close()
//   }, [token])

//   return events
// }





export function useWebhookStream(path: string) {
  const [events, setEvents] = useState<WebhookEvent[]>([])

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000${path}`)

    ws.onmessage = (event) => {
      const data: WebhookEvent = JSON.parse(event.data)
      setEvents((prev) => [data, ...prev])
    }

    return () => ws.close()
  }, [path])

  return events
}