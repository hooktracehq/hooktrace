"use client"

import { motion } from "framer-motion"

import { Play } from "lucide-react"

import { useTestDestination } from "@/hooks/destinations/use-test-destination"

type Props = {
  targetId: string
}

export default function TestTargetButton({
  targetId,
}: Props) {
  const test = useTestDestination()

  async function handleClick() {
    try {
      await test.mutateAsync(targetId)

      alert("✅ Test successful")
    } catch {
      alert("❌ Test failed")
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      disabled={test.isPending}
      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
    >
      <Play className="h-4 w-4" />

      {test.isPending
        ? "Testing..."
        : "Test"}
    </motion.button>
  )
}