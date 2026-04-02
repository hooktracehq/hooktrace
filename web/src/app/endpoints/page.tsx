import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

async function getEndpoints() {
  const res = await fetch(`${process.env.API_URL}/routes`, {
    credentials: "include",
    cache: "no-store",
  })

  if (!res.ok) return []
  return res.json()
}

export default async function EndpointsPage() {
  const user = await getCurrentUser()

  if (!user) redirect("/login")

  const endpoints = await getEndpoints()

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <h1 className="text-3xl font-bold">Endpoints</h1>

      <div className="grid gap-4">
        {endpoints.map((ep: any) => (
          <div
            key={ep.id}
            className="border rounded-lg p-5 bg-card flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{ep.route}</p>
              <p className="text-sm text-muted-foreground">
                {process.env.NEXT_PUBLIC_API_URL}/r/{ep.token}/{ep.route}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Mode: {ep.mode}
              </p>
            </div>

            <div className="flex gap-3">
              <a
                href={`/events?route=${ep.route}`}
                className="text-sm border px-3 py-1 rounded"
              >
                View Events
              </a>

              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${process.env.NEXT_PUBLIC_API_URL}/r/${ep.token}/${ep.route}`
                  )
                }
                className="text-sm bg-primary text-white px-3 py-1 rounded"
              >
                Copy URL
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}