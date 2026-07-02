"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateAggregationRule } from "@/lib/services/aggregation"

import type { UpdateAggregationRequest } from "@/types/aggregation"

type Variables = {
  id: string
  data: UpdateAggregationRequest
}

export function useUpdateAggregation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: Variables) =>
      updateAggregationRule(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["aggregation"],
      })
    },
  })
}