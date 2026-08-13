"use client"

import Link from "next/link"

import {
  Activity,
  ArrowRight,
  Cable,
  GitBranch,
  Layers3,
  PlugZap,
  Radio,
} from "lucide-react"

type Infrastructure = {
  connections: {
    total: number
    healthy: number
    errors: number
  }

  routes: {
    total: number
  }

  destinations: {
    total: number
    healthy: number
    paused: number
    delivered: number
    failed: number
  }

  aggregation: {
    total: number
    enabled: number
    events_processed: number
    batches_created: number
    duplicates_skipped: number
  }

  tunnels: {
    total: number
    active: number
    inactive: number
    requests: number
  }
}

type Props = {
  infrastructure?: Infrastructure | null
}

const STATUS = {
  HEALTHY: "healthy",
  WARNING: "warning",
  NEUTRAL: "neutral",
} as const

type Status = (typeof STATUS)[keyof typeof STATUS]

type Row = {
  label: string
  href: string
  icon: typeof PlugZap
  value: string
  detail: string
  status: Status
  ratio?: number
}

const statusRank: Record<Status, number> = {
  [STATUS.WARNING]: 0,
  [STATUS.HEALTHY]: 1,
  [STATUS.NEUTRAL]: 2,
}

const statusStyles: Record<
  Status,
  { dot: string; bar: string; text: string }
> = {
  [STATUS.HEALTHY]: {
    dot: "bg-emerald-500",
    bar: "from-emerald-500 to-emerald-400",
    text: "text-emerald-400",
  },
  [STATUS.WARNING]: {
    dot: "bg-orange-500",
    bar: "from-orange-500 to-orange-400",
    text: "text-orange-400",
  },
  [STATUS.NEUTRAL]: {
    dot: "bg-muted-foreground",
    bar: "from-white/25 to-white/10",
    text: "text-muted-foreground",
  },
}

export function InfrastructureOverview({
  infrastructure,
}: Props) {
  if (!infrastructure) {
    return null
  }

  const {
    connections,
    routes,
    destinations,
    aggregation,
    tunnels,
  } = infrastructure

  const rows: Row[] = [
    {
      label: "Connections",
      href: "/connections",
      icon: PlugZap,
      value: `${connections.healthy}/${connections.total}`,
      detail:
        connections.errors > 0
          ? `${connections.errors} need attention`
          : "All connected",
      status:
        connections.errors > 0
          ? STATUS.WARNING
          : STATUS.HEALTHY,
      ratio:
        connections.total > 0
          ? (connections.healthy / connections.total) * 100
          : undefined,
    },

    {
      label: "Destinations",
      href: "/delivery-targets",
      icon: Radio,
      value: `${destinations.healthy}/${destinations.total}`,
      detail:
        destinations.paused > 0
          ? `${destinations.paused} paused`
          : "All destinations active",
      status:
        destinations.paused > 0
          ? STATUS.WARNING
          : destinations.total > 0
            ? STATUS.HEALTHY
            : STATUS.NEUTRAL,
      ratio:
        destinations.total > 0
          ? (destinations.healthy / destinations.total) * 100
          : undefined,
    },

    {
      label: "Aggregation",
      href: "/bulk-aggregation",
      icon: Layers3,
      value: `${aggregation.enabled}/${aggregation.total}`,
      detail: `${aggregation.events_processed.toLocaleString()} events processed`,
      status:
        aggregation.enabled > 0
          ? STATUS.HEALTHY
          : STATUS.NEUTRAL,
      ratio:
        aggregation.total > 0
          ? (aggregation.enabled / aggregation.total) * 100
          : undefined,
    },

    {
      label: "Tunnels",
      href: "/dev-mode",
      icon: GitBranch,
      value: `${tunnels.active}/${tunnels.total}`,
      detail:
        tunnels.requests > 0
          ? `${tunnels.requests.toLocaleString()} requests`
          : "No tunnel traffic",
      status:
        tunnels.active > 0
          ? STATUS.HEALTHY
          : STATUS.NEUTRAL,
      ratio:
        tunnels.total > 0
          ? (tunnels.active / tunnels.total) * 100
          : undefined,
    },

    {
      label: "Routes",
      href: "/routes",
      icon: Cable,
      value: routes.total.toLocaleString(),
      detail: "Configured webhook routes",
      status: STATUS.NEUTRAL,
    },
  ]

  rows.sort(
    (a, b) => statusRank[a.status] - statusRank[b.status]
  )

  const attentionCount = rows.filter(
    (row) => row.status === STATUS.WARNING
  ).length

  const overall =
    attentionCount > 0
      ? {
          label: `${attentionCount} ${
            attentionCount === 1 ? "system needs" : "systems need"
          } attention`,
          tone: STATUS.WARNING,
        }
      : {
          label: "All systems operational",
          tone: STATUS.HEALTHY,
        }

  const overallStyles = statusStyles[overall.tone]

  return (
    <section className="rounded-2xl border border-border bg-surface-1 p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
            <Activity
              className="h-4 w-4 text-orange-400"
              aria-hidden="true"
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold">
              Infrastructure
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Current state of your webhook infrastructure
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
            overall.tone === STATUS.WARNING
              ? "border-orange-500/20 bg-orange-500/10"
              : "border-emerald-500/20 bg-emerald-500/10"
          } ${overallStyles.text}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              overallStyles.dot
            } ${
              overall.tone === STATUS.WARNING
                ? "animate-pulse"
                : ""
            }`}
            aria-hidden="true"
          />

          {overall.label}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        {rows.map((row, index) => {
          const styles = statusStyles[row.status]
          const Icon = row.icon

          return (
            <Link
              key={row.label}
              href={row.href}
              className={`group flex items-center gap-4 bg-background/20 px-4 py-3.5 transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500/40 ${
                index > 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/40 transition-transform group-hover:scale-105">
                <Icon
                  className="h-4 w-4 text-orange-400"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {row.label}
                  </p>

                  {row.status === STATUS.WARNING && (
                    <span className="inline-flex shrink-0 items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-orange-400">
                      Attention
                    </span>
                  )}
                </div>

                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {row.detail}
                </p>
              </div>

              <div className="hidden w-28 shrink-0 sm:block">
                {row.ratio != null ? (
                  <div
                    className="h-1 overflow-hidden rounded-full bg-white/[0.04]"
                    role="progressbar"
                    aria-label={`${row.label} health`}
                    aria-valuenow={Math.round(row.ratio)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${styles.bar} transition-all duration-500`}
                      style={{
                        width: `${row.ratio}%`,
                      }}
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-semibold tabular-nums">
                  {row.value}
                </span>

                <ArrowRight
                  className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}