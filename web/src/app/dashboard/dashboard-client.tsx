
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  type LucideIcon,
  Activity,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Zap,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Circle,
} from "lucide-react"
import { motion, type Variants } from "framer-motion"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"


/* ------------------ Motion ------------------ */

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
}

/* ------------------ Types ------------------ */

type Endpoint = {
  id: number
  token: string
  route: string
  mode: "dev" | "prod"
}


type MetricsData = {
  incoming: [number, string][]
  delivered: [number, string][]
  failed: [number, string][]
  latency: [number, string][]
  timestamp: number
}


type WebhookEvent = {
  id: number
  provider: string
  status: "pending" | "delivered" | "failed"
  created_at: string
}

/* ------------------ Component ------------------ */

export default function DashboardClient({
  stats,
  user,
  successSeries = [],
  failureSeries = [],
  recentEvents = [],
  endpoints = [],
}: {
  stats: { label: string; value: number }[]
  user: {
    email: string
    avatar_url?: string
    name?: string
  }
  successSeries?: [number, string][]
  failureSeries?: [number, string][]
  recentEvents?:WebhookEvent[]
endpoints?: Endpoint[]
})   {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    if (!isLive) return

    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/metrics")
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        console.error("Metrics fetch error:", error)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [isLive])

  const formatTime = (ts?: number) =>
    ts ? new Date(ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""

  const transform = (series?: [number, string][]) =>
    (series || []).map(([ts, val]) => ({
      time: formatTime(ts),
      value: Number(val) || 0,
    }))

  // Chart data
  const maxLen = Math.max(successSeries.length, failureSeries.length)
  const chartData = Array.from({ length: maxLen })
    .map((_, i) => {
      const s = successSeries[i]
      const f = failureSeries[i]
      const ts = s?.[0] ?? f?.[0]
      if (!ts) return null
      return {
        time: formatTime(ts),
        success: Number(s?.[1] ?? 0),
        failed: Number(f?.[1] ?? 0),
      }
    })
    .filter(Boolean)

  // Calculate real-time metrics
  const latestIncoming = metrics ? transform(metrics.incoming).slice(-1)[0]?.value || 0 : 0
  const latestLatency = metrics ? transform(metrics.latency).slice(-1)[0]?.value || 0 : 0
  
  const deliveryResults = metrics
    ? metrics.delivered.map((point, i) => ({
        success: Number(point[1]) || 0,
        failed: Number(metrics.failed[i]?.[1]) || 0,
      }))
    : []

  const latestDelivered = deliveryResults.slice(-1)[0]?.success || 0
  const latestFailed = deliveryResults.slice(-1)[0]?.failed || 0
  const total = latestDelivered + latestFailed
  const successRate = total > 0 ? ((latestDelivered / total) * 100) : 100
  const isHealthy = successRate >= 95 && latestLatency < 2

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-7xl px-6 py-8 space-y-8"
      >
        {/* Header */}
        <motion.header variants={fadeUp}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
              <p className="text-muted-foreground">Monitor your webhook performance</p>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              <button
    onClick={() => setIsLive(!isLive)}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
      transition-colors
      ${isLive
        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
        : "bg-muted hover:bg-muted/80"
      }
    `}
  >
    <Circle className={`w-2 h-2 fill-current ${isLive ? "animate-pulse" : ""}`} />
    {isLive ? "Live" : "Paused"}
  </button>
  <UserNav user={user} />
            </div>
          </div>

          {/* Status Banner */}
          <div className={`
            flex items-center justify-between p-4 rounded-lg border mb-8
            ${isHealthy 
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900" 
              : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900"
            }
          `}>
            <div className="flex items-center gap-3">
              {isHealthy ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              )}
              <div>
                <p className={`font-semibold text-sm ${
                  isHealthy ? "text-emerald-900 dark:text-emerald-100" : "text-amber-900 dark:text-amber-100"
                }`}>
                  {isHealthy ? "All systems operational" : "Performance degraded"}
                </p>
                <p className={`text-xs ${
                  isHealthy ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                }`}>
                  Success rate: {successRate.toFixed(1)}% • Latency: {(latestLatency * 1000).toFixed(0)}ms
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href="/events"
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-background/80 hover:bg-background text-sm font-medium transition-colors"
              >
                View Events
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.header>

        {/* Stats Grid */}
        <motion.section
          variants={container}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            icon={Activity}
            label="Total Events"
            value={stats[0].value}
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={CheckCircle2}
            label="Delivered"
            value={stats[1].value}
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            icon={XCircle}
            label="Failed"
            value={stats[2].value}
            iconColor="text-rose-600 dark:text-rose-400"
          />
          <StatCard
            icon={RotateCcw}
            label="Retries"
            value={stats[3].value}
            iconColor="text-amber-600 dark:text-amber-400"
          />
        </motion.section>

        {/* Live Metrics */}
        {metrics && (
          <motion.section
            variants={container}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <LiveMetric
              icon={Zap}
              label="Throughput"
              value={latestIncoming.toFixed(1)}
              unit="req/s"
              iconColor="text-violet-600 dark:text-violet-400"
            />
            <LiveMetric
              icon={TrendingUp}
              label="Success Rate"
              value={successRate.toFixed(1)}
              unit="%"
              iconColor="text-emerald-600 dark:text-emerald-400"
            />
            <LiveMetric
              icon={Clock}
              label="Latency"
              value={(latestLatency * 1000).toFixed(0)}
              unit="ms"
              iconColor="text-blue-600 dark:text-blue-400"
            />
            <LiveMetric
              icon={AlertCircle}
              label="Failed Events"
              value={latestFailed.toFixed(0)}
              unit="events"
              iconColor="text-rose-600 dark:text-rose-400"
            />
          </motion.section>
        )}

        {/* Main Chart */}
        <motion.section variants={fadeUp}>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Delivery Performance</h2>
                <p className="text-sm text-muted-foreground">Success vs failure over time</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Success</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-muted-foreground">Failed</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(34, 197, 94)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="rgb(34, 197, 94)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(239, 68, 68)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="rgb(239, 68, 68)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="success"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth={2}
                  fill="url(#successGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="failed"
                  stroke="rgb(239, 68, 68)"
                  strokeWidth={2}
                  fill="url(#failedGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section variants={fadeUp}>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
            <div>
              <p className="font-medium mb-1">Need more details?</p>
              <p className="text-sm text-muted-foreground">
                View individual events, check failures, or see advanced metrics
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/events"
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
              >
                All Events
              </Link>
              <Link
                href="/events?status=failed"
                className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm font-medium transition-colors"
              >
                Failed Events
              </Link>
              <Link
                href="/metrics"
                className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm font-medium transition-colors"
              >
                Advanced Metrics
              </Link>
            </div>
          </div>
        </motion.section>
          {/* Recent Events */}

<motion.section variants={fadeUp} className="grid gap-6 lg:grid-cols-2">
  <div className="rounded-xl border border-border bg-card p-6">
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-semibold">Recent Events</h2>

      <Link
        href="/events"
        className="text-sm text-primary hover:underline"
      >
        View all
      </Link>
    </div>

    <div className="space-y-3">
      {recentEvents?.map((ev: WebhookEvent) => (
        <Link
          key={ev.id}
          href={`/events/${ev.id}`}
          className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition"
        >
          <div className="flex items-center gap-3">

            {ev.status === "delivered" && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}

            {ev.status === "failed" && (
              <XCircle className="w-4 h-4 text-rose-500" />
            )}

            {ev.status === "pending" && (
              <Clock className="w-4 h-4 text-amber-500" />
            )}

            <div>
              <p className="text-sm font-medium">
                Event #{ev.id}
              </p>

              <p className="text-xs text-muted-foreground">
                {ev.provider}
              </p>
            </div>
          </div>

          <span className="text-xs text-muted-foreground">
            {new Date(ev.created_at).toLocaleTimeString()}
          </span>
        </Link>
      ))}
    </div>
  </div>

  {/* Endpoints */}

  <div className="rounded-xl border border-border bg-card p-6">
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-lg font-semibold">Endpoints</h2>

    <Link
      href="/endpoints"
      className="text-sm text-primary hover:underline"
    >
      Manage
    </Link>
  </div>

  <div className="space-y-3">
    {endpoints.length === 0 && (
      <p className="text-sm text-muted-foreground">
        No endpoints created yet
      </p>
    )}

    {endpoints.slice(0,5).map((ep) => (
      <div
        key={ep.id}
        className="flex items-center justify-between p-3 rounded-md border border-border"
      >
        <div>
          <p className="text-sm font-medium">
            {ep.route}
          </p>

          <p className="text-xs text-muted-foreground">
            /r/{ep.token}/{ep.route}
          </p>
        </div>

        <span className="text-xs px-2 py-1 rounded bg-muted">
          {ep.mode}
        </span>
      </div>
    ))}
  </div>
</div>
</motion.section>
      </motion.div>



    
    </div>
  )
}

/* ------------------ Components ------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: LucideIcon
  label: string
  value: number
  iconColor: string
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-lg border border-border bg-card p-5 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold mb-1 tabular-nums">
        {Number.isFinite(value) ? value.toLocaleString() : 0}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  )
}

function LiveMetric({
  icon: Icon,
  label,
  value,
  unit,
  iconColor,
}: {
  icon: LucideIcon
  label: string
  value: string
  unit: string
  iconColor: string
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-lg border border-border bg-card/50 p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold tabular-nums">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </motion.div>
  )
}