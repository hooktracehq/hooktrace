import type { Route } from "@/types/route"

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