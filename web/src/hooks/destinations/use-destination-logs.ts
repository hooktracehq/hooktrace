"use client"

import { useQuery } from "@tanstack/react-query"

import {
  getDestinationLogs,
} from "@/lib/services/destinations"

export function useDestinationLogs(
  id?: string
) {
  return useQuery({
    queryKey: [
      "destination-logs",
      id,
    ],

    queryFn: () =>
      getDestinationLogs(id!),

    enabled: !!id,
  })
}