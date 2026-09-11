import type { Route } from "@/types/route"
import { apiFetch } from "../api"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001"

type BackendRoute = {
  id: string
  token: string
  route: string
  mode: "dev" | "prod"
  dev_target?: string | null
  prod_target?: string | null
  created_at?: string | null
  provider?: string | null
  status?: string | null
  secret?: string | null

  throughput?: number | null
  failures?: number | null
  last_seen?: string | null
  destinations?: number | null

  aggregation_enabled?: boolean | null
  aggregation_rule_id?: string | null
  aggregation_rule_name?: string | null
}

type RoutesResponse = {
  items?: BackendRoute[]
}

function formatLastSeen(
  value?: string | null
): string | null {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const diff = Date.now() - date.getTime()

  if (diff < 0) {
    return "Just now"
  }

  const seconds = Math.floor(diff / 1000)

  if (seconds < 10) {
    return "Just now"
  }

  if (seconds < 60) {
    return `${seconds}s ago`
  }

  const minutes = Math.floor(seconds / 60)

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(hours / 24)

  return `${days}d ago`
}

function normalizeRoute(
  route: BackendRoute
): Route {
  return {
    id: String(route.id),

    token: route.token,

    path: route.route,

    provider: route.provider || "generic",

    mode: route.mode || "dev",

    status:
      route.status === "paused"
        ? "paused"
        : route.status === "error"
          ? "error"
          : "active",

    devTarget: route.dev_target,

    prodTarget: route.prod_target,

    secret: route.secret,

    throughput:
      Number(route.throughput) || 0,

    failures:
      Number(route.failures) || 0,

    destinations:
      Number(route.destinations) || 0,

    aggregationEnabled:
      Boolean(route.aggregation_enabled),

    aggregationRuleId:
      route.aggregation_rule_id ?? null,

    aggregationRuleName:
      route.aggregation_rule_name ?? null,

    lastSeen:
      formatLastSeen(
        route.last_seen ||
        route.created_at
      ),

    createdAt: route.created_at,
  }
}

export async function getRoutes(): Promise<Route[]> {
  const response = await fetch(
    `${API_URL}/routes/`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  )

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED")
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch routes (${response.status})`
    )
  }

  const data:
    | RoutesResponse
    | BackendRoute[] =
    await response.json()

  const items = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : []

  return items.map(normalizeRoute)
}

export async function getRouteTargets(
  routeId: string
) {
  return apiFetch<{
    items: Array<{
      id: string
      name: string
      type: string
      config: Record<string, unknown>
      enabled: boolean
      providers: string[]
      route_enabled: boolean
      attached_at: string | null
    }>
  }>(`/routes/${routeId}/targets`)
}

export async function attachTargetToRoute(
  routeId: string,
  targetId: string
) {
  return apiFetch<{
    success: boolean
    route_id: number
    target_id: string
    target_name: string
  }>(`/routes/${routeId}/targets/${targetId}`, {
    method: "POST",
  })
}

export async function detachTargetFromRoute(
  routeId: string,
  targetId: string
) {
  return apiFetch<{
    success: boolean
    route_id: number
    target_id: string
  }>(`/routes/${routeId}/targets/${targetId}`, {
    method: "DELETE",
  })
}

export async function updateRouteAggregation(
  routeId: string,
  enabled: boolean,
  ruleId?: string | null
) {
  return apiFetch<{
    route_id: number
    aggregation_enabled: boolean
    aggregation_rule_id: string | null
    aggregation_rule_name: string | null
  }>(`/routes/${routeId}/aggregation`, {
    method: "PATCH",
    body: JSON.stringify({
      enabled,
      rule_id: ruleId ?? null,
    }),
  })
}