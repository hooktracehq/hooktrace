"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { StatusBadge } from "@/components/ui/status-badge"

type EventStatus = "pending" | "delivered" | "failed" | "retrying"

type Event = {
  id: number
  status: EventStatus
  attempt_count?: number | null
}

export function EventLiveView({ event }: { event: Event }) {
  const [status, setStatus] = useState<EventStatus>(event.status)
  const [attempt, setAttempt] = useState<number | null>(
    event.attempt_count ?? null
  )

  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

    const wsUrl = `${apiUrl.replace(/^http/, "ws")}/ws/events`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data)

        if (data.event_id !== event.id) return

        if (data.status) setStatus(data.status)
        if ("attempt_count" in data)
          setAttempt(data.attempt_count ?? null)
      } catch {
        // ignore malformed messages
      }
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [event.id])

  // 🔑 Map internal status → UI status
  const badgeStatus =
    status === "retrying" ? "pending" : status

  return (
    <div className="flex items-center gap-3">
      {/* Status badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={badgeStatus}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          <StatusBadge status={badgeStatus} />
        </motion.div>
      </AnimatePresence>

      {/* Attempt counter */}
      {attempt !== null && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground"
        >
          attempt {attempt}
        </motion.span>
      )}

      {/* Live pulse indicator */}
      {(status === "pending" || status === "retrying") && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
        </span>
      )}
    </div>
  )
}
