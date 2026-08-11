// "use client"

// import Link from "next/link"

// import {
//   Cable,
//   GitBranch,
//   Layers3,
//   PlugZap,
//   Radio,
//   ArrowRight,
// } from "lucide-react"

// type Infrastructure = {
//   connections: {
//     total: number
//     healthy: number
//     errors: number
//   }

//   routes: {
//     total: number
//   }

//   destinations: {
//     total: number
//     healthy: number
//     paused: number
//     delivered: number
//     failed: number
//   }

//   aggregation: {
//     total: number
//     enabled: number
//     events_processed: number
//     batches_created: number
//     duplicates_skipped: number
//   }

//   tunnels: {
//     total: number
//     active: number
//     inactive: number
//     requests: number
//   }
// }

// type Props = {
//   infrastructure?: Infrastructure | null
// }

// type ItemProps = {
//   label: string
//   href: string
//   icon: typeof PlugZap
//   value: string
//   detail: string
//   status?: "healthy" | "warning" | "neutral"
// }

// function InfrastructureItem({
//   label,
//   href,
//   icon: Icon,
//   value,
//   detail,
//   status = "neutral",
// }: ItemProps) {
//   const statusClass = {
//     healthy: "bg-emerald-500",
//     warning: "bg-orange-500",
//     neutral: "bg-muted-foreground",
//   }[status]

//   return (
//     <Link
//       href={href}
//       className="group rounded-xl border border-border bg-background/20 p-4 transition-colors hover:border-border/80 hover:bg-white/[0.02]"
//     >
//       <div className="flex items-start justify-between gap-4">
//         <div className="flex min-w-0 items-center gap-3">
//           <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/40">
//             <Icon className="h-4 w-4 text-orange-400" />
//           </div>

//           <div className="min-w-0">
//             <p className="text-sm font-medium">
//               {label}
//             </p>

//             <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
//               {detail}
//             </p>
//           </div>
//         </div>

//         <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
//       </div>

//       <div className="mt-4 flex items-center gap-2">
//         <span
//           className={`h-1.5 w-1.5 rounded-full ${statusClass}`}
//         />

//         <span className="text-sm font-semibold tabular-nums">
//           {value}
//         </span>
//       </div>
//     </Link>
//   )
// }

// export function InfrastructureOverview({
//   infrastructure,
// }: Props) {
//   if (!infrastructure) {
//     return null
//   }

//   const connections = infrastructure.connections
//   const routes = infrastructure.routes
//   const destinations = infrastructure.destinations
//   const aggregation = infrastructure.aggregation
//   const tunnels = infrastructure.tunnels

//   return (
//     <section>
//       <div className="mb-5">
//         <h2 className="text-sm font-semibold">
//           Infrastructure
//         </h2>

//         <p className="mt-1 text-xs text-muted-foreground">
//           Current state of your webhook infrastructure
//         </p>
//       </div>

//       <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
//         <InfrastructureItem
//           label="Connections"
//           href="/connections"
//           icon={PlugZap}
//           value={`${connections.healthy}/${connections.total}`}
//           detail={
//             connections.errors > 0
//               ? `${connections.errors} need attention`
//               : "All connected"
//           }
//           status={
//             connections.errors > 0
//               ? "warning"
//               : "healthy"
//           }
//         />

//         <InfrastructureItem
//           label="Routes"
//           href="/routes"
//           icon={Cable}
//           value={routes.total.toLocaleString()}
//           detail="Configured webhook routes"
//           status="neutral"
//         />

//         <InfrastructureItem
//           label="Destinations"
//           href="/delivery-targets"
//           icon={Radio}
//           value={`${destinations.healthy}/${destinations.total}`}
//           detail={
//             destinations.paused > 0
//               ? `${destinations.paused} paused`
//               : "All destinations active"
//           }
//           status={
//             destinations.paused > 0
//               ? "warning"
//               : destinations.total > 0
//                 ? "healthy"
//                 : "neutral"
//           }
//         />

