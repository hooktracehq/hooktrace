"use client"

import Image from "next/image"
import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Shot({
  src,
  alt,
  priority,
  className = "",
  sizes = "(min-width: 1024px) 60vw, 100vw",
}: {
  src: string
  alt: string
  priority?: boolean
  className?: string
  sizes?: string
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-card shadow-[0_40px_90px_-40px_rgba(0,0,0,0.7)] ${className}`}
    >
      <div className="flex items-center gap-1.5 border-b border-border px-3.5 py-2.5">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
      </div>
      <Image
        src={src}
        alt={alt}
        width={1900}
        height={870}
        sizes={sizes}
        priority={priority}
        className="h-auto w-full"
      />
    </div>
  )
}