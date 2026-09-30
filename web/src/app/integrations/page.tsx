

export const dynamic = "force-dynamic"

import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import IntegrationsClient from "@/app/integrations/integrations-client"

type Integration = {
  provider: string
  webhook_token: string
}

type Provider = {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  webhooks: string[]
  status: "active" | "available" | "coming_soon"
}

const PROVIDERS: Provider[] = [
  // keep your existing providers
]

export default async function IntegrationsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const cookieStore = cookies()

  const cookieHeader = (await cookieStore)
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  })

  const data = await res.json()

  const items: Integration[] = Array.isArray(data?.items) ? data.items : []

  const connectedIntegrations = items.map((i) => i.provider)

  return (
    <IntegrationsClient
      providers={PROVIDERS}
      connectedIntegrations={connectedIntegrations}
      user={user}
    />
  )
}