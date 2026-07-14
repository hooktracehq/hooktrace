"use client"

import { useState } from "react"

import {
  Check,
  Copy,
  FileJson,
} from "lucide-react"

type Props = {
  title?: string
  data: unknown
}

function formatJson(data: unknown) {
  if (data == null) return ""

  if (typeof data === "string") {
    try {
      return JSON.stringify(
        JSON.parse(data),
        null,
        2,
      )
    } catch {
      return data
    }
  }

  return JSON.stringify(
    data,
    null,
    2,
  )
}

export function TunnelJsonViewer({
  title = "JSON",
  data,
}: Props) {
  const [copied, setCopied] =
    useState(false)

  const formatted =
    formatJson(data)

  async function copy() {
    await navigator.clipboard.writeText(
      formatted,
    )

    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 1500)
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-border
        bg-card
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-border
          px-4
          py-3
        "
      >
        <div className="flex items-center gap-2">

          <FileJson className="h-4 w-4 text-orange-400" />

          <span className="text-sm font-medium">
            {title}
          </span>

        </div>

        <button
          onClick={copy}
          className="
            flex
            items-center
            gap-2
            rounded-lg
            border
            border-border
            px-3
            py-1.5
            text-xs
            transition-colors
            hover:bg-accent
          "
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      <pre
        className="
          max-h-[500px]
          overflow-auto
          bg-background
          p-5
          font-mono
          text-xs
          leading-6
          text-orange-300
        "
      >
        {formatted || "No Data"}
      </pre>
    </div>
  )
}