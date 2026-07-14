"use client"

import { useState } from "react"

import {
  Check,
  Copy,
} from "lucide-react"

type Props = {
  value: string
}

export function TunnelCopy({
  value,
}: Props) {
  const [copied, setCopied] =
    useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(
      value,
    )

    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 1800)
  }

  return (
    <button
      onClick={handleCopy}
      className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-lg
        border
        border-border
        bg-card
        transition-colors
        hover:bg-accent
      "
      title="Copy URL"
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  )
}