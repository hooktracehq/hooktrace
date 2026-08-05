"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"

import { StreamRow } from "./stream-row"

import type { Event } from "@/types/event"

type Props = {
  rows: Event[]
  selected: Event | null
  onSelect: (row: Event) => void
}

export function LiveStreamTable({
  rows,
  selected,
  onSelect,
}: Props) {

  const containerRef =
    useRef<HTMLDivElement>(null)

  const [autoScroll, setAutoScroll] =
    useState(true)

  useEffect(() => {
    if (
      autoScroll &&
      containerRef.current
    ) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
  }, [rows, autoScroll])

  return (
    <div
      ref={containerRef}
      onScroll={(e) => {
        setAutoScroll(
          e.currentTarget.scrollTop < 40
        )
      }}
      className="h-full overflow-auto"
    >

      <div
        className="
          sticky top-0 z-10
          grid
          grid-cols-[120px_1fr_180px_120px_120px_140px]
          border-b border-border
          bg-background/95
          px-5 py-3
          text-xs uppercase tracking-wide
          text-muted-foreground
          backdrop-blur
        "
      >

        <div>Provider</div>
        <div>Route</div>
        <div>Event</div>
        <div>Status</div>
        <div>Latency</div>
        <div>Time</div>

      </div>

      {rows.map((row) => (

        <StreamRow
          key={row.id}
          provider={row.provider}
          route={row.route}
          status={row.status}
          latency={row.latency_ms ?? 0}
          timestamp={
            new Date(row.created_at)
          }
          eventType={row.event_type}
          selected={selected?.id === row.id}
          onClick={() => onSelect(row)}
        />

      ))}

    </div>
  )
}