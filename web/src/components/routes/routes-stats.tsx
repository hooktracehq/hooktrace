"use client"

import type { Route } from "@/types/route"

type Props = {
  routes: Route[]
}

export function RoutesStats({
  routes,
}: Props) {
  const total = routes.length

  const dev = routes.filter(
    (route) => route.mode === "dev"
  ).length

  const production = routes.filter(
    (route) => route.mode === "prod"
  ).length

  const configured = routes.filter(
    (route) =>
      Boolean(
        route.devTarget ||
        route.prodTarget
      )
  ).length

  return (
    <div className="grid grid-cols-4 border-b border-border">
      <Stat
        label="Total Routes"
        value={total}
      />

      <Stat
        label="Development"
        value={dev}
      />

      <Stat
        label="Production"
        value={production}
      />

      <Stat
        label="Configured"
        value={configured}
      />
    </div>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="border-r border-border p-5 last:border-r-0">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <h3 className="mt-2 text-3xl font-semibold">
        {value}
      </h3>
    </div>
  )
}