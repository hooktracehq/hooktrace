// "use client"

// import { useEffect, useState } from "react"
// import { CheckCircle2, XCircle, Clock } from "lucide-react"
// import { toast } from "sonner"
// import { motion } from "framer-motion"

// type Log = {
//   id: string
//   event_id: number
//   status: "success" | "failed"
//   status_code?: number
//   response?: string
//   attempt: number
//   created_at: string
// }

// function groupByEvent(logs: Log[]) {
//   const map: Record<number, Log[]> = {}

//   logs.forEach((log) => {
//     if (!map[log.event_id]) map[log.event_id] = []
//     map[log.event_id].push(log)
//   })

//   return Object.entries(map)
//     .sort((a, b) => Number(b[0]) - Number(a[0]))
//     .map(([eventId, items]) => ({
//       eventId: Number(eventId),
//       items: items.sort((a, b) => b.attempt - a.attempt),
//     }))
// }

// function parseResponse(response?: string) {
//   try {
//     return response ? JSON.parse(response) : null
//   } catch {
//     return response
//   }
// }

// export default function TargetLogs({
//   targetId,
//   setLogs: setParentLogs,
// }: {
//   targetId: string
//   setLogs: (logs: Log[]) => void
// })
//   const [logs, setLogs] = useState<Log[]>([])
//   const [loading, setLoading] = useState(true)
//   const [retrying, setRetrying] = useState<number | null>(null)
//   const [error, setError] = useState<string | null>(null)

//   async function fetchLogs() {
//     try {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${targetId}/logs`,
//         { credentials: "include" }
//       )

//       const data = await res.json()

//       const next = data.items || []

// setLogs((prev) => {
//   return JSON.stringify(prev) === JSON.stringify(next) ? prev : next
// })
// setParentLogs(next)
//     } catch {
//       setError("Failed to load logs")
//     } finally {
//       setLoading(false)
//     }
//   }

//   async function retryEvent(eventId: number) {
//     try {
//       setRetrying(eventId)

//       await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/replay`,
//         { method: "POST", credentials: "include" }
//       )

//       toast.success("Retry triggered")
//       await fetchLogs()
//     } catch {
//       toast.error("Retry failed")
//     } finally {
//       setRetrying(null)
//     }
//   }

//   useEffect(() => {
//     fetchLogs()
//     const interval = setInterval(fetchLogs, 4000)
//     return () => clearInterval(interval)
//   }, [targetId])

//   const grouped = groupByEvent(logs)

//   if (loading)
//     return (
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         className="p-6 text-sm text-muted-foreground"
//       >
//         Loading activity...
//       </motion.div>
//     )

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="rounded-2xl border bg-card p-5 space-y-6"
//     >

//       <h2 className="font-semibold text-sm">Activity Timeline</h2>

//       {error && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="text-xs text-red-500 bg-red-50 p-2 rounded"
//         >
//           {error}
//         </motion.div>
//       )}

//       {grouped.length === 0 && (
//         <p className="text-sm text-muted-foreground">
//           No activity yet
//         </p>
//       )}

//       {grouped.map((group, groupIndex) => (
//         <motion.div
//           key={group.eventId}
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: groupIndex * 0.05 }}
//           className="space-y-3"
//         >

//           {/* Event Header */}
//           <div className="text-xs text-muted-foreground">
//             Event #{group.eventId}
//           </div>

//           {/* Timeline */}
//           <div className="space-y-2 border-l pl-4">

//             {group.items.map((log, i) => {
//               const parsed = parseResponse(log.response)

//               return (
//                 <motion.div
//                   key={log.id}
//                   initial={{ opacity: 0, x: -10 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: i * 0.03 }}
//                   className="flex gap-3"
//                 >

//                   {/* Icon */}
//                   <div className="mt-1">
//                     {log.status === "success" ? (
//                       <CheckCircle2 className="w-4 h-4 text-emerald-500" />
//                     ) : (
//                       <XCircle className="w-4 h-4 text-red-500" />
//                     )}
//                   </div>

//                   {/* Content */}
//                   <div className="flex-1 space-y-1">

//                     <div className="flex items-center gap-2">
//                       <p className="text-sm font-medium">
//                         {log.status === "success"
//                           ? "Delivered"
//                           : "Failed"}
//                       </p>

