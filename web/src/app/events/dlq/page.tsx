import { ReplayButton } from "@/components/events/replay-button"
import { WebhookEvent } from "@/lib/constants/events"
import { PageHeader } from "@/components/ui/page-header"

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

      <PageHeader
        title="Needs Attention"
        description="Events that failed all retry attempts"
      />

      <div className="rounded-xl border bg-card divide-y">
        {events.map((event: WebhookEvent) => (
          <div
            key={event.id}
            className="flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-6 text-sm">
              <span className="font-mono">#{event.id}</span>
              <span className="text-muted-foreground">
                {event.provider || "Generic"}
              </span>
              <span className="text-muted-foreground">
                Attempts: {event.attempt_count}
              </span>
            </div>

            <ReplayButton eventId={event.id} />
          </div>
        ))}
      </div>

    </div>
  )
}