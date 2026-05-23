"use client"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

type Props = {
  provider: string
  route: string
  status: string
  latency: string
  timestamp: string
  eventType: string
  selected?: boolean
  onClick?: () => void
}

function latencyColor(latency: string) {
  const value =
    Number(latency.replace("ms", ""))

  if (value < 60)
    return "text-emerald-400"

  if (value < 120)
    return "text-amber-400"

  return "text-rose-400"
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
      initial={{
        backgroundColor:
          "rgba(249,115,22,0.12)",
      }}
      animate={{
        backgroundColor:
          "rgba(0,0,0,0)",
      }}
      transition={{
        duration: 1.2,
      }}
      onClick={onClick}
      className={cn(
        `
          grid
          grid-cols-[120px_1fr_180px_120px_120px_140px]
          items-center
          border-b border-border
          px-5 py-3 text-sm
          transition-colors
          hover:bg-white/[0.02]
        `,
        selected &&
          "bg-white/[0.03]"
      )}
    >

      {/* Provider */}
      <div>

        <span
          className="
            rounded-full border border-border
            bg-background/30
            px-2 py-1 text-xs uppercase
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

        <span
          className={`
            rounded-full px-2 py-1 text-xs font-medium
            ${
              status === "success"
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-rose-500/10 text-rose-400"
            }
          `}
        >
          {status}
        </span>

      </div>

      {/* Latency */}
      <div
        className={cn(
          "font-medium",
          latencyColor(latency)
        )}
      >
        {latency}
      </div>

      {/* Time */}
      <div className="text-muted-foreground">
        {timestamp}
      </div>

    </motion.button>
  )
}