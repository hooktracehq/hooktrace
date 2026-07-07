"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import {
  connectProvider,
} from "@/lib/services/connections"

export function useCreateConnection() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (provider: string) =>
      connectProvider(provider),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["connections"],
      })
    },
  })
}