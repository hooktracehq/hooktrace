"use client"

import { useState } from "react"

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import {
  Trash2,
} from "lucide-react"

import type {
  Destination,
} from "@/types/destinations"

import {
  useDeleteDestination,
} from "@/hooks/destinations/use-delete-destination"

type Props = {
  target: Destination

  onDeleted: (id: string) => void
}

export default function DeleteTargetDialog({
  target,
  onDeleted,
}: Props) {
  const [open, setOpen] =
    useState(false)

  const remove =
    useDeleteDestination()

  async function handleDelete() {
    await remove.mutateAsync(
      target.id
    )

    onDeleted(target.id)

    setOpen(false)
  }

  return (
    <>
      <motion.button
        whileTap={{
          scale: 0.96,
        }}
        onClick={() =>
          setOpen(true)
        }
        className="flex items-center gap-2 rounded-lg border border-red-500 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" />

        Delete
      </motion.button>

      <AnimatePresence>

        {open && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >

            <motion.div
              initial={{
                scale: 0.95,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.95,
                opacity: 0,
              }}
              className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-xl"
            >

              <h2 className="mb-2 text-lg font-semibold">
                Delete Target
              </h2>

              <p className="mb-6 text-sm text-muted-foreground">
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-2">

                <button
                  onClick={() =>
                    setOpen(false)
                  }
                  className="rounded-lg border px-4 py-2"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleDelete
                  }
                  disabled={
                    remove.isPending
                  }
                  className="rounded-lg bg-red-500 px-4 py-2 text-white"
                >
                  {remove.isPending
                    ? "Deleting..."
                    : "Delete"}
                </button>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>
    </>
  )
}