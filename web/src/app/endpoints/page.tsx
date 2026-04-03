// import { getCurrentUser } from "@/lib/auth"
// import { redirect } from "next/navigation"

// async function getEndpoints() {
//   const res = await fetch(`${process.env.API_URL}/routes`, {
//     credentials: "include",
//     cache: "no-store",
//   })

//   if (!res.ok) return []
//   return res.json()
// }

// export default async function EndpointsPage() {
//   const user = await getCurrentUser()

//   if (!user) redirect("/login")

//   const endpoints = await getEndpoints()

//   return (
//     <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
//       <h1 className="text-3xl font-bold">Endpoints</h1>

//       <div className="grid gap-4">
//         {endpoints.map((ep: any) => (
//           <div
//             key={ep.id}
//             className="border rounded-lg p-5 bg-card flex justify-between items-center"
//           >
//             <div>
//               <p className="font-semibold">{ep.route}</p>
//               <p className="text-sm text-muted-foreground">
//                 {process.env.NEXT_PUBLIC_API_URL}/r/{ep.token}/{ep.route}
//               </p>
//               <p className="text-xs text-muted-foreground mt-1">
//                 Mode: {ep.mode}
//               </p>
//             </div>

//             <div className="flex gap-3">
//               <a
//                 href={`/events?route=${ep.route}`}
//                 className="text-sm border px-3 py-1 rounded"
//               >
//                 View Events
//               </a>

//               <button
//                 onClick={() =>
//                   navigator.clipboard.writeText(
//                     `${process.env.NEXT_PUBLIC_API_URL}/r/${ep.token}/${ep.route}`
//                   )
//                 }
//                 className="text-sm bg-primary text-white px-3 py-1 rounded"
//               >
//                 Copy URL
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }





import Link from "next/link"
import { redirect } from "next/navigation"
import { Copy, ArrowRight, LinkIcon } from "lucide-react"

import { getCurrentUser } from "@/lib/auth"

type Endpoint = {
  id: string
  token: string
  route: string
  mode: "dev" | "prod"
  dev_target?: string
  prod_target?: string
}

async function getEndpoints(): Promise<Endpoint[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/routes`, {
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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Endpoints</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your webhook relay endpoints
            </p>
          </div>

          <Link
            href="/endpoints/new"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Create Endpoint
          </Link>
        </div>

        {/* Empty state */}
        {endpoints.length === 0 && (
          <div className="border border-border rounded-xl bg-card p-10 text-center">
            <div className="flex justify-center mb-4">
              <LinkIcon className="w-8 h-8 text-muted-foreground" />
            </div>

            <h3 className="text-lg font-semibold mb-2">
              No endpoints yet
            </h3>

            <p className="text-muted-foreground text-sm mb-6">
              Create your first webhook endpoint to start receiving events
            </p>

            <Link
              href="/endpoints/new"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              Create Endpoint
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Endpoints list */}
        <div className="grid gap-4">
          {endpoints.map((ep) => {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/r/${ep.token}/${ep.route}`

            return (
              <div
                key={ep.id}
                className="border border-border rounded-xl bg-card p-5 flex items-center justify-between hover:shadow-sm transition"
              >
                {/* Endpoint info */}
                <div className="space-y-1">
                  <p className="font-semibold text-base">
                    {ep.route}
                  </p>

                  <p className="text-sm text-muted-foreground font-mono">
                    {url}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                    <span className="capitalize">
                      Mode: {ep.mode}
                    </span>

                    {ep.dev_target && (
                      <span>
                        Dev → {ep.dev_target}
                      </span>
                    )}

                    {ep.prod_target && (
                      <span>
                        Prod → {ep.prod_target}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">

                  <Link
                    href={`/events?route=${ep.route}`}
                    className="text-sm border border-border px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
                  >
                    View Events
                  </Link>

                  <button
                    onClick={() => navigator.clipboard.writeText(url)}
                    className="flex items-center gap-1 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>

                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}