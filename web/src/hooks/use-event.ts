"use client"

import { useQuery } from "@tanstack/react-query"

import { getEvent } from "@/lib/services/events"

export function useEvent(id: number) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => getEvent(id),
    enabled: !!id,
  })
}