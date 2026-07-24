"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { replayEvent } from "@/lib/services/events"

export function useReplayEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: replayEvent,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["issues"],
      })

      queryClient.invalidateQueries({
        queryKey: ["issue-stats"],
      })
    },
  })
}