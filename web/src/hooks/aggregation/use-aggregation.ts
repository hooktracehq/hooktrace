"use client"

import { useQuery } from "@tanstack/react-query"

import {
  getAggregationRules,
} from "@/lib/services/aggregation"

export function useAggregation() {
  return useQuery({
    queryKey: ["aggregation"],
    queryFn: getAggregationRules,
  })
}