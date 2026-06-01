"use client"

import { Route } from "@/types/route"

type Props = {
  routes: Route[]
}

export function RoutesStats({
  routes,
}: Props) {
  const active =
    routes.filter(
      (r) => r.status === "active"
    ).length

  const paused =
    routes.filter(
      (r) => r.status === "paused"
    ).length

  const errors =
    routes.filter(
      (r) => r.status === "error"
    ).length

  return (
    <div className="grid grid-cols-4 border-b border-border">

      <Stat
        label="Total Routes"
        value={routes.length}
      />

      <Stat
        label="Active"
        value={active}
      />

      <Stat
        label="Paused"
        value={paused}
      />

      <Stat
        label="Errors"
        value={errors}
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

      <h3 className="mt-2 text-4xl font-bold">
        {value}
      </h3>
    </div>
  )
}