//         <InfrastructureItem
//           label="Aggregation"
//           href="/bulk-aggregation"
//           icon={Layers3}
//           value={`${aggregation.enabled}/${aggregation.total}`}
//           detail={`${aggregation.events_processed.toLocaleString()} events processed`}
//           status={
//             aggregation.enabled > 0
//               ? "healthy"
//               : "neutral"
//           }
//         />

//         <InfrastructureItem
//           label="Tunnels"
//           href="/dev-mode"
//           icon={GitBranch}
//           value={`${tunnels.active}/${tunnels.total}`}
//           detail={
//             tunnels.requests > 0
//               ? `${tunnels.requests.toLocaleString()} requests`
//               : "No tunnel traffic"
//           }
//           status={
//             tunnels.active > 0
//               ? "healthy"
//               : "neutral"
//           }
//         />
//       </div>
//     </section>
//   )
// }



// "use client"

// import Link from "next/link"

// import {
//   Cable,
//   GitBranch,
//   Layers3,
//   PlugZap,
//   Radio,
//   ArrowRight,
// } from "lucide-react"

// type Infrastructure = {
//   connections: {
//     total: number
//     healthy: number
//     errors: number
//   }

//   routes: {
//     total: number
//   }

//   destinations: {
//     total: number
//     healthy: number
//     paused: number
//     delivered: number
//     failed: number
//   }

//   aggregation: {
//     total: number
//     enabled: number
//     events_processed: number
//     batches_created: number
//     duplicates_skipped: number
//   }

//   tunnels: {
//     total: number
//     active: number
//     inactive: number
//     requests: number
//   }
// }

// type Props = {
//   infrastructure?: Infrastructure | null
// }

// type ItemProps = {
//   label: string
//   href: string
//   icon: typeof PlugZap
//   value: string
//   detail: string
//   status?: "healthy" | "warning" | "neutral"
// }

// function InfrastructureItem({
//   label,
//   href,
//   icon: Icon,
//   value,
//   detail,
//   status = "neutral",
// }: ItemProps) {
//   const statusClass = {
//     healthy: "bg-emerald-500",
//     warning: "bg-orange-500",
//     neutral: "bg-muted-foreground",
//   }[status]

//   return (
//     <Link
//       href={href}
//       className="group rounded-xl border border-border bg-background/20 p-4 transition-colors hover:border-border/80 hover:bg-white/[0.02] focus-visible:outline-none focus-visible:border-border/80 focus-visible:bg-white/[0.02] focus-visible:ring-2 focus-visible:ring-orange-500/40"
//     >
//       <div className="flex items-start justify-between gap-4">
//         <div className="flex min-w-0 items-center gap-3">
//           <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/40">
//             <Icon className="h-4 w-4 text-orange-400" aria-hidden="true" />
//           </div>

//           <div className="min-w-0">
//             <p className="text-sm font-medium">
//               {label}
//             </p>

//             <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
//               {detail}
//             </p>
//           </div>
//         </div>

//         <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
//       </div>

//       <div className="mt-4 flex items-center gap-2">
//         <span
//           className={`h-1.5 w-1.5 rounded-full ${statusClass}`}
//           aria-hidden="true"
//         />

//         <span className="text-sm font-semibold tabular-nums">
//           {value}
//         </span>
//       </div>
//     </Link>
//   )
// }

// export function InfrastructureOverview({
//   infrastructure,
// }: Props) {
//   if (!infrastructure) {
//     return null
//   }

//   const connections = infrastructure.connections
//   const routes = infrastructure.routes
//   const destinations = infrastructure.destinations
//   const aggregation = infrastructure.aggregation
//   const tunnels = infrastructure.tunnels

//   return (
//     <section>
//       <div className="mb-5">
//         <h2 className="text-sm font-semibold">
//           Infrastructure
//         </h2>

//         <p className="mt-1 text-xs text-muted-foreground">
//           Current state of your webhook infrastructure
//         </p>
//       </div>

//       <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
//         <InfrastructureItem
//           label="Connections"
//           href="/connections"
//           icon={PlugZap}
//           value={`${connections.healthy}/${connections.total}`}
//           detail={
//             connections.errors > 0
//               ? `${connections.errors} need attention`
//               : "All connected"
//           }
//           status={
//             connections.errors > 0
//               ? "warning"
//               : "healthy"
//           }
//         />

