"use client"

import {
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

import { useWebhookStream } from "@/hooks/streams/useWebhookStream"
import {
  useDashboardOverview,
} from "@/hooks/dashboard/use-dashboard-overview"

import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { ThroughputChart } from "@/components/dashboard/throughput-chart"
import { RecentFailures } from "@/components/dashboard/recent-failures"
import { RecentEvents } from "@/components/dashboard/recent-events"
import { ProviderBreakdown } from "@/components/dashboard/provider-breakdown"
import { InfraHealth } from "@/components/dashboard/infra-health"

export default function DashboardClient() {
  const {
    data,
    loading,
    error,
  } = useDashboardOverview()

  const {
    events: liveEvents = [],
    status,
    connected,
  } = useWebhookStream("/ws/events")

  /*
   * -----------------------------------------
   * Loading
   * -----------------------------------------
   */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center">
        <div className="w-full max-w-md px-6">
          <div className="space-y-3">
            <div className="h-7 w-32 animate-pulse rounded-md bg-white/[0.05]" />

            <div className="h-4 w-64 animate-pulse rounded-md bg-white/[0.04]" />

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="h-28 animate-pulse rounded-2xl bg-white/[0.04]" />
              <div className="h-28 animate-pulse rounded-2xl bg-white/[0.04]" />
              <div className="h-28 animate-pulse rounded-2xl bg-white/[0.04]" />
              <div className="h-28 animate-pulse rounded-2xl bg-white/[0.04]" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  /*
   * -----------------------------------------
   * Error
   * -----------------------------------------
   */

  if (error || !data) {
    return (
      <div className="w-full px-6 py-8">
        <div
          className="
            rounded-2xl
            border
            border-rose-500/20
            bg-rose-500/[0.04]
            p-6
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-rose-500/10
              "
            >
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            </div>

            <div>
              <p className="text-sm font-medium">
                Unable to load dashboard
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {error || "No dashboard data available."}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /*
   * -----------------------------------------
   * Safe backend data
   * -----------------------------------------
   */

  const stats = data.stats ?? {}

  const recentEvents = Array.isArray(data.recent_events)
    ? data.recent_events
    : []

  const recentFailures = Array.isArray(data.recent_failures)
    ? data.recent_failures
    : []

  const activity = Array.isArray(data.activity)
    ? data.activity
    : []

  const safeLiveEvents = Array.isArray(liveEvents)
    ? liveEvents
    : []

  /*
   * -----------------------------------------
   * Merge REST + WebSocket events
   * -----------------------------------------
   */

  const existingEventIds = new Set(
    recentEvents.map((event) => String(event.id))
  )

  const newLiveEvents = safeLiveEvents.filter(
    (event) =>
      !existingEventIds.has(String(event.id))
  )

  /*
   * -----------------------------------------
   * Live statistics
   * -----------------------------------------
   */

  const liveIncoming =
    Number(stats.incoming ?? 0) +
    newLiveEvents.length

  const liveDelivered =
    Number(stats.delivered ?? 0) +
    newLiveEvents.filter(
      (event) => event.status === "delivered"
    ).length

  const liveFailed =
    Number(stats.failed ?? 0) +
    newLiveEvents.filter(
      (event) => event.status === "failed"
    ).length

  const liveRetries =
    Number(stats.retries ?? 0)

  const liveDlq =
    Number(stats.dlq ?? 0)

  const liveLatency =
    Number(stats.avg_latency_ms ?? 0)

  const successRate =
    liveIncoming > 0
      ? (liveDelivered / liveIncoming) * 100
      : 100

  const healthy =
    successRate >= 95 &&
    liveDlq === 0

  /*
   * -----------------------------------------
   * Combined events
   * -----------------------------------------
   */

  const mergedEvents = [
    ...newLiveEvents,
    ...recentEvents,
  ]
    .filter(
      (event, index, array) =>
        array.findIndex(
          (item) =>
            String(item.id) ===
            String(event.id)
        ) === index
    )
    .slice(0, 10)

  return (
    <div className="w-full min-w-0">

      {/* ===================================== */}
      {/* Header */}
      {/* ===================================== */}

      <header
        className="
          border-b
          border-border
          bg-background/80
          backdrop-blur-xl
        "
      >
        <div
          className="
            flex
            w-full
            items-center
            justify-between
            gap-4
            px-4
            py-5
            sm:px-6
            lg:px-8
          "
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight">
                Dashboard
              </h1>

              <div
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-medium",
                  connected
                    ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400"
                    : "border-border bg-white/[0.02] text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    connected
                      ? "animate-pulse bg-emerald-400"
                      : "bg-zinc-500"
                  )}
                />

                {connected ? "Live" : status}
              </div>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Monitor your webhook infrastructure
            </p>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Delivery success
            </p>

            <p className="mt-0.5 text-sm font-semibold">
              {successRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </header>

      {/* ===================================== */}
      {/* Main Dashboard */}
      {/* ===================================== */}

      <main
        className="
          w-full
          min-w-0
          space-y-6
          px-4
          py-6
          sm:px-6
          lg:px-8
        "
      >

        {/* ================================= */}
        {/* Health */}
        {/* ================================= */}

        <motion.section
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex w-full min-w-0 flex-col gap-4 rounded-2xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
            healthy
              ? "border-emerald-500/20 bg-emerald-500/[0.035]"
              : "border-rose-500/20 bg-rose-500/[0.035]"
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                healthy
                  ? "bg-emerald-500/10"
                  : "bg-rose-500/10"
              )}
            >
              {healthy ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium">
                {healthy
                  ? "All systems operational"
                  : "Attention required"}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {healthy
                  ? "Webhook deliveries are processing normally."
                  : `${liveFailed} delivery ${
                      liveFailed === 1
                        ? "failure"
                        : "failures"
                    } detected.`}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-5">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Success
              </p>

              <p className="mt-0.5 text-sm font-semibold">
                {successRate.toFixed(1)}%
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Latency
              </p>

              <p className="mt-0.5 text-sm font-semibold">
                {liveLatency}ms
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                DLQ
              </p>

              <p
                className={cn(
                  "mt-0.5 text-sm font-semibold",
                  liveDlq > 0
                    ? "text-rose-400"
                    : "text-foreground"
                )}
              >
                {liveDlq}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ================================= */}
        {/* KPI */}
        {/* ================================= */}

        <section className="w-full min-w-0">
          <DashboardOverview
            stats={{
              incoming: liveIncoming,
              delivered: liveDelivered,
              failed: liveFailed,
              retries: liveRetries,
              dlq: liveDlq,
              avg_latency_ms: liveLatency,
            }}
          />
        </section>

        {/* ================================= */}
        {/* Throughput */}
        {/* ================================= */}

        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="
            block
            w-full
            min-w-0
            overflow-hidden
            rounded-2xl
            border
            border-border
            bg-surface-1
            p-5
            sm:p-6
          "
        >
          <div className="w-full min-w-0">
            <ThroughputChart
              activity={activity}
            />
          </div>
        </motion.section>

        {/* ================================= */}
        {/* Recent Events + Failures */}
        {/* ================================= */}

        <section
          className="
            grid
            w-full
            min-w-0
            grid-cols-1
            gap-6
            xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.8fr)]
          "
        >
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="
              min-w-0
              w-full
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-surface-1
              p-5
              sm:p-6
            "
          >
            <RecentEvents
              events={mergedEvents}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="
              min-w-0
              w-full
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-surface-1
              p-5
              sm:p-6
            "
          >
            <RecentFailures
              failures={recentFailures}
            />
          </motion.div>
        </section>

        {/* ================================= */}
        {/* Provider + Infrastructure */}
        {/* ================================= */}

        <section
          className="
            grid
            w-full
            min-w-0
            grid-cols-1
            gap-6
            lg:grid-cols-2
          "
        >
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="
              min-w-0
              w-full
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-surface-1
              p-5
              sm:p-6
            "
          >
            <ProviderBreakdown
              events={mergedEvents}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="
              min-w-0
              w-full
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-surface-1
              p-5
              sm:p-6
            "
          >
            <InfraHealth />
          </motion.div>
        </section>

      </main>
    </div>
  )
}