
"use client"

import { useState } from "react"
import { ReplayButton } from "@/components/events/replay-button"
import { StatusBadge } from "@/components/ui/status-badge"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle } from "lucide-react"

type WebhookEvent = {
  id: number
  route: string
  provider?: string
  attempt_count?: number | null
  last_error?: string | null
  created_at?: string
}

export default function DLQClient({
  initialEvents,
}: {
  initialEvents: WebhookEvent[]
}) {
  const [events] = useState(initialEvents)

  //  group by route
  const grouped = events.reduce<Record<string, WebhookEvent[]>>(
    (acc, event) => {
      const key = event.route || "unknown"
      if (!acc[key]) acc[key] = []
      acc[key].push(event)
      return acc
    },
    {}
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/*  Header (consistent with Events page) */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Dead Letter Queue</h1>
            <p className="text-sm text-muted-foreground">
              Failed webhooks that exhausted all retry attempts
            </p>
          </div>
        </div>

        {/*  Alert banner (matches Events page style) */}
        {events.length > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                {events.length} events require attention
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                These events failed all retries and need manual replay
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {events.length === 0 && (
          <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
            🎉 No events in DLQ — everything is running smoothly
          </div>
        )}

        {/*  Groups */}
        {Object.entries(grouped).map(([route, items]) => (
          <div key={route} className="space-y-2">

            {/* Group header */}
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2">
              {route}
            </div>

            <div className="rounded-xl border bg-card divide-y overflow-hidden">

              <AnimatePresence>
                {items.map((event) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-4 group hover:bg-muted/40 transition relative border-l-2 border-orange-500/40"
                  >

                    {/* pulse indicator */}
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />

                    {/* LEFT */}
                    <div className="flex flex-col gap-1 pl-3">

                      <div className="flex items-center gap-3">

                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          #{event.id}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          {event.provider || "Generic"}
                        </span>

                        {/*  Consistent status badge */}
                        <StatusBadge status="failed" />

                      </div>

                      <div className="text-xs text-muted-foreground flex gap-4">
                        <span>Attempts: {event.attempt_count ?? 0}</span>

                        {event.created_at && (
                          <span>
                            {new Date(event.created_at).toLocaleTimeString()}
                          </span>
                        )}
                      </div>

                      {event.last_error && (
                        <div className="text-xs text-red-500 truncate max-w-[420px]">
                          {event.last_error}
                        </div>
                      )}

                    </div>

                    {/* RIGHT */}
                    <div className="opacity-80 group-hover:opacity-100 transition">
                      <ReplayButton eventId={event.id} />
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>

            </div>
          </div>
        ))}

      </div>
    </div>
  )
}