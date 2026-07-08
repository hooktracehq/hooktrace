import { apiFetch } from "@/lib/api"

import type {
  Connection,
  ConnectionsResponse,
  ConnectionsStatsResponse,
} from "@/types/connection"

export async function getConnections() {
  return apiFetch<ConnectionsResponse>(
    "/integrations"
  )
}

export async function getConnectionsStats() {
  return apiFetch<ConnectionsStatsResponse>(
    "/integrations/stats"
  )
}

export async function connectProvider(
  provider: string
) {
  return apiFetch<Connection>(
    `/integrations/${provider}`,
    {
      method: "POST",
    }
  )
}

export async function deleteConnection(
  provider: string
) {
  return apiFetch(
    `/integrations/${provider}`,
    {
      method: "DELETE",
    }
  )
}