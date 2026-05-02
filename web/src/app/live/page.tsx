"use client"

import { motion } from "framer-motion"
import { Activity, CheckCircle2, XCircle, Clock } from "lucide-react"
import { WebhookEvent } from "@/lib/constants/events"

import { useWebhookStream } from "@/hooks/useWebhookStream"



export default function LivePage() {
  const events = useWebhookStream("/ws/events")

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">

        {/* Header */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Live Webhook Stream</h1>
            <p className="text-muted-foreground">
              Real-time webhook delivery events
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
            Listening
          </div>
        </div>

        {/* Stream */}

        <div className="rounded-xl border border-border bg-card p-4">

          {events.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10">
              Waiting for webhook events...
            </p>
          )}

          <div className="space-y-3">

            {events.map((event: WebhookEvent) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >

                <div className="flex items-center gap-3">

                  {event.status === "delivered" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}

                  {event.status === "failed" && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}

                  {event.status === "pending" && (
                    <Clock className="h-4 w-4 text-amber-500" />
                  )}

                  <div>
                    <p className="text-sm font-medium">
                      Event #{event.id}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {event.provider ?? "webhooks"}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-muted-foreground">
                  {new Date(event.created_at).toLocaleTimeString()}
                </span>

              </motion.div>
            ))}

          </div>
        </div>
      </div>
    </div>
  )
}