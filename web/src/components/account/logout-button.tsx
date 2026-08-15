"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Loader2 } from "lucide-react"

type Props = {
  className?: string
}

export function LogoutButton({
  className = "",
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    if (loading) return

    try {
      setLoading(true)

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:3001"

      const response = await fetch(
        `${apiUrl}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      )

      if (!response.ok) {
        throw new Error(
          `Logout failed (${response.status})`
        )
      }

      router.replace("/login")
      router.refresh()
    } catch (error) {
      console.error(
        "Failed to log out:",
        error
      )

      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`
        flex w-full items-center gap-2
        rounded-lg px-3 py-2
        text-sm text-rose-400
        transition-colors
        hover:bg-rose-500/10
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}

      {loading
        ? "Logging out..."
        : "Log out"}
    </button>
  )
}