

// "use client"

// import { useEffect, useState } from "react"
// import { CheckCircle2, XCircle, Clock } from "lucide-react"

// type Log = {
//   id: string
//   event_id: number
//   status: "success" | "failed"
//   status_code?: number
//   response?: string
//   attempt: number
//   created_at: string
// }

// /* ---------------- HELPERS ---------------- */


// async function retryEvent(eventId: number) {
//   try {
//     await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/replay`,
//       {
//         method: "POST",
//         credentials: "include",
//       }
//     )

//     alert("Retry triggered")
//   } catch {
//     alert("Retry failed")
//   }
// }

// function groupByEvent(logs: Log[]) {
//   const map: Record<number, Log[]> = {}

//   logs.forEach((log) => {
//     if (!map[log.event_id]) map[log.event_id] = []
//     map[log.event_id].push(log)
//   })

//   return Object.entries(map)
//     .sort((a, b) => Number(b[0]) - Number(a[0])) // latest first
//     .map(([eventId, items]) => ({
//       eventId: Number(eventId),
//       items: items.sort((a, b) => b.attempt - a.attempt),
//     }))
// }

// function parseResponse(response?: string) {
//   if (!response) return null

//   try {
//     return JSON.parse(response)
//   } catch {
//     return response
//   }
// }

// /* ---------------- COMPONENT ---------------- */

// export default function TargetLogs({ targetId }: { targetId: string }) {
//   const [logs, setLogs] = useState<Log[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     async function fetchLogs() {
//       try {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${targetId}/logs`,
//           {
//             credentials: "include",
//           }
//         )
  
//         const data = await res.json()
  
//         setLogs((prev) => {
//           const next = data.items || []
  
//           if (JSON.stringify(prev) === JSON.stringify(next)) {
//             return prev
//           }
  
//           return next
//         })
//       } catch (err) {
//         console.error("Failed to fetch logs", err)
//       } finally {
//         setLoading(false)
//       }
//     }
  
//     // initial fetch
//     fetchLogs()
  
//     //  interval defined as const
//     const interval = setInterval(fetchLogs, 5000)
  
//     return () => clearInterval(interval)
//   }, [targetId])

//   const grouped = groupByEvent(logs)

//   if (loading) {
//     return (
//       <div className="p-6 text-sm text-muted-foreground">
//         Loading logs...
//       </div>
//     )
//   }

//   return (
//     <div className="rounded-2xl border bg-card p-5 space-y-6">

//       <h2 className="font-semibold text-sm">Activity Timeline</h2>

//       {grouped.length === 0 && (
//         <p className="text-sm text-muted-foreground">
//           No activity yet
//         </p>
//       )}

//       {grouped.map((group) => (
//         <div key={group.eventId} className="space-y-3">

//           {/* Event Header */}
//           <div className="text-xs font-medium text-muted-foreground">
//             Event #{group.eventId}
//           </div>

//           <div className="space-y-2 border-l pl-4">

//             {group.items.map((log) => {
//               const parsed = parseResponse(log.response)

//               return (
//                 <div key={log.id} className="flex gap-3">

//                   {/* Timeline Dot */}
//                   <div className="mt-1">
//                     {log.status === "success" ? (
//                       <CheckCircle2 className="w-4 h-4 text-emerald-500" />
//                     ) : (
//                       <XCircle className="w-4 h-4 text-red-500" />
//                     )}
//                   </div>

//                   {/* Content */}
//                   <div className="flex-1 space-y-1">

//                     <p className="text-sm font-medium">
//                       {log.status === "success"
//                         ? "Delivered successfully"
//                         : "Delivery failed"}

//                         {
//                           log.status === "failed" && (
//                             <button
//                             onClick={() => retryEvent(log.event_id)}
//     className="text-xs px-2 py-1 rounded border hover:bg-muted"
//                             >
//                               Retry
//                             </button>
//                           )
//                         }
//                     </p>

//                     <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">

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

