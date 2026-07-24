"use client"

import { useQuery } from "@tanstack/react-query"

import { getIssueStats } from "@/lib/services/events"

export function useIssueStats() {
  return useQuery({
    queryKey: ["issue-stats"],
    queryFn: getIssueStats,
  })
}