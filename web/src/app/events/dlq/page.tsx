import DLQClient from "./DLQClient"

async function getDLQ() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/events?status=dlq`,
    { cache: "no-store" }
  )

  const data = await res.json()
  return data.items || []
}

export default async function DLQPage() {
  const events = await getDLQ()

  return <DLQClient initialEvents={events} />
}