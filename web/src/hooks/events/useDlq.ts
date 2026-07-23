"use client"

import { useQuery } from "@tanstack/react-query"

import { getEvents } from "@/lib/services/events"

export function useDlq() {
  return useQuery({
    queryKey: ["events", "dlq"],
    queryFn: () =>
      getEvents({
        status: "dlq",
      }),
  })
}