"use client"

import { useState } from "react"

import { motion } from "framer-motion"

import { useCreateTunnel } from "@/hooks/tunnels/use-create-tunnel"

type Props = {
  onClose: () => void
}

export function CreateTunnelModal({
  onClose,
}: Props) {
  const [name, setName] =
    useState("My Local Server")

  const [localUrl, setLocalUrl] =
    useState("http://localhost:3000")

  const createTunnel =
    useCreateTunnel()

  async function handleCreate() {
    try {
      await createTunnel.mutateAsync({
        name,
        local_url: localUrl,
      })

      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to create tunnel.")
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="
          fixed
          left-1/2
          top-1/2
          z-50
          w-full
          max-w-lg
          -translate-x-1/2
          -translate-y-1/2
          rounded-2xl
          border
          border-border
          bg-card
          p-6
          shadow-2xl
        "
      >
        <h2 className="text-xl font-semibold">
          Create Tunnel
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Forward incoming webhooks directly to your local development server.
        </p>

        <div className="mt-6 space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Tunnel Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="
                w-full
                rounded-xl
                border
                border-border
                bg-background
                px-4
                py-3
                outline-none
                focus:ring-2
                focus:ring-orange-500
              "
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Local URL
            </label>

            <input
              value={localUrl}
              onChange={(e) =>
                setLocalUrl(e.target.value)
              }
              className="
                w-full
                rounded-xl
                border
                border-border
                bg-background
                px-4
                py-3
                font-mono
                outline-none
                focus:ring-2
                focus:ring-orange-500
              "
            />

            <p className="mt-2 text-xs text-muted-foreground">
              Example: http://localhost:3000
            </p>
          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="
              rounded-xl
              border
              border-border
              px-5
              py-2.5
            "
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={
              createTunnel.isPending
            }
            className="
              rounded-xl
              bg-orange-500
              px-5
              py-2.5
              font-medium
              text-white
              hover:bg-orange-600
              disabled:opacity-50
            "
          >
            {createTunnel.isPending
              ? "Creating..."
              : "Create Tunnel"}
          </button>

        </div>

      </motion.div>
    </>
  )
}