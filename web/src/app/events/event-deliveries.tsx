


"use client"

import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { useDeliveries } from "@/hooks/use-deliveries"

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

/*  NEW: parse response safely */
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
  // const [data, setData] = useState<Delivery[]>([])

  // useEffect(() => {
  //   fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/deliveries`, {
  //     credentials: "include",
  //   })
  //     .then((res) => res.json())
  //     .then((d) => setData(d.items || []))
  // }, [eventId])


  const { data, isLoading } =
  useDeliveries(eventId)

const deliveries =
  data?.items ?? []


  const grouped =
  groupByAttempt(deliveries as Delivery[])

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