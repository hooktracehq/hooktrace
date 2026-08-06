"use client"

import { ReplayButton } from "@/components/ReplayButton"

import { EventDeliveries } from "@/app/events/event-deliveries"

import {
    Activity,
    Boxes,
    FileJson,
    RotateCcw,
    type LucideIcon,
  } from "lucide-react"

import JsonView from "@uiw/react-json-view"

import type { Event } from "@/types/event"

type Props = {
  event: Event | null
}

export function EventDetailsPanel({
  event,
}: Props) {
  if (!event) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Select an event
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* Header */}
      <div className="border-b border-border p-4">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm font-semibold">
              Event Inspector
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              #{event.id}
            </p>
          </div>

          <ReplayButton
            eventId={event.id}
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">

        {/* Meta */}
        <div className="border-b border-border p-4">

          <div className="space-y-3">

            <MetaRow
              icon={Activity}
              label="Provider"
              value={
                event.provider ||
                "generic"
              }
            />

            <MetaRow
              icon={Boxes}
              label="Route"
              value={event.route}
            />

            <MetaRow
              icon={RotateCcw}
              label="Attempts"
              value={String(
                event.attempt_count ?? 0
              )}
            />
          </div>
        </div>

        {/* Payload */}
        <div className="border-b border-border p-4">

          <div className="mb-3 flex items-center gap-2">
            <FileJson className="h-4 w-4 text-primary" />

            <h3 className="text-sm font-medium">
              Payload
            </h3>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-surface-1 p-3">
            <JsonView
              value={
                event.payload || {}
              }
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={true}
            />
          </div>
        </div>

        {/* Deliveries */}
        <div className="p-4">

          <div className="mb-4">
            <h3 className="text-sm font-medium">
              Deliveries
            </h3>
          </div>

          <EventDeliveries
            eventId={event.id}
          />
        </div>
      </div>
    </div>
  )
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>

      <div className="text-xs font-medium">
        {value}
      </div>
    </div>
  )
}