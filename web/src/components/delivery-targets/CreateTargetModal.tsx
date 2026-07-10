"use client"

import { useState } from "react"

import { motion, AnimatePresence } from "framer-motion"
import { Plus } from "lucide-react"
import TargetForm from "./TargetForm"

import type {
  Destination,
  DeliveryTargetPayload,
} from "@/types/destinations"

import { useCreateDestination } from "@/hooks/destinations/use-create-destination"

type Props = {
  onCreated: (
    target: Destination
  ) => void
}

export default function CreateTargetModal({
  onCreated,
}: Props) {
  const [open, setOpen] =
    useState(false)

  const createTarget =
    useCreateDestination()

  async function handleCreate(
    data: DeliveryTargetPayload
  ) {
    const result =
      await createTarget.mutateAsync(data)

    onCreated(result)

    setOpen(false)
  }

  if (!open) {
    return (
      

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        New Target
      </motion.button>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
            y: 10,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: 10,
          }}
          className="bg-card w-full max-w-md rounded-2xl p-6 shadow-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">
              Create Target
            </h2>

            <button
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          <TargetForm
            onSubmit={handleCreate}
            loading={createTarget.isPending}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}