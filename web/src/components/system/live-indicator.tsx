"use client"

import {
  Radio,
  WifiOff,
} from "lucide-react"

import { useRealtimeStore } from "@/app/stores/realtime-store"

export function LiveIndicator() {
  const connected =
    useRealtimeStore(
      (s) => s.connected
    )

  const latency =
    useRealtimeStore(
      (s) => s.latency
    )

  return (
    <div
      className="
        flex items-center gap-3
        rounded-xl border border-border
        bg-background/40
        px-4 py-2
      "
    >

      {connected ? (
        <Radio className="h-4 w-4 text-emerald-400" />
      ) : (
        <WifiOff className="h-4 w-4 text-rose-400" />
      )}

      <div>

        <p className="text-sm font-medium">
          {connected
            ? "Connected"
            : "Offline"}
        </p>

        <p className="text-xs text-muted-foreground">
          {latency}ms latency
        </p>

      </div>

    </div>
  )
}