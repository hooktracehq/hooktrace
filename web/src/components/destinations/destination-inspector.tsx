"use client"

import { Send } from "lucide-react"
import { Destination } from "@/types/destinations"

type Props = {
  destination: Destination | null
}

export function DestinationInspector({
  destination,
}: Props) {
  if (!destination) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a destination
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">

      <div className="border-b border-border p-5">

        <div className="flex items-center gap-3">

          <Send className="h-5 w-5 text-orange-400" />

          <div>

            <h2 className="font-semibold">
              Destination Inspector
            </h2>

            <p className="text-sm text-muted-foreground">
              endpoint details
            </p>

          </div>

        </div>

      </div>

      <div className="space-y-4 p-5 text-sm">

        <Info
          label="Name"
          value={destination.name}
        />

        <Info
          label="Status"
          value={destination.status}
        />

        <Info
          label="Delivered"
          value={destination.delivered}
        />

        <Info
          label="Latency"
          value={destination.latency}
        />

        <Info
          label="Last Seen"
          value={destination.lastSeen}
        />

      </div>

      <div className="border-t border-border p-5">

        <h3 className="mb-3 font-medium">
          Endpoint
        </h3>

        <div className="rounded-xl border border-border p-3 text-xs text-muted-foreground">
          https://api.example.com/webhooks
        </div>

      </div>

    </div>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}