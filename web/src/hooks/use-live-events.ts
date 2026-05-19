"use client"

import { useEffect } from "react"

import { useEventsStore } from "@/app/stores/events-store"

import type { Event } from "@/types/event"

export function useLiveEvents() {
  const addEvent =
    useEventsStore(
      (s) => s.addEvent
    )

  const setConnected =
    useEventsStore(
      (s) => s.setConnected
    )

  useEffect(() => {
    const ws =
      new WebSocket(
        "ws://localhost:3001/ws/events"
      )

    ws.onopen = () => {
      setConnected(true)
    }

    ws.onclose = () => {
      setConnected(false)
    }

    ws.onerror = () => {
      setConnected(false)
    }

    ws.onmessage = (
      message
    ) => {
      try {
        const event: Event =
          JSON.parse(
            message.data
          )

        addEvent(event)
      } catch {}
    }

    return () => {
      ws.close()
    }
  }, [addEvent, setConnected])
}