"use client"

import {
  Activity,
  Clock3,
  Globe,
  TrendingUp,
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
      (t) => t.status === "active"
    ).length

  const requests =
    tunnels.reduce(
      (acc, t) =>
        acc + t.requestCount,
      0
    )

  const stats = [
    {
      label: "Active Tunnels",
      value: active,
      icon: Globe,
    },
    {
      label: "Requests",
      value: requests,
      icon: Activity,
    },
    {
      label: "Avg Latency",
      value: "84ms",
      icon: TrendingUp,
    },
    {
      label: "Uptime",
      value: "99.9%",
      icon: Clock3,
    },
  ]

  return (
    <div className="grid grid-cols-4 border-b border-border">

      {stats.map((item) => (
        <div
          key={item.label}
          className="border-r border-border p-5 last:border-r-0"
        >
          <item.icon className="mb-3 h-5 w-5 text-orange-400" />

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