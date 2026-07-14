"use client"

import {
  Activity,
  CalendarDays,
 CheckCircle2,
  Clock3,
  Globe,
  Server,
  TriangleAlert,
} from "lucide-react"

import type {
  Tunnel,
  TunnelStats,
} from "@/types/tunnel"

type Props = {
  tunnel: Tunnel
  stats: TunnelStats
}

export function TunnelOverview({
  tunnel,
  stats,
}: Props) {
  const cards = [
    {
      title: "Public URL",
      value: tunnel.publicUrl,
      icon: Globe,
      mono: true,
    },
    {
      title: "Local Target",
      value: tunnel.localUrl,
      icon: Server,
      mono: true,
    },
    {
      title: "Requests",
      value: stats.total.toLocaleString(),
      icon: Activity,
    },
    {
      title: "Successful",
      value: stats.success.toLocaleString(),
      icon: CheckCircle2,
    },
    {
      title: "Errors",
      value: stats.errors.toLocaleString(),
      icon: TriangleAlert,
    },
    {
      title: "Avg Response",
      value: `${stats.avgDuration} ms`,
      icon: Clock3,
    },
    {
      title: "Created",
      value: new Date(
        tunnel.createdAt,
      ).toLocaleString(),
      icon: CalendarDays,
    },
    {
      title: "Last Activity",
      value: tunnel.lastUsed
        ? new Date(
            tunnel.lastUsed,
          ).toLocaleString()
        : "Never",
      icon: Clock3,
    },
  ]

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((item) => (
        <div
          key={item.title}
          className="
            rounded-2xl
            border
            border-border
            bg-card
            p-5
          "
        >
          <div className="mb-5 flex items-center gap-3">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-orange-500/10
                text-orange-400
              "
            >
              <item.icon className="h-5 w-5" />
            </div>

            <p className="text-sm text-muted-foreground">
              {item.title}
            </p>

          </div>

          <div
            className={
              item.mono
                ? "break-all font-mono text-sm"
                : "text-2xl font-semibold"
            }
          >
            {item.value}
          </div>

        </div>
      ))}
    </div>
  )
}