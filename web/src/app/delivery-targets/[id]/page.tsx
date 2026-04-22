export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { serverApiFetch } from "@/lib/server-api"
import type { DeliveryTarget, TargetStats } from "@/types/delivery-target"
import DeliveryTargetDetailClient from "./delivery-target-detail-client"




export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  /*  unwrap params */
  const { id } = await params

  let target: DeliveryTarget | null = null
  let stats: TargetStats | null = null

  try {
    target = await serverApiFetch<DeliveryTarget>(
      `/delivery-targets/${id}`
    )

    stats = await serverApiFetch<TargetStats>(
      `/delivery-targets/${id}/stats`
    )
  } catch {
    notFound()
  }

  if (!target || !stats) notFound()

  return (
    <DeliveryTargetDetailClient
      target={target}
      stats={stats}
      user={user}
    />
  )
}