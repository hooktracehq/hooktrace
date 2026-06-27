import Image from "next/image"

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-92px)] items-center justify-center">
      <div className="flex flex-col items-center gap-6">

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

          {/* Logo */}
          <div
            className="
              relative
              animate-[loadingBounce_2.5s_ease-in-out_infinite]
            "
          >
            <Image
              src="/loading.png"
              alt="Hooktrace"
              width={120}
              height={120}
              priority
            />
          </div>

        </div>

        <div className="space-y-2 text-center">

          <h2 className="text-xl font-semibold">
            Hooktrace
          </h2>

          <p className="text-sm text-muted-foreground">
            Initializing Event Operations...
          </p>

        </div>

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