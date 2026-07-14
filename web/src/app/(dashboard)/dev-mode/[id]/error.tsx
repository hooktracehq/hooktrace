"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center">

      <h2 className="text-2xl font-semibold">
        Failed to load tunnel
      </h2>

      <p className="mt-2 text-muted-foreground">
        {error.message}
      </p>

      <button
        onClick={reset}
        className="
          mt-6
          rounded-xl
          bg-orange-500
          px-5
          py-2
          text-white
        "
      >
        Try Again
      </button>

    </div>
  )
}