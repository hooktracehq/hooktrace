// "use client"

// import {
//   CheckCircle2,
//   Clock3,
//   Database,
//   Radio,
//   RotateCcw,
// } from "lucide-react"

// import type { Event } from "@/types/event"

// type Props = {
//   event: Event | null
// }

// const timeline = [
//   {
//     label: "Received",
//     icon: Radio,
//   },
//   {
//     label: "Validated",
//     icon: CheckCircle2,
//   },
//   {
//     label: "Queued",
//     icon: Database,
//   },
//   {
//     label: "Delivered",
//     icon: RotateCcw,
//   },
// ]

// export function EventTimeline({
//   event,
// }: Props) {
//   if (!event) {
//     return (
//       <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
//         No event selected
//       </div>
//     )
//   }

//   return (
//     <div className="flex h-full flex-col">

//       {/* Header */}
//       <div className="border-b border-border px-4 py-3">
//         <h2 className="text-sm font-semibold">
//           Event Timeline
//         </h2>
//       </div>

//       {/* Timeline */}
//       <div className="flex flex-1 items-center justify-between px-6">

//         {timeline.map((item, index) => {
//           const Icon = item.icon

//           return (
//             <div
//               key={item.label}
//               className="flex flex-1 items-center"
//             >
//               <div className="flex flex-col items-center gap-2">

//                 <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-1">
//                   <Icon className="h-4 w-4 text-primary" />
//                 </div>

//                 <div className="text-center">
//                   <p className="text-xs font-medium">
//                     {item.label}
//                   </p>

//                   <p className="mt-1 text-[11px] text-muted-foreground">
//                     completed
//                   </p>
//                 </div>
//               </div>

//               {index !==
//                 timeline.length - 1 && (
//                 <div className="mx-4 h-px flex-1 bg-border" />
//               )}
//             </div>
//           )
//         })}
//       </div>

//       {/* Footer */}
//       <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
//         Event lifecycle visualization
//       </div>
//     </div>
//   )
// }


"use client"

import {
  CheckCircle2,
  Clock3,
  Database,
  Radio,
  RotateCcw,
  XCircle,
} from "lucide-react"

import type { Event } from "@/types/event"

type Props = {
  event: Event | null
}

export function EventTimeline({
  event,
}: Props) {
  if (!event) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No event selected
      </div>
    )
  }

  const timeline = [
    {
      label: "Webhook Received",
      icon: Radio,
      status: "success",
      time: event.created_at,
    },
    {
      label: "Validated",
      icon: CheckCircle2,
      status: "success",
      time: event.created_at,
    },
    {
      label: "Queued",
      icon: Database,
      status: "success",
      time: event.created_at,
    },
    {
      label: "Delivery Attempt",
      icon:
        event.status === "failed"
          ? XCircle
          : RotateCcw,
      status: event.status,
      time: event.created_at,
    },
  ]

  return (
    <div className="flex h-full flex-col">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">

        <div className="flex items-center gap-2">

          <Clock3 className="h-4 w-4 text-primary" />

          <h2 className="text-sm font-semibold">
            Event Timeline
          </h2>

        </div>

        <div className="text-xs text-muted-foreground">
          lifecycle trace
        </div>

      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto p-6">

        <div className="relative ml-4 border-l border-border">

          {timeline.map(
            (item, index) => {
              const Icon = item.icon

              return (
                <div
                  key={item.label}
                  className="relative mb-8 ml-6"
                >

                  {/* Dot */}
                  <div
                    className="
                      absolute
                      -left-[31px]
                      top-1
                      flex
                      h-4
                      w-4
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-border
                      bg-background
                    "
                  >
                    <div
                      className={`
                        h-2 w-2 rounded-full
                        ${
                          item.status ===
                          "failed"
                            ? "bg-red-500"
                            : "bg-emerald-500"
                        }
                      `}
                    />
                  </div>

                  {/* Card */}
                  <div className="rounded-xl border border-border bg-surface-1 p-4">

                    <div className="flex items-start justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background">

                          <Icon className="h-4 w-4 text-primary" />

                        </div>

                        <div>

                          <p className="text-sm font-medium">
                            {item.label}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(
                              item.time
                            ).toLocaleString()}
                          </p>

                        </div>

                      </div>

                      <div
                        className={`
                          rounded-full
                          px-2 py-1
                          text-[10px]
                          font-medium
                          uppercase
                          tracking-wide
                          ${
                            item.status ===
                            "failed"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-emerald-500/10 text-emerald-400"
                          }
                        `}
                      >
                        {item.status}
                      </div>

                    </div>

                  </div>

                </div>
              )
            }
          )}

        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">

        Event #{event.id}

      </div>
    </div>
  )
}