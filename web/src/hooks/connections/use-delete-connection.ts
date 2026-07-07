"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import {
  deleteConnection,
} from "@/lib/services/connections"

export function useDeleteConnection() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (provider: string) =>
      deleteConnection(provider),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["connections"],
      })
    },
  })
}