"use client"

import { useEffect, useState } from "react"

const launchDate = new Date("2026-04-15T00:00:00Z")

export function LaunchCountdown() {
  const [timeLeft, setTimeLeft] = useState(() => launchDate.getTime() - Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(launchDate.getTime() - Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const days = Math.max(Math.floor(timeLeft / (1000 * 60 * 60 * 24)), 0)
  const hours = Math.max(Math.floor((timeLeft / (1000 * 60 * 60)) % 24), 0)
  const minutes = Math.max(Math.floor((timeLeft / (1000 * 60)) % 60), 0)
  const seconds = Math.max(Math.floor((timeLeft / 1000) % 60), 0)

  return (
    <div className="mt-10 text-center">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        Launching In
      </p>

      <div className="mt-4 flex justify-center gap-6 text-2xl font-semibold">
        <TimeBlock label="Days" value={days} />
        <TimeBlock label="Hours" value={hours} />
        <TimeBlock label="Min" value={minutes} />
        <TimeBlock label="Sec" value={seconds} />
      </div>
    </div>
  )
}

function TimeBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-primary">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-xs text-muted-foreground">
        {label}
      </span>
    </div>
  )
}
