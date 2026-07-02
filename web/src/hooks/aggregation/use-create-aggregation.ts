"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createAggregationRule } from "@/lib/services/aggregation"

import type { CreateAggregationRequest } from "@/types/aggregation"
export function useCreateAggregation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      data: CreateAggregationRequest
    ) => createAggregationRule(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["aggregation"],
      })
    },
  })
}