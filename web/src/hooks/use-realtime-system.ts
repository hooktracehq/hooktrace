"use client"

import { useEffect } from "react"
import { toast } from "sonner"

import { useRealtimeStore } from "@/app/stores/realtime-store"
import { useEventsStore } from "@/app/stores/events-store"
import { useNotificationsStore } from "@/app/stores/notifications-store"

import type { Event } from "@/types/event"

export function useRealtimeSystem() {
  // -------------------------------------------------
  // Notification Store
  // -------------------------------------------------

  const addNotification =
    useNotificationsStore(
      (state) => state.addNotification
    )

  // -------------------------------------------------
  // Realtime Store
  // -------------------------------------------------

  const setConnected =
    useRealtimeStore(
      (state) => state.setConnected
    )

  const setLatency =
    useRealtimeStore(
      (state) => state.setLatency
    )

  const setReconnecting =
    useRealtimeStore(
      (state) => state.setReconnecting
    )

  const addActivity =
    useRealtimeStore(
      (state) => state.addActivity
    )

  // -------------------------------------------------
  // Events Store
  // -------------------------------------------------

  const addEvent =
    useEventsStore(
      (state) => state.addEvent
    )

  const setEventsConnected =
    useEventsStore(
      (state) => state.setConnected
    )

  // -------------------------------------------------
  // WebSocket
  // -------------------------------------------------

  useEffect(() => {
    let ws: WebSocket | null = null

    let reconnectTimeout:
      | NodeJS.Timeout
      | undefined

    let intentionallyClosed = false

    function connect() {
      if (intentionallyClosed) {
        return
      }

      setReconnecting(true)

      // -------------------------------------------------
      // Build WebSocket URL
      // -------------------------------------------------

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:3001"

      const url = new URL(apiUrl)

      const protocol =
        url.protocol === "https:"
          ? "wss:"
          : "ws:"

      const websocketUrl =
        `${protocol}//${url.host}/ws/stream`

      ws = new WebSocket(
        websocketUrl
      )

      const started =
        performance.now()

      // -------------------------------------------------
      // Connected
      // -------------------------------------------------

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

      // -------------------------------------------------
      // Event received
      // -------------------------------------------------

      ws.onmessage = (message) => {
        try {
          const data: Event =
            JSON.parse(
              message.data
            )

          // ---------------------------------------------
          // Store event
          // ---------------------------------------------

          addEvent(data)

          // ---------------------------------------------
          // Activity feed
          // ---------------------------------------------

          addActivity({
            id: crypto.randomUUID(),

            level:
              data.status === "dlq"
                ? "error"
                : data.status === "retrying"
                  ? "warning"
                  : "info",

            message:
              `${data.provider ?? "webhook"} ` +
              `${data.event_type ?? "event"} ` +
              `→ ${data.status}`,

            timestamp:
              new Date().toISOString(),
          })

          // ---------------------------------------------
          // Notification data
          // ---------------------------------------------

          const eventId =
            data.id

          const timestamp =
            data.created_at ??
            new Date().toISOString()

          const provider =
            data.provider ??
            "Webhook"

          const eventType =
            data.event_type ??
            "event"

          // ---------------------------------------------
          // RETRYING
          // ---------------------------------------------

          if (
            data.status ===
            "retrying"
          ) {
            addNotification({
              id: crypto.randomUUID(),

              eventId,

              title:
                "Webhook delivery retrying",

              message:
                `${provider} ` +
                `${eventType} failed ` +
                "and will be retried",

              level: "warning",

              read: false,

              timestamp,
            })

            return
          }

          // ---------------------------------------------
          // DLQ
          // ---------------------------------------------

          if (
            data.status === "dlq"
          ) {
            addNotification({
              id: crypto.randomUUID(),

              eventId,

              title:
                "Event moved to DLQ",

              message:
                `${provider} ` +
                `${eventType} was moved ` +
                "to the dead letter queue",

              level: "error",

              read: false,

              timestamp,
            })

            return
          }
        } catch (error) {
          console.error(
            "Invalid websocket payload:",
            error
          )
        }
      }

      // -------------------------------------------------
      // Disconnected
      // -------------------------------------------------

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
            () => {
              connect()
            },
            3000
          )
      }

      // -------------------------------------------------
      // Error
      // -------------------------------------------------

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

    // -------------------------------------------------
    // Initial connection
    // -------------------------------------------------

    connect()

    // -------------------------------------------------
    // Cleanup
    // -------------------------------------------------

    return () => {
      intentionallyClosed = true

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
    addNotification,
    setConnected,
    setEventsConnected,
    setLatency,
    setReconnecting,
  ])
}