"use client"

import { Toaster } from "sonner"

export function SystemToasts() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      expand={false}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "!bg-[#0B1120] !border !border-white/10",
        },
      }}
    />
  )
}