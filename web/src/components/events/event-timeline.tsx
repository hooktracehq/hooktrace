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
import { motion } from "framer-motion"

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
      description:
        "Incoming webhook accepted",
      time: event.created_at,
    },
  
    {
      label: "Signature Verified",
      icon: CheckCircle2,
      status: "success",
      description:
        "Payload authenticity verified",
      time: event.created_at,
    },
  
    {
      label: "Queued For Processing",
      icon: Database,
      status: "success",
      description:
        "Event queued internally",
      time: event.created_at,
    },
  
    {
      label:
        event.status === "failed"
          ? "Delivery Failed"
          : event.attempt_count &&
            event.attempt_count > 1
          ? `Retry Attempt #${event.attempt_count}`
          : "Delivery Attempt",
  
      icon:
        event.status === "failed"
          ? XCircle
          : RotateCcw,
  
      status:
        event.status === "failed"
          ? "failed"
          : "success",
  
      description:
        event.status === "failed"
          ? event.last_error ||
            "Target delivery failed"
          : "Delivery pipeline executed",
  
      time: event.created_at,
    },
  
    ...(event.status === "failed"
      ? [
          {
            label: "Moved To DLQ",
            icon: XCircle,
            status: "failed",
            description:
              "Event moved to dead letter queue",
            time: event.created_at,
          },
        ]
      : []),
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

      <div className="relative ml-4 border-l border-border/70">
      <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />

          {timeline.map(
            (item, index) => {
              const Icon = item.icon
              const isLast =
              index === timeline.length - 1

              return (
                <motion.div
  key={item.label}
  initial={{
    opacity: 0,
    y: 10,
  }}
  animate={{
    opacity: 1,
    y: 0,
  }}
  transition={{
    duration: 0.2,
    delay: index * 0.05,
  }}
  
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
                 <div className={`
  rounded-xl border p-4 transition-all
  ${
    isLast
      ? "border-primary/30 bg-primary/5 shadow-[0_0_0_1px_rgba(249,115,22,0.12)]"
      : "border-border bg-surface-1"
  }
`} >

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

                          <p className="mt-2 text-xs text-muted-foreground">
  {item.description}
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
                            item.status === "failed"
                            ? "bg-red-500/10 text-red-400"
                            : item.status === "pending"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-emerald-500/10 text-emerald-400"
                          }
                        `}
                      >
                        {item.status}
                      </div>

                    </div>

                  </div>

                </motion.div>
                
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