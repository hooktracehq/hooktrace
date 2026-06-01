"use client"

import { Route } from "@/types/route"
import { Route as RouteIcon } from "lucide-react"
type Props = {
  route: Route | null
}

export function RouteInspector({
  route,
}: Props) {
  if (!route) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a route
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">

      <div className="border-b border-border p-5">

        <div className="flex items-center gap-3">

          <RouteIcon className="h-5 w-5 text-orange-400" />

          <div>
            <h2 className="font-semibold">
              Route Inspector
            </h2>

            <p className="text-sm text-muted-foreground">
              route details
            </p>
          </div>

        </div>

      </div>

      <div className="space-y-4 p-5 text-sm">

        <Info
          label="Provider"
          value={route.provider}
        />

        <Info
          label="Status"
          value={route.status}
        />

        <Info
          label="Throughput"
          value={`${route.throughput}/m`}
        />

        <Info
          label="Failures"
          value={route.failures}
        />

        <Info
          label="Destinations"
          value={route.destinations}
        />

      </div>

      <div className="border-t border-border p-5">

        <h3 className="mb-3 font-medium">
          Destinations
        </h3>

        <div className="space-y-2 text-sm">
          <div>production-api</div>
          <div>analytics-worker</div>
          <div>audit-logger</div>
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