"use client"

import { useState } from "react"

import type { JsonValue } from "@/types/json"

export function EventDetailTabs({
  payload,
  headers,
  error,
}: {
  payload: JsonValue
  headers: JsonValue
  error?: string | null
}) {
  const [tab, setTab] = useState<"payload" | "headers" | "error">("payload")

  return (
    <div className="rounded-xl border bg-card overflow-hidden">

      {/* Tabs */}
      <div className="flex border-b bg-muted/30">
        {[
          { key: "payload", label: "Payload" },
          { key: "headers", label: "Headers" },
          { key: "error", label: "Error" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as "payload" | "headers" | "error")}
            className={`px-4 py-2 text-sm font-medium transition ${
              tab === t.key
                ? "bg-background border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">

        {tab === "payload" && <JsonBlock data={payload} />}
        {tab === "headers" && <JsonBlock data={headers} />}

        {tab === "error" && (
          <pre className="text-sm whitespace-pre-wrap text-red-500">
            {error || "No errors"}
          </pre>
        )}

      </div>
    </div>
  )
}

/* JSON block */

function JsonBlock({ data }: { data: JsonValue }) {
  return (
    <div className="space-y-2">

      <div className="flex justify-between">
        <p className="text-xs text-muted-foreground">JSON</p>

        <button
          onClick={() =>
            navigator.clipboard.writeText(
              JSON.stringify(data, null, 2)
            )
          }
          className="text-xs px-2 py-1 border rounded hover:bg-muted"
        >
          Copy
        </button>
      </div>

      <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-[400px]">
        {JSON.stringify(data, null, 2)}
      </pre>

    </div>
  )
}