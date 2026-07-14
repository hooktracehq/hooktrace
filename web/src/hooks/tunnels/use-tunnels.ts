import { useQuery } from "@tanstack/react-query"

import { QueryKeys } from "@/lib/query-keys"

import { TunnelService } from "@/lib/services/tunnels"

export function useTunnels() {
  return useQuery({
    queryKey: QueryKeys.tunnels,
    queryFn: TunnelService.list,
  })
}