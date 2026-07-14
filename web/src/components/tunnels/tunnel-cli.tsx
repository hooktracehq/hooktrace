"use client"

import { useState } from "react"

import {
  Check,
  Terminal,
} from "lucide-react"

type Props = {
  token: string
}

export function TunnelCli({
  token,
}: Props) {
  const [copied, setCopied] =
    useState(false)

console.log(token)

  const command =
    `python -m services.cli.listen 3000 ${token}`

  async function copyCommand() {
    await navigator.clipboard.writeText(
      command,
    )

    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div
      className="
        mt-5
        rounded-xl
        border
        border-border
        bg-background
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

          <Terminal className="h-4 w-4 text-orange-400" />

          <span className="text-sm font-medium">
            CLI Command
          </span>

        </div>

        <button
          onClick={copyCommand}
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
            "Copy"
          )}
        </button>
      </div>

      <pre
        className="
          overflow-x-auto
          px-4
          py-4
          font-mono
          text-xs
          text-orange-300
        "
      >
{command}
      </pre>
    </div>
  )
}