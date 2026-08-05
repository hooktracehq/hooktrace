"use client"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

type Props = {
  provider: string
  route: string
  status:
    | "pending"
    | "processing"
    | "retrying"
    | "delivered"
    | "failed"
    | "dlq"

  latency: number
  timestamp: Date
  eventType: string
  selected?: boolean
  onClick?: () => void
}

function latencyColor(latency: number) {
  if (latency < 60) {
    return "text-emerald-400"
  }

  if (latency < 120) {
    return "text-amber-400"
  }

  return "text-rose-400"
}

function statusClasses(status: Props["status"]) {
  switch (status) {
    case "delivered":
      return "bg-emerald-500/10 text-emerald-400"

    case "processing":
      return "bg-amber-500/10 text-amber-400"

    case "retrying":
      return "bg-yellow-500/10 text-yellow-400"

    case "pending":
      return "bg-blue-500/10 text-blue-400"

    case "failed":
      return "bg-rose-500/10 text-rose-400"

    case "dlq":
      return "bg-purple-500/10 text-purple-400"

    default:
      return "bg-muted text-muted-foreground"
  }
}

export function StreamRow({
  provider,
  route,
  status,
  latency,
  timestamp,
  eventType,
  selected,
  onClick,
}: Props) {
  return (
    <motion.button
      layout
      initial={{
        opacity: 0,
        y: -18,
        backgroundColor: "rgba(249,115,22,0.18)",
      }}
      animate={{
        opacity: 1,
        y: 0,
        backgroundColor: "transparent",
      }}
      transition={{
        duration: 0.35,
      }}
      onClick={onClick}
      className={cn(
        `
          grid
          grid-cols-[120px_1fr_180px_120px_120px_140px]
          items-center
          border-b border-border
          px-5 py-3
          text-sm
          transition-colors
          hover:bg-white/[0.03]
        `,
        selected && "bg-white/[0.04]"
      )}
    >
      {/* Provider */}
      <div>
        <span
          className="
            rounded-full
            border border-border
            bg-background/30
            px-2 py-1
            text-xs
            uppercase
          "
        >
          {provider}
        </span>
      </div>

      {/* Route */}
      <div className="truncate font-medium">
        {route}
      </div>

      {/* Event Type */}
      <div className="truncate text-muted-foreground">
        {eventType}
      </div>

      {/* Status */}
      <div>
        <motion.span
          layout
          animate={{
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 0.3,
          }}
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium",
            statusClasses(status)
          )}
        >
          {status}
        </motion.span>
      </div>

      {/* Latency */}
      <div
        className={cn(
          "font-medium",
          latencyColor(latency)
        )}
      >
        {latency} ms
      </div>

      {/* Time */}
      <div className="text-muted-foreground">
        {timestamp.toLocaleTimeString()}
      </div>
    </motion.button>
  )
}