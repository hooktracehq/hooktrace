"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import { updateAggregationRule } from "@/lib/services/aggregation"

import type {
  UpdateAggregationRequest,
} from "@/types/aggregation"

type Variables = {
  id: string
  data: UpdateAggregationRequest
}

export function useUpdateAggregation() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: Variables) => {
      console.log(
        "PATCH",
        id,
        data
      )

      return updateAggregationRule(
        id,
        data
      )
    },

    onSuccess: () => {
      console.log(
        "PATCH SUCCESS"
      )

      queryClient.invalidateQueries({
        queryKey: [
          "aggregation",
        ],
      })
    },

    onError: (error) => {
      console.error(
        "PATCH ERROR",
        error
      )
    },
  })
}