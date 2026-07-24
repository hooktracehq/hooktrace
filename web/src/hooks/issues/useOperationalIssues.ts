"use client"

import { useQuery } from "@tanstack/react-query"

import { getOperationalIssues } from "@/lib/services/events"

export function useOperationalIssues() {
  return useQuery({
    queryKey: ["issues"],
    queryFn: () =>
      getOperationalIssues(),
  })
}