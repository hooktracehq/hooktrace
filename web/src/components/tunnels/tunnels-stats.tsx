"use client"

import {
  Activity,
  Cable,
  Clock3,
  TriangleAlert,
} from "lucide-react"

import type { Tunnel } from "@/types/tunnel"

type Props = {
  tunnels: Tunnel[]
}

export function TunnelsStats({
  tunnels,
}: Props) {

  const active =
    tunnels.filter(
      (t) => t.status === "active",
    ).length

  const totalRequests =
    tunnels.reduce(
      (sum, tunnel) =>
        sum + tunnel.requestCount,
      0,
    )

  const paused =
    tunnels.filter(
      (t) => t.status === "paused",
    ).length

  const lastUsed =
    tunnels
      .map((t) => t.lastUsed)
      .filter(Boolean)
      .sort()
      .reverse()[0] ?? "Never"

  const stats = [
    {
      label: "Active",
      value: active,
      icon: Cable,
      color: "text-emerald-400",
    },
    {
      label: "Requests",
      value: totalRequests.toLocaleString(),
      icon: Activity,
      color: "text-orange-400",
    },
    {
      label: "Paused",
      value: paused,
      icon: TriangleAlert,
      color: "text-yellow-400",
    },
    {
      label: "Last Activity",
      value:
        lastUsed === "Never"
          ? "Never"
          : new Date(lastUsed).toLocaleDateString(),
      icon: Clock3,
      color: "text-blue-400",
    },
  ]

  return (
    <div
      className="
        grid
        grid-cols-2
        border-b
        border-border
        lg:grid-cols-4
      "
    >
      {stats.map((item) => (
        <div
          key={item.label}
          className="
            border-r
            border-border
            p-6
            last:border-r-0
          "
        >
          <div
            className={`
              mb-4
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              bg-muted
              ${item.color}
            `}
          >
            <item.icon className="h-5 w-5" />
          </div>

          <div className="text-3xl font-bold">
            {item.value}
          </div>

          <div className="mt-1 text-sm text-muted-foreground">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}