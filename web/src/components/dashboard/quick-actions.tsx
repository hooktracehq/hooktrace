"use client"

import Link from "next/link"

import {
  Activity,
  ArrowRight,
  BarChart3,
  Radio,
  ShieldAlert,
} from "lucide-react"

const actions = [
  {
    label: "Open Events",
    href: "/events",
    icon: Activity,
  },

  {
    label: "View Metrics",
    href: "/metrics",
    icon: BarChart3,
  },

  {
    label: "Live Streams",
    href: "/streams",
    icon: Radio,
  },

  {
    label: "Inspect DLQ",
    href: "/issues",
    icon: ShieldAlert,
  },
]

export function QuickActions() {
  return (
    <div
      className="
        rounded-2xl border border-border
        bg-surface-1 p-6
      "
    >

      <div className="mb-6">

        <h2 className="text-lg font-semibold">
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          jump into operational workflows
        </p>

      </div>

      <div className="grid gap-3">

        {actions.map((action) => {
          const Icon = action.icon

          return (
            <Link
              key={action.label}
              href={action.href}
              className="
                group flex items-center justify-between
                rounded-xl border border-border
                bg-background/20
                px-4 py-4
                transition-all duration-200
                hover:border-orange-500/20
                hover:bg-white/[0.02]
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex h-10 w-10 items-center justify-center
                    rounded-xl border border-border
                    bg-background/40
                  "
                >
                  <Icon className="h-5 w-5 text-orange-400" />
                </div>

                <span className="text-sm font-medium">
                  {action.label}
                </span>

              </div>

              <ArrowRight
                className="
                  h-4 w-4 text-muted-foreground
                  transition-transform
                  group-hover:translate-x-1
                "
              />

            </Link>
          )
        })}

      </div>
    </div>
  )
}