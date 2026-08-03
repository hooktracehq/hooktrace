"use client"

import {
  Clock3,
  FileJson,
  Globe,
  Radio,
} from "lucide-react"

import { StreamJson } from "./stream-json"
import type { Event } from "@/types/event"

type Props = {
  event: Event | null
}

export function StreamInspector({
  event,
}: Props) {

  if (!event) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Select a stream event
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">

      {/* Header */}
      <div className="border-b border-border p-5">

        <div className="flex items-center gap-3">

          <div
            className="
              flex h-11 w-11 items-center justify-center
              rounded-xl border border-border
              bg-background/40
            "
          >
            <Radio className="h-5 w-5 text-orange-400" />
          </div>

          <div>

            <h2 className="text-lg font-semibold">
              Stream Inspector
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              live webhook payload
            </p>

          </div>

        </div>

      </div>

      {/* Meta */}
      <div className="space-y-3 border-b border-border p-5">

        <MetaRow
          icon={Globe}
          label="Provider"
          value={event.provider}
        />

        <MetaRow
          icon={FileJson}
          label="Event Type"
          value={event.event_type}
        />

        <MetaRow
          icon={Clock3}
          label="Latency"
          value={`${event.latency_ms ?? 0} ms`}
        />

      </div>

      {/* Payload */}
      <div className="flex-1 overflow-auto p-5">

        <div className="mb-4">

          <h3 className="text-sm font-semibold">
            Payload
          </h3>

        </div>

        <StreamJson
          payload={event.payload ?? {}}
        />

      </div>

    </div>
  )
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-2 text-sm text-muted-foreground">

        <Icon className="h-4 w-4" />

        {label}

      </div>

      <div className="text-sm font-medium">
        {value}
      </div>

    </div>
  )
}