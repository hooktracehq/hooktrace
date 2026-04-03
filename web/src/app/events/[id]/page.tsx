
import { notFound } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

import { apiFetch } from "@/lib/api"
import { ReplayButton } from "@/components/ReplayButton"
import { EventLiveView } from "@/components/EventLiveView"
import { JsonViewer } from "@/components/events/json-viewer"
import { ThemeToggle } from "@/components/theme-toggle"


import {
  type LucideIcon,
  Activity,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Hash,
  Calendar,
  Target,
  Key,
  RotateCcw,
  Globe,
  Zap,
} from "lucide-react"

type Event = {
  id: number
  token: string
  route: string
  provider: string | null
  status: "pending" | "delivered" | "failed" | "retrying"
  attempt_count: number
  headers: Record<string, unknown>
  payload: Record<string, unknown>
  created_at: string
  delivery_target?: string | null
  idempotency_key?: string | null
  last_error?: string | null
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = (await params).id

  if (!id || Number.isNaN(Number(id))) notFound()

  let event: Event | null = null

  try {
    event = await apiFetch<Event>(`/events/${id}`)
  } catch {
    notFound()
  }

  if (!event) notFound()

  const displayStatus = event.status === "retrying" ? "pending" : event.status

  const statusConfig = {
    delivered: {
      icon: CheckCircle2,
      label: "Delivered",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-900",
    },
    failed: {
      icon: XCircle,
      label: "Failed",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      border: "border-rose-200 dark:border-rose-900",
    },
    pending: {
      icon: Clock,
      label: "Pending",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-900",
    },
  }

  const config = statusConfig[displayStatus]
  const StatusIcon = config.icon

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            {/* Back Button */}
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>

            {/* Title & Status */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Event Details</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Event ID: <span className="font-mono">{event.id}</span>
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${config.bg} ${config.border} border`}>
                <StatusIcon className={`w-5 h-5 ${config.color}`} />
                <div>
                  <p className={`font-semibold text-sm ${config.color}`}>
                    {config.label}
                  </p>
                  <p className={`text-xs ${config.color}`}>
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <EventLiveView event={event} />
            <ReplayButton eventId={event.id} />
            <ThemeToggle />
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            icon={Globe}
            label="Route"
            value={event.route}
            color="blue"
          />
          <InfoCard
            icon={Zap}
            label="Provider"
            value={event.provider || "Generic"}
            color="violet"
          />
          <InfoCard
            icon={RotateCcw}
            label="Attempts"
            value={event.attempt_count.toString()}
            color="amber"
          />
          <InfoCard
            icon={Calendar}
            label="Created"
            value={formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
            color="emerald"
          />
        </div>

        {/* Error Alert */}
        {event.last_error && (
          <div className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-rose-900 dark:text-rose-100 mb-2">
                  Delivery Error
                </h3>
                <div className="rounded-md bg-background border border-rose-200 dark:border-rose-900 p-4">
                  <pre className="text-sm text-rose-900 dark:text-rose-100 whitespace-pre-wrap break-all font-mono">
{event.last_error}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Metadata */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold">Event Metadata</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Complete event information and configuration
            </p>
          </div>

          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <MetaField
                icon={Hash}
                label="Event ID"
                value={event.id.toString()}
                mono
              />
              <MetaField
                icon={Key}
                label="Token"
                value={event.token}
                mono
              />
              <MetaField
                icon={Globe}
                label="Route"
                value={event.route}
              />
              <MetaField
                icon={Zap}
                label="Provider"
                value={event.provider || "Generic"}
              />
              <MetaField
                icon={Target}
                label="Delivery Target"
                value={event.delivery_target || "Not configured"}
              />
              <MetaField
                icon={Key}
                label="Idempotency Key"
                value={event.idempotency_key || "None"}
                mono
              />
              <MetaField
                icon={Calendar}
                label="Created At"
                value={new Date(event.created_at).toLocaleString()}
              />
              <MetaField
                icon={RotateCcw}
                label="Attempt Count"
                value={event.attempt_count.toString()}
              />
            </div>
          </div>
        </div>

        {/* Payload & Headers */}
        <div className="grid gap-6 lg:grid-cols-2">
          <JsonViewer
            title="Payload"
            data={event.payload}
          />
          <JsonViewer
            title="Headers"
            data={event.headers}
          />
        </div>
      </div>
    </div>
  )
}

/* ------------------ Components ------------------ */

function InfoCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: LucideIcon
  label: string
  value: string
  color: "blue" | "violet" | "amber" | "emerald"
}) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      icon: "text-blue-600 dark:text-blue-400",
    },
    violet: {
      bg: "bg-violet-50 dark:bg-violet-950/30",
      icon: "text-violet-600 dark:text-violet-400",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      icon: "text-amber-600 dark:text-amber-400",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      icon: "text-emerald-600 dark:text-emerald-400",
    },
  }

  const colors = colorMap[color]

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className={`inline-flex p-2 rounded-lg ${colors.bg} mb-2`}>
        <Icon className={`w-4 h-4 ${colors.icon}`} />
      </div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-sm truncate" title={value}>
        {value}
      </p>
    </div>
  )
}

function MetaField({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: LucideIcon
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-muted/50 flex-shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className={`text-sm break-all ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  )
}