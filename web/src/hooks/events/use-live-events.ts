"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

import type { Event } from "@/types/event"
import type { EventsResponse } from "@/lib/services/events"

export function useLiveEvents() {
  const queryClient =
    useQueryClient()

  useEffect(() => {
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/ws/events`
    )

    ws.onopen = () => {
      console.log(
        "🟢 Events websocket connected"
      )
    }

    ws.onmessage = (message) => {
      const event: Event = JSON.parse(
        message.data
      )

      queryClient.setQueryData(
        ["events"],
        (
          old:
            | EventsResponse
            | undefined
        ) => {
          if (!old) {
            return {
              items: [event],
              limit: 50,
              offset: 0,
            }
          }

          return {
            ...old,
            items: [
              event,
              ...old.items,
            ],
          }
        }
      )
    }

    ws.onclose = () => {
      console.log(
        "🔴 Events websocket disconnected"
      )
    }

    return () => {
      ws.close()
    }
  }, [queryClient])
}