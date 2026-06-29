"use client"

import { useQuery } from "@tanstack/react-query"

import { getDeliveries } from "@/lib/services/events"

export function useDeliveries(id: number) {
  return useQuery({
    queryKey: ["deliveries", id],
    queryFn: () => getDeliveries(id),
    enabled: !!id,
  })
}