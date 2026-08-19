"use client"

import {
  Bell,
  Check,
  CircleAlert,
  Info,
  X,
} from "lucide-react"

import {
  useEffect,
  useRef,
  useState,
} from "react"

import { cn } from "@/lib/utils"

import {
  useNotificationsStore,
  type Notification,
  type NotificationLevel,
} from "@/app/stores/notifications-store"

function formatTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const diff =
    Date.now() - date.getTime()

  if (diff < 0) {
    return "Just now"
  }

  const seconds = Math.floor(
    diff / 1000
  )

  if (seconds < 60) {
    return "Just now"
  }

  const minutes = Math.floor(
    seconds / 60
  )

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(
    minutes / 60
  )

  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(
    hours / 24
  )

  return `${days}d ago`
}

function NotificationIcon({
  level,
}: {
  level: NotificationLevel
}) {
  if (level === "error") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10">
        <CircleAlert className="h-4 w-4 text-rose-400" />
      </div>
    )
  }

  if (level === "warning") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
        <CircleAlert className="h-4 w-4 text-amber-400" />
      </div>
    )
  }

  if (level === "success") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
        <Check className="h-4 w-4 text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
      <Info className="h-4 w-4 text-blue-400" />
    </div>
  )
}

export function NotificationBell() {
  const [open, setOpen] =
    useState(false)

  const containerRef =
    useRef<HTMLDivElement | null>(null)

  /*
   * Single source of truth.
   *
   * Notifications are populated by
   * useRealtimeSystem().
   */
  const notifications =
    useNotificationsStore(
      (state) => state.notifications
    )

  const markAsRead =
    useNotificationsStore(
      (state) => state.markAsRead
    )

  const markAllAsRead =
    useNotificationsStore(
      (state) => state.markAllAsRead
    )

  const removeNotification =
    useNotificationsStore(
      (state) => state.removeNotification
    )

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        !containerRef.current
      ) {
        return
      }

      if (
        containerRef.current.contains(
          event.target as Node
        )
      ) {
        return
      }

      setOpen(false)
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* Bell */}
      <button
        type="button"
        onClick={() =>
          setOpen(
            (value) => !value
          )
        }
        aria-label="Notifications"
        aria-expanded={open}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-1 text-muted-foreground transition-colors",
          "hover:bg-accent hover:text-foreground",
          open &&
            "bg-accent text-foreground"
        )}
      >
        <Bell className="h-4 w-4" />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold leading-none text-white ring-2 ring-background">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-[100] w-[340px] overflow-hidden rounded-xl border border-border bg-surface-1 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Notifications
              </p>

              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={
                  markAllAsRead
                }
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length ===
            0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </div>

                <p className="mt-3 text-sm font-medium text-foreground">
                  No notifications
                </p>

                <p className="mt-1 max-w-[220px] text-xs leading-5 text-muted-foreground">
                  Important Hooktrace activity will appear here.
                </p>
              </div>
            ) : (
              notifications.map(
                (
                  notification: Notification
                ) => (
                  <div
                    key={
                      notification.id
                    }
                    className={cn(
                      "group flex gap-3 border-b border-border/70 px-4 py-3 transition-colors last:border-b-0 hover:bg-accent/40",
                      !notification.read &&
                        "bg-accent/20"
                    )}
                  >
                    <NotificationIcon
                      level={
                        notification.level
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        markAsRead(
                          notification.id
                        )
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm text-foreground",
                            notification.read
                              ? "font-medium"
                              : "font-semibold"
                          )}
                        >
                          {
                            notification.title
                          }
                        </p>

                        {!notification.read && (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                        )}
                      </div>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {
                          notification.message
                        }
                      </p>

                      <p className="mt-1.5 text-[10px] text-muted-foreground">
                        {formatTime(
                          notification.timestamp
                        )}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeNotification(
                          notification.id
                        )
                      }
                      aria-label="Dismiss notification"
                      className="mt-0.5 hidden h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground group-hover:flex"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}