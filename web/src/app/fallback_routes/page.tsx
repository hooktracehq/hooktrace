"use client"

import { useEffect, useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Route = {
  id: number
  token: string
  route: string
  mode: string
  dev_target?: string
  prod_target?: string
  is_active?: boolean
  created_at: string
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [routeName, setRouteName] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchRoutes = async () => {
    const res = await fetch(`${API_URL}/routes`)
    const data = await res.json()
    setRoutes(data.items || [])
  }

  useEffect(() => {
    let cancelled = false

    fetch(`${API_URL}/routes`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setRoutes(data.items || [])
      })

    return () => {
      cancelled = true
    }
  }, [])

  const createRoute = async () => {
    if (!routeName) return
    setLoading(true)

    await fetch(`${API_URL}/routes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN ?? ""}`,
      },
      body: JSON.stringify({ route: routeName }),
    })

    setRouteName("")
    await fetchRoutes()
    setLoading(false)
  }

  const deleteRoute = async (id: number) => {
    await fetch(`${API_URL}/routes/${id}`, {
      method: "DELETE",
    })
    fetchRoutes()
  }

  const toggleRoute = async (id: number) => {
    await fetch(`${API_URL}/routes/${id}/toggle`, {
      method: "PATCH",
    })
    fetchRoutes()
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-10">

      {/* Header */}
      <div>
  <h1 className="text-3xl font-semibold">Advanced Endpoints</h1>
  <p className="text-muted-foreground text-sm mt-1">
    Create custom webhook endpoints or manage routes created by integrations
  </p>
</div>
<p className="text-xs text-muted-foreground">
  Example: order.created, user.signup, payment.failed
</p>

      {/* Create Route */}
      <div className="flex gap-3">
        <input
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          placeholder="order.created"
          className="border px-4 py-2 rounded-lg w-full"
        />
        <button
          onClick={createRoute}
          disabled={loading}
          className="bg-primary text-white px-5 py-2 rounded-lg"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>

      {/* Route List */}
      <div className="space-y-4">
        {routes.map((r) => (
          <div
            key={r.id}
            className="border rounded-xl p-5 flex justify-between items-center"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-medium text-lg">
                  {r.route}
                </span>

                <span className={`text-xs px-2 py-1 rounded-full ${
                  r.is_active !== false
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {r.is_active !== false ? "Active" : "Disabled"}
                </span>

                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  {r.mode}
                </span>
              </div>

              <div className="text-xs text-muted-foreground">
                Relay: <code>{API_URL}/r/{r.token}/{r.route}</code>
              </div>

              <div className="text-xs text-muted-foreground">
                Target: {r.mode === "dev" ? r.dev_target || "-" : r.prod_target || "-"}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleRoute(r.id)}
                className="text-sm border px-3 py-1 rounded-md"
              >
                Toggle
              </button>

              <button
                onClick={() => deleteRoute(r.id)}
                className="text-sm border px-3 py-1 rounded-md text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}