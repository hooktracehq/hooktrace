"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

import {
  Activity,
  Boxes,
  Cable,
  ChevronRight,
  Clock3,
  Database,
  GitBranch,
  LayoutDashboard,
  Radio,
  ShieldAlert,
  Waypoints,
  Workflow,
} from "lucide-react"

import { cn } from "@/lib/utils"

const sections = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Events",
        href: "/events",
        icon: Activity,
      },
      {
        label: "Streams",
        href: "/streams",
        icon: Radio,
      },
    ],
  },

  {
    title: "Infrastructure",
    items: [
      {
        label: "Connections",
        href: "/routes",
        icon: Cable,
      },
      {
        label: "Destinations",
        href: "/delivery-targets",
        icon: Waypoints,
      },
      {
        label: "Aggregation",
        href: "/bulk-aggregation",
        icon: Boxes,
      },
    ],
  },

  {
    title: "Realtime",
    items: [
      {
        label: "Live Stream",
        href: "/live",
        icon: Workflow,
      },
      {
        label: "Tunnels",
        href: "/dev-mode",
        icon: GitBranch,
      },
      {
        label: "Replay Queue",
        href: "/replay",
        icon: Clock3,
      },
    ],
  },

  {
    title: "Observability",
    items: [
      {
        label: "Metrics",
        href: "/metrics",
        icon: Database,
      },
      {
        label: "Issues / DLQ",
        href: "/dlq",
        icon: ShieldAlert,
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-border/70 bg-sidebar lg:flex lg:flex-col">
      
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border/70 px-5">
        <div className="flex items-center gap-3">
          
          {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Workflow className="h-4 w-4" />
          </div> */}

          <div className="flex items-center gap-3">
  
  <Image
    src="/logo.png"
    alt="Hooktrace Logo"
    width={34}
    height={34}
    className="rounded-lg object-contain"
    priority
  />

  <div>
    <p className="text-sm font-semibold tracking-tight">
      Hooktrace
    </p>

    <p className="text-[11px] text-muted-foreground">
      Event Operations
    </p>
  </div>
</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          
          {sections.map((section) => (
            <div key={section.title}>
              
              <div className="mb-2 px-2 operational-label">
                {section.title}
              </div>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon

                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex h-10 items-center justify-between rounded-lg border border-transparent px-3 text-sm transition-all",
                        active
                          ? "border-border bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>

                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 opacity-0 transition-opacity",
                          active && "opacity-100",
                          "group-hover:opacity-100"
                        )}
                      />
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/70 p-4">
        <div className="panel rounded-xl p-3">
          <div className="flex items-center justify-between">
            
            <div>
              <p className="text-sm font-medium">
                Realtime
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Websocket stream active
              </p>
            </div>

            <div className="live-dot" />
          </div>
        </div>
      </div>
    </aside>
  )
}