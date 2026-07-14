import { useQuery } from "@tanstack/react-query"

import { TunnelService } from "@/lib/services/tunnels"

type Props = {
  id: string
}

export function useTunnel({
  id,
}: Props) {
  return useQuery({
    queryKey: [
      "tunnel",
      id,
    ],
    queryFn: () =>
      TunnelService.get(id),
    enabled: !!id,
  })
}