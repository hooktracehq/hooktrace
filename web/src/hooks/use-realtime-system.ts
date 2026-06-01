"use client"

import { useEffect } from "react"

import { toast } from "sonner"

import { useRealtimeStore } from "@/app/stores/realtime-store"
import { useEventsStore } from "@/app/stores/events-store"

import type { Event } from "@/types/event"

export function useRealtimeSystem() {

  // Realtime Store
  const setConnected =
    useRealtimeStore(
      (s) => s.setConnected
    )

  const setLatency =
    useRealtimeStore(
      (s) => s.setLatency
    )

  const setReconnecting =
    useRealtimeStore(
      (s) => s.setReconnecting
    )

  const addActivity =
    useRealtimeStore(
      (s) => s.addActivity
    )

  // Events Store
  const addEvent =
    useEventsStore(
      (s) => s.addEvent
    )

  const setEventsConnected =
    useEventsStore(
      (s) => s.setConnected
    )

  useEffect(() => {

    let ws: WebSocket | null =
      null

    let reconnectTimeout:
      | NodeJS.Timeout
      | undefined

    let intentionallyClosed =
      false

    function connect() {

      setReconnecting(true)

      ws = new WebSocket(
        "ws://localhost:3001/ws/events"
      )

      const started =
        performance.now()

      ws.onopen = () => {

        setConnected(true)
        setEventsConnected(true)

        setReconnecting(false)

        setLatency(
          Math.floor(
            performance.now() -
            started
          )
        )

        addActivity({
          id: crypto.randomUUID(),
          level: "info",
          message:
            "realtime active",
          timestamp:
            new Date().toISOString(),
        })
      }

      ws.onmessage = (
        message
      ) => {

        try {

          const data: Event =
            JSON.parse(
              message.data
            )

          // Event Stream
          addEvent(data)

          // Activity Feed
          addActivity({
            id: crypto.randomUUID(),

            level:
              data.status ===
              "failed"
                ? "error"
                : "info",

            message:
              `${data.provider} ${data.event_type}`,

            timestamp:
              new Date().toISOString(),
          })

        } catch {

          console.error(
            "Invalid websocket payload"
          )

        }
      }

      ws.onclose = () => {

        if (
          intentionallyClosed
        ) {
          return
        }

        setConnected(false)
        setEventsConnected(false)

        setReconnecting(true)

        toast.error(
          "Realtime disconnected"
        )

        addActivity({
          id: crypto.randomUUID(),
          level: "warning",
          message:
            "connection lost",
          timestamp:
            new Date().toISOString(),
        })

        reconnectTimeout =
          setTimeout(
            connect,
            3000
          )
      }

      ws.onerror = () => {

        if (
          process.env.NODE_ENV ===
          "production"
        ) {
          console.error(
            "WebSocket error"
          )
        }

      }
    }

    connect()

    return () => {

      intentionallyClosed =
        true

      ws?.close()

      if (
        reconnectTimeout
      ) {
        clearTimeout(
          reconnectTimeout
        )
      }
    }

  }, [
    addActivity,
    addEvent,
    setConnected,
    setEventsConnected,
    setLatency,
    setReconnecting,
  ])
}