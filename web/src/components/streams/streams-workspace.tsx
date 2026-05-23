"use client"

import { useState } from "react"

import { StreamToolbar } from "./stream-toolbar"

import { StreamStats } from "./stream-stats"

import { LiveStream } from "./live-stream"

import { StreamStatusbar } from "./stream-statusbar"

export function StreamsWorkspace() {

  const [paused, setPaused] =
    useState(false)

  const [query, setQuery] =
    useState("")

  return (
    <div
      className="
        flex h-[calc(100vh-92px)]
        flex-col overflow-hidden
        rounded-2xl border border-border
        bg-surface-1
      "
    >

      <StreamToolbar
        paused={paused}
        setPaused={setPaused}
        query={query}
        setQuery={setQuery}
      />

      <StreamStats />

      <LiveStream
        query={query}
      />

      <StreamStatusbar />

    </div>
  )
}