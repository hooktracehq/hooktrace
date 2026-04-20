"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, MoreHorizontal, RotateCcw } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

import { ProviderBadge } from "@/components/events/provider-badge"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { StatusBadge } from "@/components/ui/status-badge"

/* ---------------- Types ---------------- */

type Event = {
  id: number
  route: string
  provider?: string
  event_type?: string
  status: "pending" | "delivered" | "failed" | "retrying"
  attempt_count: number
  created_at: string
  last_error?: string
}

type Props = {
  events: Event[]
  newIds?: Set<number>
}

/* ---------------- Component ---------------- */

export function EventsTable({ events, newIds }: Props) {
  const router = useRouter()

  if (!events.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground font-medium">
        No webhook events yet.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>ID</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {events.map((event) => {
            const isNew = newIds?.has(event.id)

            //  SAFE DATE HANDLING
            const createdAt = event.created_at
              ? new Date(event.created_at)
              : null

            const isValidDate =
              createdAt instanceof Date &&
              !isNaN(createdAt.getTime())

            return (
              <motion.tr
                key={event.id}
                initial={isNew ? { opacity: 0, y: -10 } : false}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "group cursor-pointer border-t border-border/60 transition-all duration-200 hover:bg-muted/60 hover:scale-[1.002]",
                  isNew && "bg-primary/10"
                )}
                onClick={() => router.push(`/events/${event.id}`)}
              >
                {/* ID */}
                <TableCell className="font-medium">
                  #{event.id}
                </TableCell>

                {/* Route + Provider */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <ProviderBadge provider={event.provider} />

                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {event.event_type || "unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {event.route}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <div className="space-y-1">
                    <StatusBadge status={event.status} />
                    {event.last_error && (
                      <p className="max-w-[260px] truncate text-xs text-destructive">
                        {event.last_error}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Attempts */}
                <TableCell className="text-sm text-muted-foreground font-medium">
                  {event.attempt_count || 0}
                </TableCell>

                {/* Created (FIXED) */}
                <TableCell>
                  <time
                    className="text-sm text-muted-foreground font-medium"
                    title={
                      isValidDate
                        ? format(createdAt, "yyyy-MM-dd HH:mm:ss")
                        : "Invalid date"
                    }
                  >
                    {isValidDate
                      ? formatDistanceToNow(createdAt, { addSuffix: true })
                      : "—"}
                  </time>
                </TableCell>

                {/* Actions */}
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md
                                   text-muted-foreground opacity-0 transition
                                   hover:bg-muted group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Content
                      align="end"
                      className="z-50 min-w-[140px] rounded-md border border-border
                                 bg-popover p-1 shadow-md"
                    >
                      <DropdownMenu.Item asChild>
                        <Link
                          href={`/events/${event.id}`}
                          className="flex cursor-pointer items-center gap-2 rounded-sm
                                     px-2 py-1.5 text-sm hover:bg-muted"
                        >
                          <Eye className="h-4 w-4" />
                          View event
                        </Link>
                      </DropdownMenu.Item>

                      {event.status === "failed" && (
                        <DropdownMenu.Item
                          className="flex cursor-pointer items-center gap-2 rounded-sm
                                     px-2 py-1.5 text-sm hover:bg-muted"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Retry
                        </DropdownMenu.Item>
                      )}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </TableCell>
              </motion.tr>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}