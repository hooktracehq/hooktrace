"use client";

import { useState } from "react";

import { useWebhookStream } from "@/hooks/streams/useWebhookStream";

import { StreamToolbar } from "./stream-toolbar";
import { StreamStats } from "./stream-stats";
import { LiveStream } from "./live-stream";
import { StreamStatusbar } from "./stream-statusbar";

export function StreamsWorkspace() {
  const [paused, setPaused] = useState(false);
  const [query, setQuery] = useState("");

  const {
    events,
    status,
  } = useWebhookStream("/ws/events");
  
  const connected = status === "connected";
  
  const buffered = events.length;

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
        connectionStatus={status}
      />

      <StreamStats
        events={events.length}
        connected={connected}
      />

      <LiveStream
        query={query}
        paused={paused}
      />

      <StreamStatusbar
        connectionStatus={status}
        buffered={buffered}
      />
    </div>
  );
}