"use client"

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "cmdk"

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  Cable,
  Radio,
} from "lucide-react"

import { useRouter } from "next/navigation"

import { useCommandStore } from "@/app/stores/command-store"

import { useCommandMenu } from "@/hooks/use-command-menu"

export function CommandMenu() {
  useCommandMenu()

  const router = useRouter()

  const open =
    useCommandStore(
      (s) => s.open
    )

  const setOpen =
    useCommandStore(
      (s) => s.setOpen
    )

  return (
    <>
      {open && (
        <div
          className="
            fixed inset-0 z-[100]
            bg-black/50
            backdrop-blur-sm
          "
          onClick={() =>
            setOpen(false)
          }
        />
      )}

      <div
        className={`
          fixed left-1/2 top-[18%]
          z-[101]
          w-full max-w-2xl
          -translate-x-1/2
          transition-all duration-200
          ${
            open
              ? "opacity-100 scale-100"
              : "pointer-events-none opacity-0 scale-95"
          }
        `}
      >

        <Command
          className="
            overflow-hidden rounded-2xl
            border border-border
            bg-background
            shadow-2xl
          "
        >

          <CommandInput
            placeholder="Search commands..."
            className="
              h-14 w-full border-b
              border-border bg-transparent
              px-4 text-sm outline-none
            "
          />

          <CommandList className="max-h-[420px] overflow-y-auto p-2">

            <CommandGroup heading="Navigation">

              <CommandItem
                onSelect={() => {
                  router.push("/events")
                  setOpen(false)
                }}
                className="command-item"
              >
                <Activity className="h-4 w-4" />
                Events
              </CommandItem>

              <CommandItem
                onSelect={() => {
                  router.push("/metrics")
                  setOpen(false)
                }}
                className="command-item"
              >
                <BarChart3 className="h-4 w-4" />
                Metrics
              </CommandItem>

              <CommandItem
                onSelect={() => {
                  router.push("/dlq")
                  setOpen(false)
                }}
                className="command-item"
              >
                <AlertTriangle className="h-4 w-4" />
                Dead Letter Queue
              </CommandItem>

              <CommandItem
                onSelect={() => {
                  router.push("/integrations")
                  setOpen(false)
                }}
                className="command-item"
              >
                <Cable className="h-4 w-4" />
                Integrations
              </CommandItem>

              <CommandItem
                onSelect={() => {
                  router.push("/streams")
                  setOpen(false)
                }}
                className="command-item"
              >
                <Radio className="h-4 w-4" />
                Streams
              </CommandItem>

              <CommandItem
                onSelect={() => {
                  router.push("/delivery-targets")
                  setOpen(false)
                }}
                className="command-item"
              >
                <Boxes className="h-4 w-4" />
                Delivery Targets
              </CommandItem>

            </CommandGroup>

            <CommandSeparator />

          </CommandList>

        </Command>
      </div>
    </>
  )
}