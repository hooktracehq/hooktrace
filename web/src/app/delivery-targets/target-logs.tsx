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

export default function TargetLogs({ targetId }: { targetId: string }) {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${targetId}/logs`)
      .then(res => res.json())
      .then(data => setLogs(data.items || []))
      .finally(() => setLoading(false))
  }, [targetId])

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading logs...
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">

      <div className="px-4 py-3 border-b text-sm font-medium">
        Delivery Logs
      </div>

      <div className="divide-y">
        {logs.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground">
            No deliveries yet
          </div>
        )}

        {logs.map(log => (
          <div
            key={log.id}
            className="flex items-center justify-between p-4 hover:bg-muted/40 transition"
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">

              {log.status === "success" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}

              {log.status === "failed" && (
                <XCircle className="w-4 h-4 text-rose-500" />
              )}

              <div>
                <p className="text-sm font-medium">
                  Event #{log.event_id}
                </p>

                <p className="text-xs text-muted-foreground">
                  Attempt {log.attempt} • {log.status_code || "—"}
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="text-xs text-muted-foreground">
              {new Date(log.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}