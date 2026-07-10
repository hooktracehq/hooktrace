"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import {
  createDestination,
} from "@/lib/services/destinations"

export function useCreateDestination() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: createDestination,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["destinations"],
      })

      queryClient.invalidateQueries({
        queryKey: ["destination-stats"],
      })
    },
  })
}