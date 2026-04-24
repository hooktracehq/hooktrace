"use client"

import { useState } from "react"
import TargetForm from "./TargetForm"
import type {
  DeliveryTarget,
  DeliveryTargetPayload,
} from "@/types/delivery-target"

type Props = {
  target: DeliveryTarget
  onUpdated: (target: DeliveryTarget) => void
}

export default function EditTargetModal({ target, onUpdated }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleUpdate(data: DeliveryTargetPayload) {
    setLoading(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery-targets/${target.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      )

      const updated: DeliveryTarget = await res.json()

      onUpdated(updated)
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
  <button onClick={() => setOpen(true)} className="text-xs">
    Edit
  </button>

  {open && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl">

        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Edit Target</h2>

          <button onClick={() => setOpen(false)}>✕</button>
        </div>

        <TargetForm
          initial={target}
          onSubmit={handleUpdate}
          loading={loading}
        />

      </div>
    </div>
  )}
</>
  )
}