import { useQuery } from "@tanstack/react-query"

import { QueryKeys } from "@/lib/query-keys"

import { TunnelService } from "@/lib/services/tunnels"

export function useTunnelLogs(
  tunnelId: string,
) {
  return useQuery({
    queryKey: QueryKeys.tunnelLogs(
      tunnelId,
    ),

    queryFn: () =>
      TunnelService.logs(
        tunnelId,
      ),

    enabled: !!tunnelId,
  })
}