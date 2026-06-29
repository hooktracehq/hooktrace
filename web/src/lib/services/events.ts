

import { apiFetch } from "@/lib/api"

import type { Event } from "@/types/event"
import type { EventDetail } from "@/types/event-detail"
import type { Delivery } from "@/types/delivery"

export function getEvents(params?: {
  status?: string
  provider?: string
  limit?: number
  offset?: number
}) {
  const search = new URLSearchParams()

  if (params?.status)
    search.set("status", params.status)

  if (params?.provider)
    search.set("provider", params.provider)

  if (params?.limit)
    search.set("limit", String(params.limit))

  if (params?.offset)
    search.set("offset", String(params.offset))

  return apiFetch<{
    items: Event[]
    limit: number
    offset: number
  }>(`/events?${search}`)
}

export function getEvent(id: number) {
  return apiFetch<EventDetail>(`/events/${id}`)
}

export function getDeliveries(id: number) {
  return apiFetch<{
    items: Delivery[]
  }>(`/events/${id}/deliveries`)
}

export function getDlqCount() {
  return apiFetch<{
    dlq_count: number
  }>("/events/stats/dlq-count")
}


export type EventsResponse = {
    items: Event[]
    limit: number
    offset: number
  }