//         <InfrastructureItem
//           label="Routes"
//           href="/routes"
//           icon={Cable}
//           value={routes.total.toLocaleString()}
//           detail="Configured webhook routes"
//           status="neutral"
//         />

//         <InfrastructureItem
//           label="Destinations"
//           href="/delivery-targets"
//           icon={Radio}
//           value={`${destinations.healthy}/${destinations.total}`}
//           detail={
//             destinations.paused > 0
//               ? `${destinations.paused} paused`
//               : "All destinations active"
//           }
//           status={
//             destinations.paused > 0
//               ? "warning"
//               : destinations.total > 0
//                 ? "healthy"
//                 : "neutral"
//           }
//         />

//         <InfrastructureItem
//           label="Aggregation"
//           href="/bulk-aggregation"
//           icon={Layers3}
//           value={`${aggregation.enabled}/${aggregation.total}`}
//           detail={`${aggregation.events_processed.toLocaleString()} events processed`}
//           status={
//             aggregation.enabled > 0
//               ? "healthy"
//               : "neutral"
//           }
//         />

//         <InfrastructureItem
//           label="Tunnels"
//           href="/dev-mode"
//           icon={GitBranch}
//           value={`${tunnels.active}/${tunnels.total}`}
//           detail={
//             tunnels.requests > 0
//               ? `${tunnels.requests.toLocaleString()} requests`
//               : "No tunnel traffic"
//           }
//           status={
//             tunnels.active > 0
//               ? "healthy"
//               : "neutral"
//           }
//         />
//       </div>
//     </section>
//   )
// }








// "use client"

// import Link from "next/link"

// import {
//   Cable,
//   ChevronRight,
//   GitBranch,
//   Layers3,
//   Network,
//   PlugZap,
//   Radio,
// } from "lucide-react"

// type Infrastructure = {
//   connections: {
//     total: number
//     healthy: number
//     errors: number
//   }

//   routes: {
//     total: number
//   }

//   destinations: {
//     total: number
//     healthy: number
//     paused: number
//     delivered: number
//     failed: number
//   }

//   aggregation: {
//     total: number
//     enabled: number
//     events_processed: number
//     batches_created: number
//     duplicates_skipped: number
//   }

//   tunnels: {
//     total: number
//     active: number
//     inactive: number
//     requests: number
//   }
// }

// type Props = {
//   infrastructure?: Infrastructure | null
// }

// type Status = "healthy" | "warning" | "neutral"

// type Row = {
//   label: string
//   href: string
//   icon: typeof PlugZap
//   value: string
//   detail: string
//   status: Status
//   // 0–100, omitted where a ratio isn't meaningful (e.g. Routes is a plain count)
//   ratio?: number
// }

// const statusRank: Record<Status, number> = {
//   warning: 0,
//   healthy: 1,
//   neutral: 2,
// }

// const statusStyles: Record<
//   Status,
//   { dot: string; bar: string; text: string }
// > = {
//   healthy: {
//     dot: "bg-emerald-500",
//     bar: "from-emerald-500 to-emerald-400",
//     text: "text-emerald-400",
//   },
//   warning: {
//     dot: "bg-orange-500",
//     bar: "from-orange-500 to-orange-400",
//     text: "text-orange-400",
//   },
//   neutral: {
//     dot: "bg-muted-foreground",
//     bar: "from-white/25 to-white/10",
//     text: "text-muted-foreground",
//   },
// }

// export function InfrastructureOverview({
//   infrastructure,
// }: Props) {
//   if (!infrastructure) {
//     return null
//   }

//   const { connections, routes, destinations, aggregation, tunnels } =
//     infrastructure

