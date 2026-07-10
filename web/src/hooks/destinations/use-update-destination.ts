"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import {
  updateDestination,
} from "@/lib/services/destinations"

export function useUpdateDestination() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Parameters<
        typeof updateDestination
      >[1]
    }) =>
      updateDestination(
        id,
        data
      ),

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