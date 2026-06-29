"use client"

import { useQuery } from "@tanstack/react-query"

import { getDlqCount } from "@/lib/services/events"

export function useDlqCount() {
  return useQuery({
    queryKey: ["dlq-count"],
    queryFn: getDlqCount,
  })
}