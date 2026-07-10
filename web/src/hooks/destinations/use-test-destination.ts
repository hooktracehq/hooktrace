"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import {
  testDestination,
} from "@/lib/services/destinations"

export function useTestDestination() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: testDestination,

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