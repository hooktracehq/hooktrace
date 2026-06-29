export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { getEvent } from "@/lib/services/events"

import { ReplayButton } from "@/components/ReplayButton"
import { ThemeToggle } from "@/components/theme-toggle"
import { StatusBadge } from "@/components/ui/status-badge"
import { EventDetailTabs } from "@/components/events/event-detail-tabs"
import { CopyButton } from "@/components/events/CopyButton"
import { EventDeliveries } from "../event-deliveries"

import type { EventDetail } from "@/types/event-detail"

import {
  type LucideIcon,
  Activity,
  ArrowLeft,
  Globe,
  Zap,
  RotateCcw,
} from "lucide-react"

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (!id || Number.isNaN(Number(id))) {
    notFound()
  }

  let event: EventDetail | null = null

  try {
    event = await getEvent(Number(id))
  } catch {
    notFound()
  }

  if (!event) {
    notFound()
  }

  const displayStatus =
    event.status === "retrying"
      ? "pending"
      : event.status

  const attemptCount =
    event.attempt_count ?? 0

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">

        {/* Header */}

        <div className="flex items-start justify-between">

          <div className="space-y-4">

            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>

            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">
                Event Details
              </h1>
            </div>

            <div className="flex items-center gap-3">

              <StatusBadge
                status={displayStatus}
              />

              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(
                  new Date(event.created_at),
                  {
                    addSuffix: true,
                  }
                )}
              </span>

              <span className="text-xs text-muted-foreground">
                • {event.provider || "Generic"}
              </span>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <ReplayButton
              eventId={event.id}
            />

            <CopyButton
              text={event.id.toString()}
            />

            <ThemeToggle />

          </div>

        </div>

        {/* Info */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <InfoCard
            icon={Globe}
            label="Route"
            value={event.route}
          />

          <InfoCard
            icon={Zap}
            label="Event Type"
            value={
              event.event_type ??
              "Unknown"
            }
          />

          <InfoCard
            icon={RotateCcw}
            label="Attempts"
            value={attemptCount.toString()}
          />

        </div>

        {/* Tabs */}

        <EventDetailTabs
          payload={event.payload}
          headers={event.headers}
          error={event.last_error}
        />

        {/* Deliveries */}

        <div className="space-y-4 rounded-xl border bg-card p-5">

          <div className="flex items-center justify-between">

            <h2 className="text-lg font-semibold">
              Delivery Timeline
            </h2>

            <span className="text-xs text-muted-foreground">
              Per-target delivery attempts
            </span>

          </div>

          <EventDeliveries
            eventId={event.id}
          />

        </div>

      </div>
    </div>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border bg-card p-4 transition hover:shadow-sm">

      <Icon className="mb-2 h-4 w-4 text-primary" />

      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="text-sm font-semibold">
        {value}
      </p>

    </div>
  )
}