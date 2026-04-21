"use client"

import { Copy } from "lucide-react"

export function CopyButton({ text }: { text: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs px-3 py-1.5 border rounded-md hover:bg-muted"
    >
      <Copy className="w-3 h-3" />
      Copy ID
    </button>
  )
}