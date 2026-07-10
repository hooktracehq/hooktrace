"use client"

import { useQuery } from "@tanstack/react-query"

import { getDestinationStats } from "@/lib/services/destinations"

export function useDestinationStats() {
  return useQuery({
    queryKey: ["destination-stats"],
    queryFn: getDestinationStats,
  })
}