//                       {log.status === "failed" && (
//                         <motion.button
//                           whileTap={{ scale: 0.95 }}
//                           onClick={() => retryEvent(log.event_id)}
//                           disabled={retrying === log.event_id}
//                           className="text-xs px-2 py-1 border rounded hover:bg-muted transition"
//                         >
//                           {retrying === log.event_id ? "Retrying..." : "Retry"}
//                         </motion.button>
//                       )}
//                     </div>

//                     <div className="text-xs text-muted-foreground flex gap-3 flex-wrap">
//                       <span>Attempt {log.attempt}</span>

//                       {log.status_code && (
//                         <span>HTTP {log.status_code}</span>
//                       )}

//                       {parsed?.duration_ms && (
//                         <span className="flex items-center gap-1">
//                           <Clock className="w-3 h-3" />
//                           {parsed.duration_ms}ms
//                         </span>
//                       )}
//                     </div>

//                     {parsed && (
//                       <details className="text-xs group">
//                         <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition">
//                           View response
//                         </summary>

//                         <pre className="mt-2 bg-muted p-2 rounded text-[10px] overflow-auto">
//                           {typeof parsed === "string"
//                             ? parsed.slice(0, 300)
//                             : JSON.stringify(parsed, null, 2)}
//                         </pre>
//                       </details>
//                     )}
//                   </div>

//                   {/* Time */}
//                   <div className="text-xs text-muted-foreground">
//                     {new Date(log.created_at).toLocaleTimeString()}
//                   </div>
//                 </motion.div>
//               )
//             })}
//           </div>
//         </motion.div>
//       ))}
//     </motion.div>
//   )
// }






"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

type Log = {
  id: string
  event_id: number
  status: "success" | "failed"
  status_code?: number
  response?: string
  attempt: number
  created_at: string
}

function groupByEvent(logs: Log[]) {
  const map: Record<number, Log[]> = {}

  logs.forEach((log) => {
    if (!map[log.event_id]) map[log.event_id] = []
    map[log.event_id].push(log)
  })

  return Object.entries(map)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([eventId, items]) => ({
      eventId: Number(eventId),
      items: items.sort((a, b) => b.attempt - a.attempt),
    }))
}

function parseResponse(response?: string) {
  try {
    return response ? JSON.parse(response) : null
  } catch {
    return response
  }
}

export default function TargetLogs({
  targetId,
  setLogs: setParentLogs,
}: {
  targetId: string
  setLogs: (logs: Log[]) => void
}) {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function fetchLogs() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${targetId}/logs`,
        { credentials: "include" }
      )

      const data = await res.json()
      const next = data.items || []

      setLogs((prev) =>
        JSON.stringify(prev) === JSON.stringify(next) ? prev : next
      )

      // 🔥 IMPORTANT → sync with parent
      setParentLogs(next)

    } catch {
      setError("Failed to load logs")
    } finally {
      setLoading(false)
    }
  }

  async function retryEvent(eventId: number) {
    try {
      setRetrying(eventId)

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/replay`,
        { method: "POST", credentials: "include" }
      )

      toast.success("Retry triggered")
      await fetchLogs()
    } catch {
      toast.error("Retry failed")
    } finally {
      setRetrying(null)
    }
  }

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 4000)
    return () => clearInterval(interval)
  }, [targetId])

  const grouped = groupByEvent(logs)

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading activity...
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-6">
      <h2 className="font-semibold text-sm">Activity Timeline</h2>

      {error && (
        <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {grouped.length === 0 && (
        <p className="text-sm text-muted-foreground">No activity yet</p>
      )}

      {grouped.map((group) => (
        <div key={group.eventId} className="space-y-3">
          <div className="text-xs text-muted-foreground">
            Event #{group.eventId}
          </div>

          <div className="space-y-2 border-l pl-4">
            {group.items.map((log) => {
              const parsed = parseResponse(log.response)

              return (
                <div key={log.id} className="flex gap-3">
                  <div className="mt-1">
                    {log.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {log.status === "success" ? "Delivered" : "Failed"}
                      </p>

                      {log.status === "failed" && (
                        <button
                          onClick={() => retryEvent(log.event_id)}
                          disabled={retrying === log.event_id}
                          className="text-xs px-2 py-1 border rounded"
                        >
                          {retrying === log.event_id
                            ? "Retrying..."
                            : "Retry"}
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground flex gap-3">
                      <span>Attempt {log.attempt}</span>

                      {log.status_code && (
                        <span>HTTP {log.status_code}</span>
                      )}

                      {parsed?.duration_ms && (
                        <span>{parsed.duration_ms}ms</span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}