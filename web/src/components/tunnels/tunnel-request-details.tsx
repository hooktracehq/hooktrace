"use client"

import { useMemo, useState } from "react"

import {
  Check,
  Copy,
  FileJson,
  Globe,
  ListTree,
} from "lucide-react"

import clsx from "clsx"

import type { TunnelLog } from "@/types/tunnel"

type Props = {
  request: TunnelLog
}

function pretty(value: unknown) {
  if (value == null) return ""

  if (typeof value === "string") {
    try {
      return JSON.stringify(
        JSON.parse(value),
        null,
        2,
      )
    } catch {
      return value
    }
  }

  return JSON.stringify(value, null, 2)
}

export function TunnelRequestDetails({
  request,
}: Props) {
  const [tab, setTab] = useState<
    "request" | "response" | "headers"
  >("request")

  const [copied, setCopied] =
    useState(false)

  const requestBody = useMemo(
    () => pretty(request.requestBody),
    [request.requestBody],
  )

  const responseBody = useMemo(
    () => pretty(request.responseBody),
    [request.responseBody],
  )

  async function copy() {
    const text =
      tab === "request"
        ? requestBody
        : tab === "response"
        ? responseBody
        : JSON.stringify(
            request.requestHeaders,
            null,
            2,
          )

    await navigator.clipboard.writeText(
      text,
    )

    setCopied(true)

    setTimeout(
      () => setCopied(false),
      1500,
    )
  }

  return (
    <div
      className="
        border-b
        border-border
        bg-muted/20
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-border
          px-5
          py-3
        "
      >
        <div className="flex gap-2">

          <button
            onClick={() =>
              setTab("request")
            }
            className={clsx(
              `
              flex
              items-center
              gap-2
              rounded-lg
              px-3
              py-2
              text-sm
              transition-colors
            `,
              tab === "request"
                ? "bg-orange-500 text-white"
                : "hover:bg-accent",
            )}
          >
            <FileJson className="h-4 w-4" />
            Request
          </button>

          <button
            onClick={() =>
              setTab("response")
            }
            className={clsx(
              `
              flex
              items-center
              gap-2
              rounded-lg
              px-3
              py-2
              text-sm
              transition-colors
            `,
              tab === "response"
                ? "bg-orange-500 text-white"
                : "hover:bg-accent",
            )}
          >
            <Globe className="h-4 w-4" />
            Response
          </button>

          <button
            onClick={() =>
              setTab("headers")
            }
            className={clsx(
              `
              flex
              items-center
              gap-2
              rounded-lg
              px-3
              py-2
              text-sm
              transition-colors
            `,
              tab === "headers"
                ? "bg-orange-500 text-white"
                : "hover:bg-accent",
            )}
          >
            <ListTree className="h-4 w-4" />
            Headers
          </button>

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
            py-2
            text-sm
            hover:bg-accent
          "
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </button>

      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-4">

        <div
          className="
            space-y-3
            rounded-xl
            border
            border-border
            bg-card
            p-4
          "
        >
          <div>

            <div className="text-xs text-muted-foreground">
              Method
            </div>

            <div className="mt-1 font-medium">
              {request.method}
            </div>

          </div>

          <div>

            <div className="text-xs text-muted-foreground">
              Status
            </div>

            <div className="mt-1 font-medium">
              {request.statusCode}
            </div>

          </div>

          <div>

            <div className="text-xs text-muted-foreground">
              Duration
            </div>

            <div className="mt-1 font-medium">
              {request.duration} ms
            </div>

          </div>

          <div>

            <div className="text-xs text-muted-foreground">
              Time
            </div>

            <div className="mt-1 text-sm">
              {new Date(
                request.timestamp,
              ).toLocaleString()}
            </div>

          </div>

        </div>

        <div className="lg:col-span-3">

          <pre
            className="
              overflow-auto
              rounded-xl
              border
              border-border
              bg-card
              p-5
              font-mono
              text-sm
              leading-6
            "
          >
            {tab === "request"
              ? requestBody || "No body"

              : tab === "response"
              ? responseBody || "No response"

              : JSON.stringify(
                  request.requestHeaders,
                  null,
                  2,
                )}
          </pre>

          {request.error && (
            <div
              className="
                mt-5
                rounded-xl
                border
                border-red-500/30
                bg-red-500/10
                p-4
              "
            >
              <div className="font-semibold text-red-400">
                Error
              </div>

              <p className="mt-2 whitespace-pre-wrap text-sm">
                {request.error}
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}