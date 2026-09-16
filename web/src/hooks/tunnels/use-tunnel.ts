import { useQuery } from "@tanstack/react-query"

import { QueryKeys } from "@/lib/query-keys"

import { TunnelService } from "@/lib/services/tunnels"

type Props = {
  id: string
}

export function useTunnel({
  id,
}: Props) {
  return useQuery({
    queryKey: QueryKeys.tunnel(id),
    queryFn: () =>
      TunnelService.get(id),
    enabled: !!id,
  })
}