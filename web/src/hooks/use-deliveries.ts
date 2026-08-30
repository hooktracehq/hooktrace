"use client"

import { useQuery } from "@tanstack/react-query"

import { getDeliveries } from "@/lib/services/events"

export function useDeliveries(id: number) {
  return useQuery({
    queryKey: ["deliveries", id],
    queryFn: () => getDeliveries(id),
    enabled: !!id,

    // Keep the delivery timeline fresh while the worker
    // is processing/retrying the event.
    refetchInterval: 2000,

    // Refetch when the user comes back to the tab.
    refetchOnWindowFocus: true,

    // Don't show stale delivery records indefinitely.
    staleTime: 0,
  })
}