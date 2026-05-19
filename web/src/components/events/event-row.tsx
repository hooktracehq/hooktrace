// "use client"

// import { formatDistanceToNow } from "date-fns"

// import {
//   AlertTriangle,
//   CheckCircle2,
//   Clock3,
// } from "lucide-react"

// import { cn } from "@/lib/utils"

// import type { Event } from "@/types/event"

// type Props = {
//   event: Event
//   selected?: boolean
//   onClick?: () => void
// }

// function StatusIcon({
//   status,
// }: {
//   status: string
// }) {
//   if (status === "delivered") {
//     return (
//       <CheckCircle2 className="h-4 w-4 text-emerald-500" />
//     )
//   }

//   if (status === "failed") {
//     return (
//       <AlertTriangle className="h-4 w-4 text-rose-500" />
//     )
//   }

//   return (
//     <Clock3 className="h-4 w-4 text-amber-500" />
//   )
// }

// export function EventRow({
//   event,
//   selected,
//   onClick,
// }: Props) {
//   return (
//     <button
//       onClick={onClick}
//       className={cn(
//         "grid h-[58px] w-full grid-cols-[120px_1fr_120px_120px_140px] items-center border-b border-border px-4 text-left transition-all",
//         selected
//           ? "bg-accent"
//           : "hover:bg-accent/40"
//       )}
//     >
//       {/* Status */}
//       <div className="flex items-center gap-2">
//         <StatusIcon
//           status={event.status}
//         />

//         <span className="text-xs capitalize text-muted-foreground">
//           {event.status}
//         </span>
//       </div>

//       {/* Route */}
//       <div className="min-w-0">
//         <p className="truncate text-sm font-medium">
//           {event.route}
//         </p>

//         <p className="truncate text-xs text-muted-foreground">
//           {event.event_type ||
//             "unknown.event"}
//         </p>
//       </div>

//       {/* Provider */}
//       <div className="text-xs text-muted-foreground">
//         {event.provider ||
//           "generic"}
//       </div>

//       {/* Attempts */}
//       <div className="text-xs text-muted-foreground">
//         {event.attempt_count ?? 0}
//       </div>

//       {/* Time */}
//       <div className="text-xs text-muted-foreground">
//         {event.created_at
//           ? formatDistanceToNow(
//               new Date(
//                 event.created_at
//               ),
//               {
//                 addSuffix: true,
//               }
//             )
//           : "-"}
//       </div>
//     </button>
//   )
// }



"use client"

import { formatDistanceToNow } from "date-fns"

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Zap,
} from "lucide-react"

import { cn } from "@/lib/utils"

import type { Event } from "@/types/event"

type Props = {
  event: Event
  selected?: boolean
  onClick?: () => void
}

function StatusIcon({
  status,
}: {
  status: string
}) {
  if (
    status === "delivered" ||
    status === "success"
  ) {
    return (
      <div className="relative">
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
    )
  }

  return (
    <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500" />
  )
}

function StatusBadge({
  status,
}: {
  status: string
}) {
  const styles = {
    delivered:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",

    success:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",

    failed:
      "border-rose-500/20 bg-rose-500/10 text-rose-400",

    pending:
      "border-amber-500/20 bg-amber-500/10 text-amber-400",

    retrying:
      "border-amber-500/20 bg-amber-500/10 text-amber-400",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-medium uppercase tracking-wide",
        styles[
          status as keyof typeof styles
        ] ||
          styles.pending
      )}
    >
      {status}
    </div>
  )
}

export function EventRow({
  event,
  selected,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative grid h-[72px] w-full grid-cols-[120px_1fr_120px_120px_140px] items-center border-b border-border px-4 text-left transition-all duration-200",
        selected
          ? "bg-white/[0.04]"
          : "hover:bg-white/[0.03]"
      )}
    >
      {/* glow */}
      {selected && (
        <div className="absolute left-0 top-0 h-full w-[2px] bg-orange-500" />
      )}

      {/* Status */}
      <div className="flex items-center gap-3">
        <StatusIcon
          status={event.status}
        />

        <StatusBadge
          status={event.status}
        />
      </div>

      {/* Route + Type */}
      <div className="min-w-0">

        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-orange-400" />

          <p className="truncate text-sm font-medium text-white">
            {event.route}
          </p>
        </div>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {event.event_type ||
            "unknown.event"}
        </p>
      </div>

      {/* Provider */}
      <div>
        <div className="inline-flex rounded-md border border-border bg-white/[0.03] px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
          {event.provider ||
            "generic"}
        </div>
      </div>

      {/* Attempts */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <RotateCcw className="h-3.5 w-3.5" />

        {event.attempt_count ??
          0}
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock3 className="h-3.5 w-3.5" />

        {event.created_at
          ? formatDistanceToNow(
              new Date(
                event.created_at
              ),
              {
                addSuffix: true,
              }
            )
          : "-"}
      </div>
    </button>
  )
}