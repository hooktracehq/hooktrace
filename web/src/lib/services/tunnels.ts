import { apiFetch } from "@/lib/api"

import type {
  Tunnel,
  TunnelLog,
  TunnelStats,
  TunnelResponse,
  TunnelLogsResponse,
  CreateTunnelPayload,
  UpdateTunnelPayload,
  DeleteTunnelResponse,
} from "@/types/tunnel"

export const TunnelService = {
  list: async (): Promise<Tunnel[]> => {
    const data =
      await apiFetch<TunnelResponse>(
        "/tunnels",
      )

    return data.items
  },

  get: async (
    id: string,
  ): Promise<Tunnel> => {
    return apiFetch<Tunnel>(
      `/tunnels/${id}`,
    )
  },

  create: async (
    payload: CreateTunnelPayload,
  ): Promise<Tunnel> => {
    return apiFetch<Tunnel>(
      "/tunnels",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    )
  },

  update: async (
    id: string,
    payload: UpdateTunnelPayload,
  ): Promise<Tunnel> => {
    return apiFetch<Tunnel>(
      `/tunnels/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    )
  },

  delete: async (
    id: string,
  ): Promise<DeleteTunnelResponse> => {
    return apiFetch<DeleteTunnelResponse>(
      `/tunnels/${id}`,
      {
        method: "DELETE",
      },
    )
  },

  logs: async (
    id: string,
  ): Promise<TunnelLog[]> => {
    const data =
      await apiFetch<TunnelLogsResponse>(
        `/tunnels/${id}/logs`,
      )

    return data.items
  },

  stats: async (
    id: string,
  ): Promise<TunnelStats> => {
    return apiFetch<TunnelStats>(
      `/tunnels/${id}/stats`,
    )
  },
}