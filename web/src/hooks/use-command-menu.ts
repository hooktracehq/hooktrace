"use client"

import { useEffect } from "react"

import { useCommandStore } from "@/app/stores/command-store"

export function useCommandMenu() {
  const toggle =
    useCommandStore(
      (s) => s.toggle
    )

  useEffect(() => {
    const down = (
      e: KeyboardEvent
    ) => {
      if (
        (e.metaKey ||
          e.ctrlKey) &&
        e.key === "k"
      ) {
        e.preventDefault()

        toggle()
      }
    }

    document.addEventListener(
      "keydown",
      down
    )

    return () =>
      document.removeEventListener(
        "keydown",
        down
      )
  }, [toggle])
}