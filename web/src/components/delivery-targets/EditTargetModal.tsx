"use client"

import { useState } from "react"

import { motion, AnimatePresence } from "framer-motion"

import TargetForm from "./TargetForm"

import type {
  Destination,
  DeliveryTargetPayload,
} from "@/types/destinations"

import { useUpdateDestination } from "@/hooks/destinations/use-update-destination"

type Props = {
  target: Destination

  onUpdated: (
    target: Destination
  ) => void
}

export default function EditTargetModal({
  target,
  onUpdated,
}: Props) {
  const [open, setOpen] =
    useState(false)

  const updateTarget =
    useUpdateDestination()

  async function handleUpdate(
    data: DeliveryTargetPayload
  ) {
    const updated =
      await updateTarget.mutateAsync({
        id: target.id,
        data,
      })

    onUpdated(updated)

    setOpen(false)
  }

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="text-xs hover:underline"
      >
        Edit
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              className="bg-card w-full max-w-md rounded-2xl p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">

                <h2 className="font-semibold">
                  Edit Target
                </h2>

                <button
                  onClick={() =>
                    setOpen(false)
                  }
                >
                  ✕
                </button>

              </div>

              <TargetForm
                initial={target}
                onSubmit={handleUpdate}
                loading={
                  updateTarget.isPending
                }
              />

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}