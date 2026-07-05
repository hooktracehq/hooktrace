"use client"

import { useQuery } from "@tanstack/react-query"

import {
  getAggregationRules,
} from "@/lib/services/aggregation"

export function useAggregation() {
  return useQuery({
    queryKey: ["aggregation"],
    queryFn: async () => {
      const res = await getAggregationRules()
    
      console.table(
        res?.items.map(rule => ({
          id: rule.id,
          name: rule.name,
          enabled: rule.enabled,
        }))
      )
    
      return res
    },
  })
}