"use client"

import JsonView from "@uiw/react-json-view"

type Props = {
    payload: Record<string, unknown> | undefined
  }

export function StreamJson({
  payload,
}: Props) {
  return (
    <div
      className="
        overflow-hidden rounded-xl
        border border-border
        bg-background/40
        p-4
      "
    >

      <JsonView
        value={payload}
        displayDataTypes={false}
        displayObjectSize={false}
        enableClipboard
      />

    </div>
  )
}