//   const rows: Row[] = [
//     {
//       label: "Connections",
//       href: "/connections",
//       icon: PlugZap,
//       value: `${connections.healthy}/${connections.total}`,
//       detail:
//         connections.errors > 0
//           ? `${connections.errors} need attention`
//           : "All connected",
//       status: connections.errors > 0 ? "warning" : "healthy",
//       ratio:
//         connections.total > 0
//           ? (connections.healthy / connections.total) * 100
//           : undefined,
//     },
//     {
//       label: "Destinations",
//       href: "/delivery-targets",
//       icon: Radio,
//       value: `${destinations.healthy}/${destinations.total}`,
//       detail:
//         destinations.paused > 0
//           ? `${destinations.paused} paused`
//           : "All destinations active",
//       status:
//         destinations.paused > 0
//           ? "warning"
//           : destinations.total > 0
//             ? "healthy"
//             : "neutral",
//       ratio:
//         destinations.total > 0
//           ? (destinations.healthy / destinations.total) * 100
//           : undefined,
//     },
//     {
//       label: "Aggregation",
//       href: "/bulk-aggregation",
//       icon: Layers3,
//       value: `${aggregation.enabled}/${aggregation.total}`,
//       detail: `${aggregation.events_processed.toLocaleString()} events processed`,
//       status: aggregation.enabled > 0 ? "healthy" : "neutral",
//       ratio:
//         aggregation.total > 0
//           ? (aggregation.enabled / aggregation.total) * 100
//           : undefined,
//     },
//     {
//       label: "Tunnels",
//       href: "/dev-mode",
//       icon: GitBranch,
//       value: `${tunnels.active}/${tunnels.total}`,
//       detail:
//         tunnels.requests > 0
//           ? `${tunnels.requests.toLocaleString()} requests`
//           : "No tunnel traffic",
//       status: tunnels.active > 0 ? "healthy" : "neutral",
//       ratio:
//         tunnels.total > 0
//           ? (tunnels.active / tunnels.total) * 100
//           : undefined,
//     },
//     {
//       label: "Routes",
//       href: "/routes",
//       icon: Cable,
//       value: routes.total.toLocaleString(),
//       detail: "Configured webhook routes",
//       status: "neutral",
//     },
//   ].sort((a, b) => statusRank[a.status] - statusRank[b.status])

//   const attentionCount = rows.filter(
//     (row) => row.status === "warning"
//   ).length

//   const overall =
//     attentionCount > 0
//       ? {
//           label: `${attentionCount} ${attentionCount === 1 ? "system needs" : "systems need"} attention`,
//           tone: "warning" as const,
//         }
//       : {
//           label: "All systems operational",
//           tone: "healthy" as const,
//         }

//   const overallStyles = statusStyles[overall.tone]

//   return (
//     <section className="rounded-2xl border border-border bg-surface-1 p-6">
//       <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
//         <div className="flex items-center gap-3">
//           <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
//             <Network className="h-4 w-4 text-orange-400" aria-hidden="true" />
//           </div>

//           <div>
//             <h2 className="text-sm font-semibold">Infrastructure</h2>

//             <p className="mt-0.5 text-xs text-muted-foreground">
//               Current state of your webhook infrastructure
//             </p>
//           </div>
//         </div>

//         <div
//           className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
//             overall.tone === "warning"
//               ? "border-orange-500/20 bg-orange-500/10"
//               : "border-emerald-500/20 bg-emerald-500/10"
//           } ${overallStyles.text}`}
//         >
//           <span
//             className={`h-1.5 w-1.5 rounded-full ${overallStyles.dot} ${
//               overall.tone === "warning" ? "animate-pulse" : ""
//             }`}
//             aria-hidden="true"
//           />
//           {overall.label}
//         </div>
//       </div>

//       <div className="overflow-hidden rounded-xl border border-border">
//         {rows.map((row, index) => {
//           const styles = statusStyles[row.status]

//           return (
//             <Link
//               key={row.label}
//               href={row.href}
//               className={`group flex items-center gap-4 bg-background/20 px-4 py-3.5 transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500/40 ${
//                 index > 0 ? "border-t border-border" : ""
//               }`}
//             >
//               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/40 transition-transform group-hover:scale-105">
//                 <row.icon className="h-4 w-4 text-orange-400" aria-hidden="true" />
//               </div>

//               <div className="min-w-0 flex-1">
//                 <div className="flex items-center gap-2">
//                   <p className="text-sm font-medium">{row.label}</p>

