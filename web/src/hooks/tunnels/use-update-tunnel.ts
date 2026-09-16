import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import { QueryKeys } from "@/lib/query-keys"

import { TunnelService } from "@/lib/services/tunnels"

import type {
  UpdateTunnelPayload,
} from "@/types/tunnel"

export function useUpdateTunnel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateTunnelPayload
    }) =>
      TunnelService.update(
        id,
        payload,
      ),

    onSuccess(_, variables) {
      // Refresh tunnel list
      queryClient.invalidateQueries({
        queryKey: QueryKeys.tunnels,
      })

      // Refresh the currently opened tunnel
      queryClient.invalidateQueries({
        queryKey: QueryKeys.tunnel(
          variables.id,
        ),
      })
    },
  })
}