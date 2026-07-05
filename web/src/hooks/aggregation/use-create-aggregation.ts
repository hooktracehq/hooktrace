"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createAggregationRule } from "@/lib/services/aggregation"

import type { CreateAggregationRequest } from "@/types/aggregation"
export function useCreateAggregation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: CreateAggregationRequest
    ) => {
      console.log("2. mutationFn", data)

      return createAggregationRule(data)
    },

    onSuccess: () => {
      console.log("3. success")

      queryClient.invalidateQueries({
        queryKey: ["aggregation"],
      })
    },

    onError: (error) => {
      console.error("4. error", error)
    },
  })
}