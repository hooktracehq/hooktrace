"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import {
  Activity,
  Boxes,
  Cable,
  ChevronDown,
  ChevronRight,
  Clock3,
  Database,
  GitBranch,
  LayoutDashboard,
  PlugZap,
  Radio,
  Settings,
  ShieldAlert,
  UserRound,
  Waypoints,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { LogoutButton } from "@/components/account/logout-button"

type User = {
  id: string
  email: string
  avatar_url?: string | null
  provider?: string | null
}

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
    ],
  },

  {
    title: "Infrastructure",
    items: [
      {
        label: "Connections",
        href: "/connections",
        icon: PlugZap,
      },
      {
        label: "Routes",
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
        label: "Streams",
        href: "/streams",
        icon: Radio,
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

function getInitials(email?: string | null) {
  if (!email) {
    return "U"
  }

  const name = email.split("@")[0]

  if (!name) {
    return "U"
  }

  return name.slice(0, 2).toUpperCase()
}

export function AppSidebar() {
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadUser() {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:3001"

        const response = await fetch(
          `${apiUrl}/auth/me`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        )

        if (!response.ok) {
          return
        }

        const data = await response.json()

        if (!cancelled) {
          setUser(data)
        }
      } catch (error) {
        console.error(
          "Failed to load current user:",
          error
        )
      }
    }

    loadUser()

    return () => {
      cancelled = true
    }
  }, [])

  const initials = getInitials(user?.email)

  const providerLabel =
    user?.provider &&
    user.provider !== "local"
      ? `${user.provider} account`
      : "Hooktrace account"

  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-border/70 bg-sidebar lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border/70 px-5">
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
                    pathname.startsWith(
                      `${item.href}/`
                    )

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

                        <span>
                          {item.label}
                        </span>
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

      {/* Account */}
      <div className="relative border-t border-border/70 p-3">
        {/* Account menu */}
        {menuOpen && (
          <div className="absolute bottom-[calc(100%-4px)] left-3 right-3 z-50 overflow-hidden rounded-xl border border-border bg-surface-1 p-2 shadow-2xl">
            {/* Account information */}
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.email || "Account"}
              </p>

              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {providerLabel}
              </p>
            </div>

            <div className="my-1 border-t border-border" />

            {/* Profile */}
            <Link
              href="/settings"
              onClick={() =>
                setMenuOpen(false)
              }
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                pathname === "/settings"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <UserRound className="h-4 w-4" />

              <span>Profile</span>
            </Link>

            {/* Settings */}
            <Link
              href="/settings"
              onClick={() =>
                setMenuOpen(false)
              }
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Settings className="h-4 w-4" />

              <span>Settings</span>
            </Link>

            <div className="my-1 border-t border-border" />

            {/* Logout */}
            <LogoutButton />
          </div>
        )}

        {/* Account trigger */}
        <button
          type="button"
          onClick={() =>
            setMenuOpen((value) => !value)
          }
          aria-expanded={menuOpen}
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left transition-all",
            "hover:border-border hover:bg-accent/50",
            menuOpen &&
              "border-border bg-accent/50"
          )}
        >
          {/* Avatar */}
          {user?.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt=""
              width={34}
              height={34}
              className="h-[34px] w-[34px] shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10 text-xs font-semibold text-orange-400">
              {initials}
            </div>
          )}

          {/* User info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.email || "Loading..."}
            </p>

            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {user
                ? providerLabel
                : "Hooktrace account"}
            </p>
          </div>

          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              menuOpen && "rotate-180"
            )}
          />
        </button>
      </div>
    </aside>
  )
}