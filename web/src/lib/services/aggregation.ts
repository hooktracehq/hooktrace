import { apiFetch } from "@/lib/api"

import type {
    AggregationRule,
    AggregationResponse,
  } from "@/types/aggregation"


export function getAggregationRules() {
  return apiFetch<AggregationResponse>(
    "/aggregation"
  )
}

export function getAggregationRule(id: string) {
  return apiFetch<AggregationRule>(
    `/aggregation/${id}`
  )
}