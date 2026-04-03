"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function ReplayButton({ eventId }: { eventId: number }) {
  const [loading, setLoading] = useState(false)

  async function replay() {
    setLoading(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/replay`,
        { method: "POST" }
      )

      if (!res.ok) {
        throw new Error("Replay failed")
      }

      toast.success("Event replayed successfully")
    } catch (err) {
      toast.error("Failed to replay event")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className="inline-flex"
    >
      <Button
        size="sm"
        variant="outline"
        onClick={replay}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <RotateCcw
          className={`h-4 w-4 ${
            loading ? "animate-spin text-muted-foreground" : ""
          }`}
        />
        {loading ? "Replaying…" : "Replay"}
      </Button>
    </motion.div>
  )
}



