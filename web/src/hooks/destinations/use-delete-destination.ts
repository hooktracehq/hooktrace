"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import {
  deleteDestination,
} from "@/lib/services/destinations"

export function useDeleteDestination() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDestination,

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