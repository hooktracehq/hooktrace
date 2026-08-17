"use client"

import { useEffect } from "react"

type EventUpdate = {
  event_id: number
  status: string
  attempt_count: number
}

export function useEventUpdates(
  eventId: number,
  onUpdate: (update: EventUpdate) => void
) {
  useEffect(() => {
    if (!eventId) return

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001"

    const url = new URL(apiUrl)

    const protocol =
      url.protocol === "https:"
        ? "wss:"
        : "ws:"

    const ws = new WebSocket(
      `${protocol}//${url.host}/ws/stream`
    )

    ws.onmessage = (message) => {
      try {
        const data = JSON.parse(
          message.data
        )

        const incomingEventId =
          data.event_id ?? data.id

        if (
          Number(incomingEventId) ===
          Number(eventId)
        ) {
          onUpdate({
            event_id: Number(
              incomingEventId
            ),
            status: data.status,
            attempt_count:
              data.attempt_count ?? 0,
          })
        }
      } catch {
        console.error(
          "Invalid websocket payload"
        )
      }
    }

    return () => {
      ws.close()
    }
  }, [eventId, onUpdate])
}