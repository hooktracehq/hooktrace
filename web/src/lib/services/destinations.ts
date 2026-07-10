import { apiFetch } from "@/lib/api"

import type {
  Destination,
  DestinationsResponse,
  DeliveryTargetPayload,
  DestinationStats,
} from "@/types/destinations"

export async function getDestinations() {
  return apiFetch<DestinationsResponse>(
    "/delivery-targets"
  )
}

export async function getDestinationStats() {
  return apiFetch<DestinationStats>(
    "/delivery-targets/stats"
  )
}

export async function createDestination(
  data: DeliveryTargetPayload
) {
  return apiFetch<Destination>(
    "/delivery-targets",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  )
}

export async function updateDestination(
  id: string,
  data: Partial<DeliveryTargetPayload>
) {
  return apiFetch<Destination>(
    `/delivery-targets/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  )
}

export async function deleteDestination(
  id: string
) {
  return apiFetch<{
    success: boolean
  }>(
    `/delivery-targets/${id}`,
    {
      method: "DELETE",
    }
  )
}

export async function testDestination(
  id: string
) {
  return apiFetch<{
    success: boolean
    message?: string
  }>(
    `/delivery-targets/${id}/test`,
    {
      method: "POST",
    }
  )
}


export async function getDestinationLogs(
  id: string
) {
  return apiFetch<{
    items: never[]
  }>(
    `/delivery-targets/${id}/logs`
  )
}