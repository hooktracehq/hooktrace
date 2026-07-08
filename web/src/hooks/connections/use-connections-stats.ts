"use client"

import { useQuery } from "@tanstack/react-query"

import {
  getConnectionsStats,
} from "@/lib/services/connections"

export function useConnectionsStats() {
  return useQuery({
    queryKey: ["connections", "stats"],

    queryFn: getConnectionsStats,
  })
}