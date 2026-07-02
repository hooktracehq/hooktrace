"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  deleteAggregationRule,
} from "@/lib/services/aggregation"

export function useDeleteAggregation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      deleteAggregationRule(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["aggregation"],
      })
    },
  })
}