import { Command, Search, Wifi } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationBell } from "@/components/notifications/notification-bell"

export function AppTopbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border/70 bg-background/80 px-5 backdrop-blur-xl">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-[320px] items-center gap-2 rounded-lg border border-border bg-surface-1 px-3">
          <Search className="h-4 w-4 text-muted-foreground" />

          <input
            placeholder="Search events, routes, deliveries..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />

          <div className="flex items-center gap-1 rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            <Command className="h-3 w-3" />
            K
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Live status */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-1 px-3 py-2 text-xs text-muted-foreground">
          <Wifi className="h-3.5 w-3.5 text-live" />
          Connected
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Theme */}
        <ThemeToggle />
      </div>
    </header>
  )
}