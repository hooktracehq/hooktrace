"use client"

import { useEffect } from "react"

import { useQueryClient } from "@tanstack/react-query"

import { QueryKeys } from "@/lib/query-keys"

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ??
  "ws://localhost:3001/ws/events"

export function useTunnelRealtime(
  tunnelId?: string,
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    let disposed = false

    const socket = new WebSocket(
      WS_URL,
    )

    socket.onopen = () => {
      console.log(
        "[TunnelRealtime] Connected",
      )
    }

    socket.onmessage = (
      event,
    ) => {
      try {
        const message = JSON.parse(
          event.data,
        )

        if (
          !message.type?.startsWith(
            "tunnel.",
          )
        ) {
          return
        }

        switch (message.type) {
          case "tunnel.created":
          case "tunnel.updated":
          case "tunnel.deleted":
          case "tunnel.connected":
          case "tunnel.disconnected":
          case "tunnel.request":
            queryClient.invalidateQueries({
              queryKey:
                QueryKeys.tunnels,
            })

            if (
              tunnelId &&
              message.id === tunnelId
            ) {
              queryClient.invalidateQueries({
                queryKey:
                  QueryKeys.tunnel(
                    tunnelId,
                  ),
              })

              queryClient.invalidateQueries({
                queryKey:
                  QueryKeys.tunnelLogs(
                    tunnelId,
                  ),
              })

              queryClient.invalidateQueries({
                queryKey:
                  QueryKeys.tunnelStats(
                    tunnelId,
                  ),
              })
            }

            break

          default:
            break
        }
      } catch (err) {
        console.error(
          "[TunnelRealtime] Failed to parse message",
          err,
        )
      }
    }

    socket.onerror = () => {
      if (!disposed) {
        console.error(
          "[TunnelRealtime] WebSocket error",
        )
      }
    }

    socket.onclose = (
      event,
    ) => {
      if (!disposed) {
        console.log(
          "[TunnelRealtime] Closed",
          {
            code: event.code,
            reason: event.reason,
            wasClean:
              event.wasClean,
          },
        )
      }
    }

    return () => {
      disposed = true
      socket.close()
    }
  }, [
    queryClient,
    tunnelId,
  ])
}