


// "use client"

// import Image from "next/image"
// import { motion } from "framer-motion"
// import { event } from "@/lib/gtag"
// import { LaunchSection } from "@/components/landing/launch-countdown"
// import { WaitlistForm } from "@/components/landing/waitlist-form"
// // import { Features } from "@/components/landing/features"
// import { useEffect, useRef } from "react"

// export function Hero() {
//   const hasTrackedScroll = useRef(false)

//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollPercent =
//         (window.scrollY /
//           (document.body.scrollHeight - window.innerHeight)) *
//         100

//       if (scrollPercent > 50 && !hasTrackedScroll.current) {
//         hasTrackedScroll.current = true

//         event({
//           action: "scroll_50",
//           category: "engagement",
//           label: "landing_page",
//         })
//       }
//     }

//     window.addEventListener("scroll", handleScroll)
//     return () => window.removeEventListener("scroll", handleScroll)
//   }, [])

//   return (
//     <section
//       id="waitlist"
//       className="
//         relative
//         min-h-screen
//         flex flex-col items-center justify-center
//         text-center
//         px-5 sm:px-6
//         pt-32 sm:pt-36 md:pt-40
//         pb-20
//         bg-background
//         overflow-hidden
//       "
//     >
//       {/* Background Glow */}
//       <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_hsl(var(--primary)/0.22),_transparent_70%)]" />

//       {/* Subtle Grid */}
//       <div className="absolute inset-0 -z-20 opacity-[0.025] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:42px_42px]" />

//       <div className="w-full max-w-4xl flex flex-col items-center">

//         {/* Logo */}
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ duration: 0.4 }}
//           className="mb-6 sm:mb-8"
//         >
//           <Image
//             src="/logo.png"
//             alt="HookTrace Logo"
//             width={160}
//             height={160}
//             priority
//             className="
//               w-20 sm:w-28 md:w-36
//               drop-shadow-[0_0_60px_hsl(var(--primary)/0.55)]
//             "
//           />
//         </motion.div>

//         {/* Headline */}
//         <motion.h1
//           initial={{ y: 25, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.15 }}
//           className="
//             text-2xl sm:text-4xl md:text-6xl
//             font-semibold
//             tracking-tight
//             leading-[1.2]
//             max-w-3xl
//           "
//         >
//           Webhooks fail silently.{" "}
//           <span className="text-primary">
//             Stop digging through logs.
//           </span>
//         </motion.h1>

//         {/* Subheading */}
//         <motion.p
//           initial={{ y: 25, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.25 }}
//           className="
//             mt-5 sm:mt-6
//             text-muted-foreground
//             max-w-xl
//             text-sm sm:text-base md:text-lg
//             leading-relaxed
//           "
//         >
//           See every failed webhook delivery instantly.
//           Replay events with one click.
//           No silent drops. No buried logs.
//         </motion.p>

//         {/* Waitlist */}
//         <motion.div
//           initial={{ y: 25, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.35 }}
//           className="mt-8 sm:mt-10 w-full flex justify-center"
//         >
//           <WaitlistForm />
//         </motion.div>

//         {/* GitHub Badge (moved lower for better focus) */}
//         <motion.a
//           href="https://www.github.com/yasir761/hooktrace"
//           target="_blank"
//           rel="noopener noreferrer"
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.45 }}
//           className="
//             mt-6
//             inline-flex items-center gap-2
//             rounded-full
//             border border-border
//             px-4 py-1.5
//             text-xs font-medium
//             text-muted-foreground
//             hover:bg-muted
//             transition
//           "
//         >
//           ⭐ Open Source on GitHub
//         </motion.a>

//         {/* Countdown */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.55 }}
//           className="mt-10"
//         >
//           <LaunchSection />
//         </motion.div>

//         {/* Trust Line */}
//         <p className="mt-8 text-xs text-muted-foreground">
//           No spam. No noise. Just webhook reliability.
//         </p>

//       </div>

//       {/* Codilad Credit */}
// <p className="mt-3 text-xs text-muted-foreground">
//   A product by{" "}
//   <a
//     href="https://codilad.dev"
//     target="_blank"
//     rel="noopener noreferrer"
//     className="underline underline-offset-4 hover:text-foreground transition"
//   >
//     codilad.dev
//   </a>
// </p>
// {/* <Features/> */}
//     </section>
//   )
// }





"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { event } from "@/lib/gtag"
import { LaunchSection } from "@/components/landing/launch-countdown"
import { WaitlistForm } from "@/components/landing/waitlist-form"
import { useEffect, useRef } from "react"

export function Hero() {
  const hasTrackedScroll = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent =
        (window.scrollY /
          (document.body.scrollHeight - window.innerHeight)) *
        100

      if (scrollPercent > 50 && !hasTrackedScroll.current) {
        hasTrackedScroll.current = true

        event({
          action: "scroll_50",
          category: "engagement",
          label: "landing_page",
        })
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section
      id="waitlist"
      className="
        relative
        min-h-screen
        flex flex-col items-center justify-center
        text-center
        px-5 sm:px-6
        pt-32 sm:pt-36 md:pt-40
        pb-20
        bg-background
        overflow-hidden
      "
    >
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_hsl(var(--primary)/0.22),_transparent_70%)]" />

      {/* Subtle Grid */}
      <div className="absolute inset-0 -z-20 opacity-[0.025] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="w-full max-w-4xl flex flex-col items-center">

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <Image
            src="/logo.png"
            alt="HookTrace Logo"
            width={160}
            height={160}
            priority
            className="
              w-20 sm:w-28 md:w-36
              drop-shadow-[0_0_60px_hsl(var(--primary)/0.55)]
            "
          />
        </motion.div>

        {/* 🔥 HEADLINE (UPDATED) */}
        <motion.h1
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="
            text-2xl sm:text-4xl md:text-6xl
            font-semibold
            tracking-tight
            leading-[1.2]
            max-w-3xl
          "
        >
          Webhooks power your product.{" "}
          <span className="text-primary block mt-2">
            But you don’t control them.
          </span>
        </motion.h1>

        {/* 🔥 SUBHEADING (UPDATED) */}
        <motion.p
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="
            mt-5 sm:mt-6
            text-muted-foreground
            max-w-xl
            text-sm sm:text-base md:text-lg
            leading-relaxed
          "
        >
          HookTrace gives you full control over your webhook pipeline —
          from ingestion → processing → delivery.
          <br /><br />
          See every event, replay instantly, route intelligently.
          No silent failures. No guesswork.
        </motion.p>

        {/* Waitlist */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-8 sm:mt-10 w-full flex justify-center"
        >
          <WaitlistForm />
        </motion.div>

        {/* GitHub Badge */}
        <motion.a
          href="https://www.github.com/yasir761/hooktrace"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="
            mt-6
            inline-flex items-center gap-2
            rounded-full
            border border-border
            px-4 py-1.5
            text-xs font-medium
            text-muted-foreground
            hover:bg-muted
            transition
          "
        >
          ⭐ Open Source on GitHub
        </motion.a>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-10"
        >
          <LaunchSection />
        </motion.div>

        {/*  TRUST LINE (UPDATED) */}
        <p className="mt-8 text-xs text-muted-foreground">
          Built for developers who can’t afford silent failures.
        </p>

      </div>

      {/* Credit */}
      <p className="mt-3 text-xs text-muted-foreground">
        A product by{" "}
        <a
          href="https://codilad.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-foreground transition"
        >
          codilad.dev
        </a>
      </p>
    </section>
  )
}