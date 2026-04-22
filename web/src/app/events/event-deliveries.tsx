// "use client"

// import { useEffect, useState } from "react"
// import { CheckCircle2, XCircle, Clock } from "lucide-react"
// import { motion } from "framer-motion"


// type DeliveryResponse = {
//     status_code?: number
//     body?: string
//     duration_ms?: number
//   }


//   type Delivery = {
//     id: string
//     target_name: string
//     status: "success" | "failed"
//     attempt: number
//     created_at: string
//     status_code?: number
//     response?: DeliveryResponse
//   }

// /* ---------------- Utils ---------------- */

// function groupByAttempt(data: Delivery[]) {
//   const map: Record<number, Delivery[]> = {}

//   data.forEach((d) => {
//     if (!map[d.attempt]) map[d.attempt] = []
//     map[d.attempt].push(d)
//   })

//   return Object.entries(map)
//     .sort((a, b) => Number(b[0]) - Number(a[0])) // latest first
//     .map(([attempt, items]) => ({
//       attempt: Number(attempt),
//       items,
//     }))
// }

// /* ---------------- Component ---------------- */

// export function EventDeliveries({ eventId }: { eventId: number }) {
//   const [data, setData] = useState<Delivery[]>([])

//   useEffect(() => {
//     fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/deliveries`, {
//         credentials:"include"
//     })
//       .then((res) => res.json())
//       .then((d) => setData(d.items || []))
//   }, [eventId])

//   const grouped = groupByAttempt(data)

//   return (
//     <div className="space-y-4">

//       {grouped.length === 0 && (
//         <div className="p-6 text-sm text-muted-foreground border rounded-xl">
//           No delivery records
//         </div>
//       )}

//       {grouped.map((group) => (
//         <motion.div
//           key={group.attempt}
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="rounded-xl border bg-card overflow-hidden"
//         >
//           {/* Attempt Header */}
//           <div className="px-4 py-2 border-b bg-muted/40 text-xs font-medium">
//             Attempt #{group.attempt}
//           </div>

//           <div className="divide-y">
//             {group.items.map((d) => (
//               <div
//                 key={d.id}
//                 className="flex items-center justify-between p-4 hover:bg-muted/40 transition"
//               >
//                 {/* LEFT */}
//                 <div className="flex items-start gap-3">

//                   {/* Status Icon */}
//                   {d.status === "success" ? (
//                     <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1" />
//                   ) : (
//                     <XCircle className="w-4 h-4 text-rose-500 mt-1" />
//                   )}

//                   <div className="space-y-1">
//                     <p className="text-sm font-medium">
//                       {d.target_name}
//                     </p>

//                     <div className="flex gap-3 text-xs text-muted-foreground">
//                       {d.status_code && (
//                         <span>HTTP {d.status_code}</span>
//                       )}

//                       {d.response?.duration_ms && (
//                         <span>
//                           <Clock className="inline w-3 h-3 mr-1" />
//                           {d.response.duration_ms}ms
//                         </span>
//                       )}
//                     </div>

//                     {/* Expandable response */}
//                     {d.response && (
//                       <details className="text-xs mt-1">
//                         <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
//                           View response
//                         </summary>
//                         <pre className="mt-2 p-2 bg-muted rounded overflow-auto text-[10px]">
//                           {JSON.stringify(d.response, null, 2)}
//                         </pre>
//                       </details>
//                     )}
//                   </div>
//                 </div>

//                 {/* RIGHT */}
//                 <div className="text-xs text-muted-foreground">
//                   {new Date(d.created_at).toLocaleTimeString()}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </motion.div>
//       ))}
//     </div>
//   )
// }




"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { motion } from "framer-motion"

/* ---------------- Types ---------------- */

type DeliveryResponse = {
  status_code?: number
  body?: string
  duration_ms?: number
}

type Delivery = {
  id: string
  target_name: string
  status: "success" | "failed"
  attempt: number
  created_at: string
  status_code?: number
  response?: DeliveryResponse | string | null
}

/* ---------------- Utils ---------------- */

function groupByAttempt(data: Delivery[]) {
  const map: Record<number, Delivery[]> = {}

  data.forEach((d) => {
    if (!map[d.attempt]) map[d.attempt] = []
    map[d.attempt].push(d)
  })

  return Object.entries(map)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([attempt, items]) => ({
      attempt: Number(attempt),
      items,
    }))
}

/* 🔥 NEW: parse response safely */
function parseResponse(res: Delivery["response"]): DeliveryResponse | null {
  if (!res) return null

  if (typeof res === "object") return res

  try {
    return JSON.parse(res)
  } catch {
    return null
  }
}

/* ---------------- Component ---------------- */

export function EventDeliveries({ eventId }: { eventId: number }) {
  const [data, setData] = useState<Delivery[]>([])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/deliveries`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((d) => setData(d.items || []))
  }, [eventId])

  const grouped = groupByAttempt(data)

  return (
    <div className="space-y-4">

      {grouped.length === 0 && (
        <div className="p-6 text-sm text-muted-foreground border rounded-xl">
          No delivery records
        </div>
      )}

      {grouped.map((group) => (
        <motion.div
          key={group.attempt}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card overflow-hidden"
        >
          {/* Attempt Header */}
          <div className="px-4 py-2 border-b bg-muted/40 text-xs font-medium">
            Attempt #{group.attempt}
          </div>

          <div className="divide-y">
            {group.items.map((d) => {
              const parsed = parseResponse(d.response)

              return (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/40 transition"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-3">
              
                    {/* Status */}
                    {d.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
              
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {d.target_name}
                      </p>
              
                      {/* Clean summary */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        
                        {/* status */}
                        {parsed?.status_code && (
                          <span className="text-emerald-500 font-medium">
                            {parsed.status_code}
                          </span>
                        )}
              
                        {/* latency */}
                        {parsed?.duration_ms && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {parsed.duration_ms}ms
                          </span>
                        )}
              
                        {/* response type */}
                        {parsed?.body && (
                          <span>
                            {parsed.body.startsWith("<!DOCTYPE")
                              ? "HTML"
                              : "Response"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
              
                  {/* RIGHT */}
                  <div className="text-xs text-muted-foreground">
                    {new Date(d.created_at).toLocaleTimeString()}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      ))}
    </div>
  )
}