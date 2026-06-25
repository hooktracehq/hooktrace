"use client"

import { PlugZap } from "lucide-react"

import type { Connection } from "@/types/connection"

type Props = {
  connection: Connection | null
}

export function ConnectionInspector({
  connection,
}: Props) {
  if (!connection) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a provider
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">

      <div className="border-b border-border p-5">

        <div className="flex items-center gap-3">

          <PlugZap className="h-5 w-5 text-orange-400" />

          <div>

            <h2 className="font-semibold">
              Connection Inspector
            </h2>

            <p className="text-sm text-muted-foreground">
              provider details
            </p>

          </div>

        </div>

      </div>

      <div className="space-y-4 p-5 text-sm">

        <Info
          label="Provider"
          value={
            connection.provider
          }
        />

        <Info
          label="Status"
          value={
            connection.status
          }
        />

        <Info
          label="Events"
          value={
            connection.eventsReceived
          }
        />

        <Info
          label="Rate Limit"
          value={
            connection.rateLimitRemaining
          }
        />

        <Info
          label="Last Event"
          value={
            connection.lastSync
          }
        />

      </div>

      <div className="border-t border-border p-5">

        <h3 className="mb-3 font-medium">
          Webhook URL
        </h3>

        <div className="rounded-xl border border-border p-3 text-xs">
          {connection.webhookUrl}
        </div>

      </div>

      <div className="border-t border-border p-5">

        <h3 className="mb-3 font-medium">
          Secret
        </h3>

        <div className="rounded-xl border border-border p-3 text-xs">
          {connection.secret}
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