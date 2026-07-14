import {
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query"
  
  import { QueryKeys } from "@/lib/query-keys"
  
  import { TunnelService } from "@/lib/services/tunnels"
  
  import type {
    CreateTunnelPayload,
  } from "@/types/tunnel"
  
  export function useCreateTunnel() {
    const queryClient =
      useQueryClient()
  
    return useMutation({
      mutationFn: (
        payload: CreateTunnelPayload,
      ) =>
        TunnelService.create(payload),
  
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: QueryKeys.tunnels,
        })
      },
    })
  }