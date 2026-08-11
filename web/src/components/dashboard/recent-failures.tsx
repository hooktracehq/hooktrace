// "use client"

// import Link from "next/link"

// import {
//   AlertTriangle,
//   ArrowRight,
//   RotateCcw,
// } from "lucide-react"

// import type {
//   DashboardFailure,
// } from "@/hooks/dashboard/use-dashboard-overview"

// type Props = {
//   failures?: DashboardFailure[] | null
// }

// export function RecentFailures({
//   failures = [],
// }: Props) {
//   const safeFailures =
//     Array.isArray(failures)
//       ? failures
//       : []

//   return (
//     <div>

//       <div className="mb-5 flex items-center justify-between gap-4">

//         <div className="flex min-w-0 items-center gap-3">

//           <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
//             <AlertTriangle className="h-4 w-4 text-rose-400" />
//           </div>

//           <div className="min-w-0">

//             <h2 className="text-sm font-semibold">
//               Recent Failures
//             </h2>

//             <p className="mt-0.5 text-xs text-muted-foreground">
//               Deliveries requiring attention
//             </p>

//           </div>

//         </div>

//         <Link
//           href="/events"
//           className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
//         >
//           View all
//           <ArrowRight className="h-3.5 w-3.5" />
//         </Link>

//       </div>

//       {safeFailures.length === 0 ? (
//         <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/[0.025] p-5">

//           <div className="text-center">

//             <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
//               <span className="text-sm font-medium text-emerald-400">
//                 ✓
//               </span>
//             </div>

//             <p className="mt-3 text-sm font-medium text-emerald-400">
//               No recent failures
//             </p>

//             <p className="mt-1 text-xs text-muted-foreground">
//               Your webhook deliveries are healthy.
//             </p>

//           </div>

//         </div>
//       ) : (
//         <div className="space-y-2">

//           {safeFailures.slice(0, 5).map((failure) => {

//             const retryCount =
//               Number(failure.retry_count) || 0

//             const isRetrying =
//               retryCount > 0 ||
//               failure.status === "retrying"

//             return (
//               <Link
//                 key={failure.id}
//                 href={`/events?id=${failure.id}`}
//                 className="group block rounded-xl border border-border bg-background/20 p-3.5 transition-colors hover:border-rose-500/20 hover:bg-rose-500/[0.025]"
//               >

//                 <div className="flex items-start justify-between gap-3">

//                   <div className="min-w-0">

//                     <div className="flex flex-wrap items-center gap-2">

//                       <span className="truncate text-sm font-medium">
//                         {failure.route ||
//                           failure.event_type ||
//                           "Webhook event"}
//                       </span>

//                       {isRetrying && (
//                         <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-orange-400">
//                           <RotateCcw className="h-2.5 w-2.5" />
//                           retrying
//                         </span>
//                       )}

//                     </div>

//                     <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">

//                       <span>
//                         {failure.provider || "unknown"}
//                       </span>

//                       <span>·</span>

//                       <span>
//                         {failure.event_type || "unknown"}
//                       </span>

//                       <span>·</span>

//                       <span>
//                         {formatTime(failure.created_at)}
//                       </span>

//                     </div>

//                     {failure.last_error && (
//                       <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-rose-400/80">
//                         {failure.last_error}
//                       </p>
//                     )}

//                     <div className="mt-2.5 flex items-center gap-3 text-[10px] text-muted-foreground">

//                       <span>
//                         Attempt {failure.attempt_count ?? 0}
//                       </span>

//                       <span>
//                         Retries {retryCount}
//                       </span>

//                       {failure.latency_ms != null && (
//                         <span>
//                           {failure.latency_ms}ms
//                         </span>
//                       )}

//                     </div>

//                   </div>

//                   <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />

//                 </div>

//               </Link>
//             )
//           })}

//         </div>
//       )}

//     </div>
//   )
// }

// function formatTime(
//   value: string | null | undefined
// ) {
//   if (!value) {
//     return "—"
//   }

//   const date = new Date(value)

//   if (Number.isNaN(date.getTime())) {
//     return "—"
//   }

//   return date.toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   })
// }




"use client"

import Link from "next/link"

import {
  AlertTriangle,
  ArrowRight,
  RotateCcw,
} from "lucide-react"

import type {
  DashboardFailure,
} from "@/hooks/dashboard/use-dashboard-overview"

type Props = {
  failures?: DashboardFailure[] | null
}

export function RecentFailures({
  failures = [],
}: Props) {
  const safeFailures =
    Array.isArray(failures)
      ? failures
      : []

  return (
    <div>

      <div className="mb-5 flex items-center justify-between gap-4">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
            <AlertTriangle className="h-4 w-4 text-rose-400" aria-hidden="true" />
          </div>

          <div className="min-w-0">

            <h2 className="text-sm font-semibold">
              Recent Failures
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Deliveries requiring attention
            </p>

          </div>

        </div>

        <Link
          href="/events"
          className="flex shrink-0 items-center gap-1 rounded-md text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>

      </div>

      {safeFailures.length === 0 ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/[0.025] p-5">

          <div className="text-center">

            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <span className="text-sm font-medium text-emerald-400" aria-hidden="true">
                ✓
              </span>
            </div>

            <p className="mt-3 text-sm font-medium text-emerald-400">
              No recent failures
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Your webhook deliveries are healthy.
            </p>

          </div>

        </div>
      ) : (
        <div className="space-y-2">

          {safeFailures.slice(0, 5).map((failure) => {

            const retryCount =
              Number(failure.retry_count) || 0

            const isRetrying =
              retryCount > 0 ||
              failure.status === "retrying"

            return (
              <Link
                key={failure.id}
                href={`/events?id=${failure.id}`}
                className="group block rounded-xl border border-border bg-background/20 p-3.5 transition-colors hover:border-rose-500/20 hover:bg-rose-500/[0.025] focus-visible:outline-none focus-visible:border-rose-500/30 focus-visible:bg-rose-500/[0.025] focus-visible:ring-2 focus-visible:ring-rose-500/40"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="truncate text-sm font-medium">
                        {failure.route ||
                          failure.event_type ||
                          "Webhook event"}
                      </span>

                      {isRetrying && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-orange-400">
                          <RotateCcw className="h-2.5 w-2.5" aria-hidden="true" />
                          retrying
                        </span>
                      )}

                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">

                      <span>
                        {failure.provider || "unknown"}
                      </span>

                      <span>·</span>

                      <span>
                        {failure.event_type || "unknown"}
                      </span>

                      <span>·</span>

                      <span>
                        {formatTime(failure.created_at)}
                      </span>

                    </div>

                    {failure.last_error && (
                      <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-rose-400/80">
                        {failure.last_error}
                      </p>
                    )}

                    <div className="mt-2.5 flex items-center gap-3 text-[10px] text-muted-foreground">

                      <span>
                        Attempt {failure.attempt_count ?? 0}
                      </span>

                      <span>
                        Retries {retryCount}
                      </span>

                      {failure.latency_ms != null && (
                        <span>
                          {failure.latency_ms}ms
                        </span>
                      )}

                    </div>

                  </div>

                  <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />

                </div>

              </Link>
            )
          })}

        </div>
      )}

    </div>
  )
}

function formatTime(
  value: string | null | undefined
) {
  if (!value) {
    return "—"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}