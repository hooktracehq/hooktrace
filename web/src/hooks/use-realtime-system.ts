"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { useRealtimeStore } from "@/app/stores/realtime-store"
import { useEventsStore } from "@/app/stores/events-store"
import { useNotificationsStore } from "@/app/stores/notifications-store"

import type { Event } from "@/types/event"
import type { EventsResponse } from "@/lib/services/events"

export function useRealtimeSystem() {
  const queryClient = useQueryClient()

  // -------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------

  const addNotification =
    useNotificationsStore(
      (state) => state.addNotification
    )

  // -------------------------------------------------
  // REALTIME STORE
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
  // EVENTS STORE
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
  // WEBSOCKET
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
      // BUILD WEBSOCKET URL
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

      console.log(
        "[Realtime] Connecting:",
        websocketUrl
      )

      ws = new WebSocket(
        websocketUrl
      )

      const started =
        performance.now()

      // -------------------------------------------------
      // CONNECTED
      // -------------------------------------------------

      ws.onopen = () => {
        console.log(
          "[Realtime] Connected"
        )

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
      // EVENT RECEIVED
      // -------------------------------------------------

      ws.onmessage = (message) => {
        try {
          const data: Event =
            JSON.parse(
              message.data
            )

          console.log(
            "[Realtime] Event received:",
            data
          )

          // -------------------------------------------------
          // STORE EVENT
          // -------------------------------------------------

          addEvent(data)

          // -------------------------------------------------
          // UPDATE EVENTS QUERY CACHE
          // -------------------------------------------------

          queryClient.setQueryData<EventsResponse>(
            ["events", {}],
            (old) => {
              if (!old) {
                return {
                  items: [data],
                  limit: 50,
                  offset: 0,
                }
              }

              const existingIndex =
                old.items.findIndex(
                  (item) =>
                    item.id === data.id
                )

              // -------------------------------------------------
              // NEW EVENT
              // -------------------------------------------------

              if (
                existingIndex === -1
              ) {
                return {
                  ...old,

                  items: [
                    data,
                    ...old.items,
                  ].slice(0, 50),
                }
              }

              // -------------------------------------------------
              // EXISTING EVENT
              // -------------------------------------------------

              const items = [
                ...old.items,
              ]

              items[
                existingIndex
              ] = {
                ...items[
                  existingIndex
                ],
                ...data,
              }

              return {
                ...old,
                items,
              }
            }
          )

          // -------------------------------------------------
          // ACTIVITY
          // -------------------------------------------------

          addActivity({
            id: crypto.randomUUID(),

            level:
              data.status === "dlq"
                ? "error"
                : data.status ===
                    "retrying"
                  ? "warning"
                  : "info",

            message:
              `${data.provider ?? "webhook"} ` +
              `${data.event_type ?? "event"} ` +
              `→ ${data.status}`,

            timestamp:
              new Date().toISOString(),
          })

          // -------------------------------------------------
          // NOTIFICATION DATA
          // -------------------------------------------------

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

          // -------------------------------------------------
          // RETRYING
          // -------------------------------------------------

          if (
            data.status ===
            "retrying"
          ) {
            const notificationId =
              `retrying-${eventId}`

            const notificationAdded =
              addNotification({
                id: notificationId,

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

            // Only show the toast when a new
            // notification was actually created.
            if (notificationAdded) {
              console.log(
                "[Realtime] New retry notification:",
                notificationId
              )

              toast.warning(
                "Webhook delivery retrying",
                {
                  id: notificationId,

                  description:
                    `${provider} ` +
                    `${eventType} failed ` +
                    "and will be retried",
                }
              )
            } else {
              console.log(
                "[Realtime] Duplicate retry notification ignored:",
                notificationId
              )
            }

            return
          }

          // -------------------------------------------------
          // DLQ
          // -------------------------------------------------

          if (
            data.status ===
            "dlq"
          ) {
            const notificationId =
              `dlq-${eventId}`

            const notificationAdded =
              addNotification({
                id: notificationId,

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

            // Only show the toast when a new
            // notification was actually created.
            if (notificationAdded) {
              console.log(
                "[Realtime] New DLQ notification:",
                notificationId
              )

              toast.error(
                "Event moved to DLQ",
                {
                  id: notificationId,

                  description:
                    `${provider} ` +
                    `${eventType} was moved ` +
                    "to the dead letter queue",
                }
              )
            } else {
              console.log(
                "[Realtime] Duplicate DLQ notification ignored:",
                notificationId
              )
            }

            return
          }
        } catch (error) {
          console.error(
            "[Realtime] Invalid websocket payload:",
            error
          )
        }
      }

      // -------------------------------------------------
      // DISCONNECTED
      // -------------------------------------------------

      ws.onclose = (event) => {
        if (
          intentionallyClosed
        ) {
          return
        }

        console.warn(
          "[Realtime] Disconnected",
          {
            code: event.code,

            reason:
              event.reason ||
              "no reason provided",

            wasClean:
              event.wasClean,
          }
        )

        setConnected(false)

        setEventsConnected(false)

        setReconnecting(true)

        toast.error(
          "Realtime disconnected",
          {
            id:
              "realtime-disconnected",
          }
        )

        addActivity({
          id: crypto.randomUUID(),

          level: "warning",

          message:
            "connection lost",

          timestamp:
            new Date().toISOString(),
        })

        if (reconnectTimeout) {
          clearTimeout(
            reconnectTimeout
          )
        }

        reconnectTimeout =
          setTimeout(
            () => {
              if (
                !intentionallyClosed
              ) {
                connect()
              }
            },
            3000
          )
      }

      // -------------------------------------------------
      // ERROR
      // -------------------------------------------------

      ws.onerror = () => {
        console.warn(
          "[Realtime] WebSocket transport error"
        )
      }
    }

    // -------------------------------------------------
    // INITIAL CONNECTION
    // -------------------------------------------------

    connect()

    // -------------------------------------------------
    // CLEANUP
    // -------------------------------------------------

    return () => {
      intentionallyClosed = true

      if (reconnectTimeout) {
        clearTimeout(
          reconnectTimeout
        )
      }

      ws?.close()

      ws = null
    }
  }, [
    queryClient,
    addActivity,
    addEvent,
    addNotification,
    setConnected,
    setEventsConnected,
    setLatency,
    setReconnecting,
  ])
}