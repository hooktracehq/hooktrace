"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"

export function ReplayButton({
  eventId,
}: {
  eventId: number
}) {
  const [loading, setLoading] = useState(false)

  async function handleReplay() {
    if (loading) return

    console.log(
      "[ReplayButton] clicked",
      eventId
    )

    setLoading(true)

    try {
      const result = await apiFetch(
        `/events/${eventId}/replay`,
        {
          method: "POST",
        }
      )

      console.log(
        "[ReplayButton] API response:",
        result
      )

      toast.success(
        `Event #${eventId} replay queued`
      )
    } catch (error) {
      console.error(
        "[ReplayButton] replay failed:",
        error
      )

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to replay event"
      )
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
        type="button"
        size="sm"
        variant="outline"
        onClick={handleReplay}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <RotateCcw
          className={
            loading
              ? "h-4 w-4 animate-spin"
              : "h-4 w-4"
          }
        />

        {loading
          ? "Replaying..."
          : "Replay Delivery"}
      </Button>
    </motion.div>
  )
}