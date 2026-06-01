"use client"

import { Route } from "@/types/route"
import { RouteRow } from "./route-row"

type Props = {
  routes: Route[]
  selected: Route | null
  onSelect: (route: Route) => void
}

export function RoutesStream({
  routes,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="h-full overflow-auto">

      <div
        className="
          grid
          grid-cols-[120px_1fr_120px_120px_120px_120px_140px]
          border-b border-border
          px-5 py-4
          text-xs uppercase
          text-muted-foreground
        "
      >
        <div>Provider</div>
        <div>Route</div>
        <div>Status</div>
        <div>Throughput</div>
        <div>Failures</div>
        <div>Destinations</div>
        <div>Last Seen</div>
      </div>

      {routes.map((route) => (
        <RouteRow
          key={route.id}
          route={route}
          selected={
            selected?.id ===
            route.id
          }
          onClick={() =>
            onSelect(route)
          }
        />
      ))}
    </div>
  )
}