//                   {row.status === "warning" && (
//                     <span className="inline-flex shrink-0 items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-orange-400">
//                       Attention
//                     </span>
//                   )}
//                 </div>

//                 <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
//                   {row.detail}
//                 </p>
//               </div>

//               <div className="hidden w-28 shrink-0 sm:block">
//                 {row.ratio != null ? (
//                   <div
//                     className="h-1 overflow-hidden rounded-full bg-white/[0.04]"
//                     role="progressbar"
//                     aria-label={`${row.label} health`}
//                     aria-valuenow={Math.round(row.ratio)}
//                     aria-valuemin={0}
//                     aria-valuemax={100}
//                   >
//                     <div
//                       className={`h-full rounded-full bg-gradient-to-r ${styles.bar} transition-all duration-500`}
//                       style={{ width: `${row.ratio}%` }}
//                     />
//                   </div>
//                 ) : null}
//               </div>

//               <div className="flex shrink-0 items-center gap-3">
//                 <span className="text-sm font-semibold tabular-nums">
//                   {row.value}
//                 </span>

//                 <ChevronRight
//                   className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
//                   aria-hidden="true"
//                 />
//               </div>
//             </Link>
//           )
//         })}
//       </div>
//     </section>
//   )
// }






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

type Status = "healthy" | "warning" | "neutral"

type Row = {
  label: string
  href: string
  icon: typeof PlugZap
  value: string
  detail: string
  status: Status
  // 0–100, omitted where a ratio isn't meaningful (e.g. Routes is a plain count)
  ratio?: number
}

const statusRank: Record<Status, number> = {
  warning: 0,
  healthy: 1,
  neutral: 2,
}

const statusStyles: Record<
  Status,
  { dot: string; bar: string; text: string }
> = {
  healthy: {
    dot: "bg-emerald-500",
    bar: "from-emerald-500 to-emerald-400",
    text: "text-emerald-400",
  },
  warning: {
    dot: "bg-orange-500",
    bar: "from-orange-500 to-orange-400",
    text: "text-orange-400",
  },
  neutral: {
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

  const { connections, routes, destinations, aggregation, tunnels } =
    infrastructure

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
      status: connections.errors > 0 ? "warning" : "healthy",
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
          ? "warning"
          : destinations.total > 0
            ? "healthy"
            : "neutral",
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
      status: aggregation.enabled > 0 ? "healthy" : "neutral",
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
      status: tunnels.active > 0 ? "healthy" : "neutral",
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
      status: "neutral",
    },
  ].sort((a, b) => statusRank[a.status] - statusRank[b.status])

  const attentionCount = rows.filter(
    (row) => row.status === "warning"
  ).length

  const overall =
    attentionCount > 0
      ? {
          label: `${attentionCount} ${attentionCount === 1 ? "system needs" : "systems need"} attention`,
          tone: "warning" as const,
        }
      : {
          label: "All systems operational",
          tone: "healthy" as const,
        }

  const overallStyles = statusStyles[overall.tone]

  return (
    <section className="rounded-2xl border border-border bg-surface-1 p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
            <Activity className="h-4 w-4 text-orange-400" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-sm font-semibold">Infrastructure</h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Current state of your webhook infrastructure
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
            overall.tone === "warning"
              ? "border-orange-500/20 bg-orange-500/10"
              : "border-emerald-500/20 bg-emerald-500/10"
          } ${overallStyles.text}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${overallStyles.dot} ${
              overall.tone === "warning" ? "animate-pulse" : ""
            }`}
            aria-hidden="true"
          />
          {overall.label}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        {rows.map((row, index) => {
          const styles = statusStyles[row.status]

          return (
            <Link
              key={row.label}
              href={row.href}
              className={`group flex items-center gap-4 bg-background/20 px-4 py-3.5 transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500/40 ${
                index > 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/40 transition-transform group-hover:scale-105">
                <row.icon className="h-4 w-4 text-orange-400" aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{row.label}</p>

                  {row.status === "warning" && (
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
                      style={{ width: `${row.ratio}%` }}
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