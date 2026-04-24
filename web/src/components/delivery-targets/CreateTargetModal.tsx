"use client"

import { useState } from "react"
import TargetForm from "./TargetForm"
import type {
  DeliveryTarget,
  DeliveryTargetPayload,
} from "@/types/delivery-target"

type Props = {
  onCreated: (target: DeliveryTarget) => void
}

export default function CreateTargetModal({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCreate(data: DeliveryTargetPayload) {
    setLoading(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery-targets`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      )

      const result: DeliveryTarget = await res.json()

      onCreated(result)
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        New Target
      </button>
    )
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
  
      <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl">
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Create Target</h2>
  
          <button onClick={() => setOpen(false)}>✕</button>
        </div>
  
        <TargetForm onSubmit={handleCreate} loading={loading} />
  
      </div>
    </div>
  )
}