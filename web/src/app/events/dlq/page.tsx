import { ReplayButton } from "@/components/events/replay-button"
import { WebhookEvent } from "@/lib/constants/events"

async function getDLQ() {
  const res = await fetch(
    `${process.env.API_URL}/events?status=dlq`,
    { cache: "no-store" }
  )

  const data = await res.json()
  return data.items
}

export default async function DLQPage() {
  const events = await getDLQ()

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">

      <h1 className="text-3xl font-bold">Dead Letter Queue</h1>

      <div className="rounded-xl border bg-card">
        {events.map((event: WebhookEvent) => (
          <div
            key={event.id}
            className="flex justify-between items-center p-4 border-b"
          >
            <span>#{event.id}</span>
            <span>{event.provider}</span>
            <span>{event.attempt_count}</span>

            <ReplayButton eventId={event.id} />
          </div>
        ))}
      </div>

    </div>
  )
}