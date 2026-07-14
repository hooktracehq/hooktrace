import {
    useMutation,
    useQueryClient,
  } from "@tanstack/react-query"
  
  import { QueryKeys } from "@/lib/query-keys"
  
  import { TunnelService } from "@/lib/services/tunnels"
  
  export function useDeleteTunnel() {
    const queryClient =
      useQueryClient()
  
    return useMutation({
      mutationFn: TunnelService.delete,
  
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: QueryKeys.tunnels,
        })
      },
    })
  }