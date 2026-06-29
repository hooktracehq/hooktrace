"use client"

import Image from "next/image"

type LoadingScreenProps = {
  title?: string
  description?: string
}

export function LoadingScreen({
  title = "Hooktrace",
  description = "Loading...",
}: LoadingScreenProps) {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-6">

        {/* Logo */}
        <div className="relative">

          {/* Glow */}
          <div
            className="
              absolute inset-0
              rounded-full
              bg-orange-500/20
              blur-3xl
              animate-pulse
            "
          />

          {/* Floating logo */}
          <div
            className="
              relative
              animate-[loadingBounce_2.5s_ease-in-out_infinite]
            "
          >
            <Image
              src="/loading.png"
              alt="Hooktrace"
              width={110}
              height={110}
              priority
            />
          </div>

        </div>

        {/* Text */}
        <div className="space-y-2 text-center">

          <h2 className="text-xl font-semibold">
            {title}
          </h2>

          <p className="text-sm text-muted-foreground">
            {description}
          </p>

        </div>

        {/* Animated dots */}
        <div className="flex gap-2">

          <span className="h-2 w-2 rounded-full bg-orange-400 animate-bounce" />

          <span
            className="h-2 w-2 rounded-full bg-orange-400 animate-bounce"
            style={{
              animationDelay: "150ms",
            }}
          />

          <span
            className="h-2 w-2 rounded-full bg-orange-400 animate-bounce"
            style={{
              animationDelay: "300ms",
            }}
          />

        </div>

      </div>
    </div>
  )
}