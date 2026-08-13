

"use client"

import { motion, type Variants } from "framer-motion"
import { Hash, Route, Repeat } from "lucide-react"
import { StatusBadge } from "./status-badge"

type Event = {
  id: number
  route: string
  provider: string | null
  status: "pending" | "delivered" | "failed"
  attempt_count: number
  created_at: string
}

/* ---------------- Motion ---------------- */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
}

/* ---------------- Component ---------------- */

export function EventHeader({ event }: { event: Event }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      {/* Left */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-xl font-semibold">
            Event #{event.id}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Route className="h-3.5 w-3.5" />
            {event.route}
          </span>

          <span className="inline-flex items-center gap-1">
            Provider:
            <span className="font-medium text-foreground">
              {event.provider ?? "generic"}
            </span>
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <StatusBadge status={event.status} />

        <div className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-sm text-muted-foreground">
          <Repeat className="h-3.5 w-3.5" />
          Attempts
          <span className="font-medium text-foreground">
            {event.attempt_count}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
