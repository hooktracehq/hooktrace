"use client"

import { useEffect } from "react"

import { toast } from "sonner"

import { useRealtimeStore } from "@/stores/realtime-store"

export function useRealtimeSystem() {
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

  useEffect(() => {
    let ws: WebSocket | null =
      null

    let reconnectTimeout:
      | NodeJS.Timeout
      | undefined

    function connect() {
      setReconnecting(true)

      ws = new WebSocket(
        "ws://localhost:3001/ws/events"
      )

      const started =
        performance.now()

      ws.onopen = () => {
        setConnected(true)

        setReconnecting(false)

        setLatency(
          Math.floor(
            performance.now() -
              started
          )
        )

        toast.success(
          "Realtime connected"
        )

        addActivity({
          id: crypto.randomUUID(),
          level: "success",
          message:
            "websocket connected",
          timestamp:
            new Date().toISOString(),
        })
      }

      ws.onmessage = (
        event
      ) => {
        try {
          const data =
            JSON.parse(
              event.data
            )

          addActivity({
            id: crypto.randomUUID(),
            level:
              data.status ===
              "failed"
                ? "error"
                : "info",

            message: `${data.provider} ${data.event_type}`,

            timestamp:
              new Date().toISOString(),
          })
        } catch {}
      }

      ws.onclose = () => {
        setConnected(false)

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
    }

    connect()

    return () => {
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
    setConnected,
    setLatency,
    setReconnecting,
  ])
}