"use client"

import type { Route } from "@/types/route"

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
  if (routes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No routes match your search.
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <div
        className="
          grid
          min-w-[920px]
          grid-cols-[120px_minmax(180px,1fr)_100px_100px_100px_100px_140px]
          border-b border-border
          px-5 py-4
          text-[10px] uppercase tracking-wider
          text-muted-foreground
        "
      >
        <div>Provider</div>
        <div>Endpoint / Route</div>
        <div>Status</div>
        <div>Throughput</div>
        <div>Failures</div>
        <div>Targets</div>
        <div>Last Seen</div>
      </div>

      {routes.map((route) => (
        <RouteRow
          key={route.id}
          route={route}
          selected={
            selected?.id === route.id
          }
          onClick={() =>
            onSelect(route)
          }
        />
      ))}
    </div>
  )
}