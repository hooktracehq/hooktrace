import { useQuery } from "@tanstack/react-query"

import { TunnelService } from "@/lib/services/tunnels"

export function useTunnelStats(
  tunnelId: string,
) {
  return useQuery({
    queryKey: [
      "tunnel-stats",
      tunnelId,
    ],

    queryFn: () =>
      TunnelService.stats(
        tunnelId,
      ),

    enabled: !!tunnelId,
  })
}