//                     {/* Response preview */}
//                     {parsed && (
//                       <details className="text-xs mt-1">
//                         <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
//                           View response
//                         </summary>

//                         <pre className="mt-2 p-2 bg-muted rounded overflow-auto text-[10px] max-h-48">
//                           {typeof parsed === "string"
//                             ? parsed.slice(0, 500)
//                             : JSON.stringify(parsed, null, 2)}
//                         </pre>
//                       </details>
//                     )}
//                   </div>

//                   {/* Time */}
//                   <div className="text-xs text-muted-foreground whitespace-nowrap">
//                     {new Date(log.created_at).toLocaleTimeString()}
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }







"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, Clock } from "lucide-react"

type Log = {
  id: string
  event_id: number
  status: "success" | "failed"
  status_code?: number
  response?: string
  attempt: number
  created_at: string
}

/* ---------------- HELPERS ---------------- */

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
  if (!response) return null

  try {
    return JSON.parse(response)
  } catch {
    return response
  }
}

/* ---------------- COMPONENT ---------------- */

export default function TargetLogs({ targetId }: { targetId: string }) {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState<number | null>(null)

  /* ---------------- FETCH ---------------- */

  async function fetchLogs() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${targetId}/logs`,
        { credentials: "include" }
      )

      const data = await res.json()

      setLogs((prev) => {
        const next = data.items || []
        if (JSON.stringify(prev) === JSON.stringify(next)) return prev
        return next
      })
    } catch (err) {
      console.error("Failed to fetch logs", err)
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- RETRY ---------------- */

  async function retryEvent(eventId: number) {
    try {
      setRetrying(eventId)

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/replay`,
        {
          method: "POST",
          credentials: "include",
        }
      )

      // refresh logs instantly
      await fetchLogs()
    } catch {
      alert("Retry failed")
    } finally {
      setRetrying(null)
    }
  }

  /* ---------------- EFFECT ---------------- */

  useEffect(() => {
    fetchLogs()

    const interval = setInterval(fetchLogs, 4000) // slightly faster

    return () => clearInterval(interval)
  }, [targetId])

  const grouped = groupByEvent(logs)

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading logs...
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-6">

      <h2 className="font-semibold text-sm">Activity Timeline</h2>

      {grouped.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No activity yet
        </p>
      )}

      {grouped.map((group) => (
        <div key={group.eventId} className="space-y-3">

          {/* Event Header */}
          <div className="text-xs font-medium text-muted-foreground">
            Event #{group.eventId}
          </div>

          <div className="space-y-2 border-l pl-4">

            {group.items.map((log) => {
              const parsed = parseResponse(log.response)

              return (
                <div key={log.id} className="flex gap-3">

                  {/* Status Icon */}
                  <div className="mt-1">
                    {log.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1">

                    {/* Title + Retry */}
                    <div className="flex items-center gap-2">

                      <p className="text-sm font-medium">
                        {log.status === "success"
                          ? "Delivered successfully"
                          : "Delivery failed"}
                      </p>

                      {log.status === "failed" && (
                        <button
                          onClick={() => retryEvent(log.event_id)}
                          disabled={retrying === log.event_id}
                          className="text-xs px-2 py-1 rounded border hover:bg-muted"
                        >
                          {retrying === log.event_id
                            ? "Retrying..."
                            : "Retry"}
                        </button>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">

                      <span>Attempt {log.attempt}</span>

                      {log.status_code && (
                        <span>HTTP {log.status_code}</span>
                      )}

                      {parsed?.duration_ms && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {parsed.duration_ms}ms
                        </span>
                      )}
                    </div>

                    {/* Response */}
                    {parsed && (
                      <details className="text-xs mt-1">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View response
                        </summary>

                        <pre className="mt-2 p-2 bg-muted rounded overflow-auto text-[10px] max-h-48">
                          {typeof parsed === "string"
                            ? parsed.slice(0, 500)
                            : JSON.stringify(parsed, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>

                  {/* Time */}
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
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