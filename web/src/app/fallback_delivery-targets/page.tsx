export const dynamic = "force-dynamic"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { serverApiFetch } from "@/lib/server-api"
import DeliveryTargetsClient from "./delivery-targets-client"
import { TARGET_TYPES } from "@/types/target-types"
import { DeliveryTarget } from "@/types/delivery-target"






type DeliveryTargetsResponse = {
  items: DeliveryTarget[]
}
export default async function DeliveryTargetsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  // Fetch real delivery targets from backend
  const res = await serverApiFetch<DeliveryTargetsResponse>('/delivery-targets')
  const deliveryTargets = res?.items || []

  return (
    <DeliveryTargetsClient
      user={user}
      deliveryTargets={deliveryTargets}
     
    />
  )
}