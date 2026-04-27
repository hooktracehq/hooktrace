export const dynamic = "force-dynamic"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import DevModeClient from "./dev-mode-client"

type Tunnel = {
  id: string
  name: string
  localUrl: string
  publicUrl: string
  status: "active" | "paused" | "error"
  createdAt: string
  requestCount: number
  lastRequest: string | null
}

async function getTunnels(): Promise<Tunnel[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tunnels`, {
    credentials: "include",
    cache: "no-store",
  })

  if (!res.ok) return []

  const data = await res.json()
return data.items || []
}

export default async function DevModePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const tunnels = await getTunnels()

  return <DevModeClient user={user} activeTunnels={tunnels} />
}