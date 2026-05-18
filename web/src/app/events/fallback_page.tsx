
// export const dynamic = "force-dynamic"

import { serverApiFetch } from "@/lib/server-api"
import { EventsLiveWrapper } from "@/app/events/clientWrapper"
import { EventsTabs } from "@/components/events/event-tabs"
import { Event } from "@/types/event"
import { StatCard } from "@/components/ui/stat-card"
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"




export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  console.log("FINAL STATUS:", status)

  const query = status 
  ? `/events?status=${status}` 
  : "/events"
  

  const res = await serverApiFetch<{ items: Event[] }>(query)
  const events = res?.items ?? []

  // Calculate stats for all events view
  const totalEvents = events.length
  let deliveredCount = 0
  let failedCount = 0
  let pendingCount = 0
  let dlqCount = 0

  if (!status) {
    // Only calculate when showing all events
    deliveredCount = events.filter(e => e.status === "delivered").length
    failedCount = events.filter(e => e.status === "failed" && (e.attempt_count ?? 0) < 5).length
    pendingCount = events.filter(e => e.status === "pending").length
    dlqCount = events.filter(e => e.status === "failed" && (e.attempt_count ?? 0) >= 5).length
  }

  const successRate = !status && totalEvents > 0 
    ? ((deliveredCount / totalEvents) * 100).toFixed(1) 
    : "0"

  // Get page title and description based on filter
  const getPageInfo = () => {
    switch (status) {
      case "pending":
        return {
          title: "Pending Events",
          description: "Webhooks waiting to be processed",
        }
      case "delivered":
        return {
          title: "Delivered Events",
          description: "Successfully delivered webhooks",
        }
      case "failed":
        return {
          title: "Failed Events",
          description: "Webhooks that failed but are still retrying",
        }
      case "dlq":
        return {
          title: "Dead Letter Queue",
          description: "Failed webhooks that exhausted all retry attempts",
        }
      default:
        return {
          title: "Webhook Events",
          description: "View all webhook deliveries and their status",
        }
    }
  }

  const pageInfo = getPageInfo()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{pageInfo.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {pageInfo.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Stats Cards - Only show on "All Events" view */}
        {!status && events.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              icon={Activity}
              label="Total Events"
              value={totalEvents}
              
            />
            <StatCard
              icon={CheckCircle2}
              label="Delivered"
              value={deliveredCount}
              
            />
            <StatCard
              icon={XCircle}
              label="Failed"
              value={failedCount}
              
            />
            <StatCard
              icon={Clock}
              label="Pending"
              value={pendingCount}
              
            />
            <StatCard
              icon={AlertTriangle}
              label="DLQ"
              value={dlqCount}
              
            />
          </div>
        )}

        {/* Success Rate Banner - Only on all events view */}
        {!status && events.length > 0 && (
          <div className={`
            flex items-center justify-between p-4 rounded-lg border
            ${Number(successRate) >= 95
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900"
              : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900"
            }
          `}>
            <div className="flex items-center gap-3">
              {Number(successRate) >= 95 ? (
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              )}
              <div>
                <p className={`font-semibold text-sm ${
                  Number(successRate) >= 95
                    ? "text-emerald-900 dark:text-emerald-100"
                    : "text-amber-900 dark:text-amber-100"
                }`}>
                  {Number(successRate) >= 95 
                    ? "Excellent delivery performance" 
                    : "Some deliveries are failing"
                  }
                </p>
                <p className={`text-xs ${
                  Number(successRate) >= 95
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}>
                  Success rate: {successRate}% • {deliveredCount} delivered, {failedCount + dlqCount} failed
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DLQ Warning Banner - Only show when viewing DLQ */}
        {status === "dlq" && events.length > 0 && (
          <div className="flex items-center justify-between p-4 rounded-lg border bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="font-semibold text-sm text-orange-900 dark:text-orange-100">
                  Dead Letter Queue
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  These events have exhausted all retry attempts and require manual intervention
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <EventsTabs />
          
          {events.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{events.length}</span> events
            </p>
          )}
        </div>

        {/* Content */}
      
        <div className="transition-opacity duration-200">
  {events.length === 0 ? (
    <EmptyState status={status} />
  ) : (
    <EventsLiveWrapper
      key={status ?? "all"}
      initialEvents={events}
      status={status}
    />
  )}
</div>
      </div>
    </div>
  )
}

/* ------------------ Components ------------------ */


function EmptyState({ status }: { status?: string }) {
  const getMessage = () => {
    if (status === "failed") {
      return {
        icon: CheckCircle2,
        title: "No failed events",
        description: "Great! No webhooks are currently failing.",
        color: "text-emerald-600 dark:text-emerald-400",
      }
    }
    if (status === "pending") {
      return {
        icon: CheckCircle2,
        title: "No pending events",
        description: "All webhooks have been processed.",
        color: "text-blue-600 dark:text-blue-400",
      }
    }
    if (status === "delivered") {
      return {
        icon: AlertCircle,
        title: "No delivered events",
        description: "No successfully delivered webhooks yet.",
        color: "text-muted-foreground",
      }
    }
    if (status === "dlq") {
      return {
        icon: CheckCircle2,
        title: "No events in DLQ",
        description: "Excellent! No webhooks have exhausted their retry attempts.",
        color: "text-emerald-600 dark:text-emerald-400",
      }
    }
    return {
      icon: Activity,
      title: "No events yet",
      description: "Webhook events will appear here once you start receiving them.",
      color: "text-muted-foreground",
    }
  }

  const { icon: Icon, title, description, color } = getMessage()

  return (
    <div className="rounded-xl border border-border bg-card p-12 text-center">
      <div className="mx-auto w-fit p-3 rounded-full bg-muted/50 mb-4">
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        {description}
      </p>
      
      {!status && (
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/metrics"
            className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm font-medium transition-colors"
          >
            View Metrics
          </Link>
        </div>
      )}
    </div>
  )
}