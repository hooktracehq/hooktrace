"use client"

import { useRealtimeSystem } from "@/hooks/use-realtime-system"

export function RealtimeProvider({
  children,
}: {
  children: React.ReactNode
}) {

  useRealtimeSystem()

  return <>{children}</>
}