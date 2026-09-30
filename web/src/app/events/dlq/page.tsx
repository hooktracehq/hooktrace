
import { getEvents } from "@/lib/services/events"

import DLQClient from "./DLQClient"

export default async function DLQPage() {
  const data = await getEvents({
    status: "dlq",
  })

  return (
    <DLQClient
      initialEvents={data?.items ?? []}
    />
  )
}