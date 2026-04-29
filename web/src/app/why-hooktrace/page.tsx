// "use client"

// import type { ReactNode } from "react"
// import Link from "next/link"
// import { motion } from "framer-motion"
// import {
//   AlertTriangle,
//   CheckCircle2,
//   RotateCcw,
//   Activity,
// } from "lucide-react"

// const fade = {
//   hidden: { opacity: 0, y: 30 },
//   show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
// }

// export default function WhyHookTracePage() {
//   return (
//     <main className="min-h-screen bg-background text-foreground px-4 sm:px-6 pt-32 pb-24">
//       <div className="max-w-6xl mx-auto space-y-24 sm:space-y-32">

//         {/* HERO */}
//         <section className="text-center space-y-6 sm:space-y-8">
//           <motion.h1
//             variants={fade}
//             initial="hidden"
//             animate="show"
//             className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-tight"
//           >
//             Ever found out a webhook failed
//             <span className="text-primary block mt-3">
//               because your customer told you?
//             </span>
//           </motion.h1>

//           <motion.p
//             variants={fade}
//             initial="hidden"
//             animate="show"
//             transition={{ delay: 0.2 }}
//             className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base md:text-lg"
//           >
//             Payment confirmations not arriving.
//             CRM records not updating.
//             Background jobs silently dying.
//             And you’re digging through logs at 2AM.
//           </motion.p>
//         </section>

//         {/* PROBLEM */}
//         <section className="grid md:grid-cols-2 gap-12 items-center">
//           <div className="space-y-6">
//             <h2 className="text-2xl sm:text-3xl font-semibold">
//               The real problem isn’t webhooks.
//             </h2>

//             <p className="text-muted-foreground text-sm sm:text-base">
//               It’s the lack of visibility.
//               Webhooks are treated like background noise —
//               until they break something important.
//             </p>

//             <ul className="space-y-3 text-sm text-muted-foreground">
//               <li>• No structured monitoring</li>
//               <li>• No delivery diagnostics</li>
//               <li>• No clean replay mechanism</li>
//               <li>• No alert before customers notice</li>
//             </ul>
//           </div>

//           <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 sm:p-8 space-y-4">
//             <AlertTriangle className="text-destructive h-8 w-8" />
//             <h3 className="font-semibold">Silent Failure</h3>
//             <p className="text-sm text-muted-foreground">
//               A webhook fails.  
//               Your system continues.  
//               Data goes missing.  
//               Revenue disappears quietly.
//             </p>
//           </div>
//         </section>

//         {/* BEFORE vs AFTER */}
//         <section className="space-y-10">
//           <h2 className="text-2xl sm:text-3xl font-semibold text-center">
//             Before vs After HookTrace
//           </h2>

//           <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
//             <ComparisonCard
//               title="Without HookTrace"
//               negative={true}
//               points={[
//                 "Search logs manually",
//                 "Unclear failure reasons",
//                 "Retry via curl commands",
//                 "Discover issues too late",
//               ]}
//             />

//             <ComparisonCard
//               title="With HookTrace"
//               points={[
//                 "Real-time delivery monitoring",
//                 "Clear failure diagnostics",
//                 "One-click replay",
//                 "Know instantly when something breaks",
//               ]}
//             />
//           </div>
//         </section>

//         {/* FEATURES */}
//         <section className="space-y-12 text-center">
//           <h2 className="text-2xl sm:text-3xl font-semibold">
//             How HookTrace Helps You
//           </h2>

//           <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
//             <FeatureCard
//               icon={<Activity className="text-primary" />}
//               title="See Everything"
//               description="Every webhook event logged, tracked, and monitored."
//             />

//             <FeatureCard
//               icon={<AlertTriangle className="text-primary" />}
//               title="Understand Failures"
//               description="Exact error responses, status codes, and timing."
//             />

//             <FeatureCard
//               icon={<RotateCcw className="text-primary" />}
//               title="Replay Instantly"
//               description="Fix endpoint → resend event. No CLI needed."
//             />
//           </div>
//         </section>

//         {/* CTA */}
//         <section className="text-center space-y-6 pt-10 border-t border-border">
//           <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
//           <h2 className="text-2xl sm:text-3xl font-semibold">
//             Webhooks stop being scary.
//           </h2>

//           <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
//             You gain clarity.
//             You reduce downtime.
//             You protect revenue.
//             You sleep better.
//           </p>

//           <Link
//             href="/#waitlist"
//             className="inline-block rounded-full bg-primary px-8 py-3 text-primary-foreground font-medium hover:opacity-90 transition"
//           >
//             Join Early Access
//           </Link>
//         </section>

//       </div>
//     </main>
//   )
// }

// /* ---------------- Components ---------------- */

// type ComparisonCardProps = {
//   title: string
//   points: string[]
//   negative?: boolean
// }

// function ComparisonCard({ title, points, negative }: ComparisonCardProps) {
//   return (
//     <div
//       className={`rounded-2xl border p-8 space-y-4 ${
//         negative
//           ? "border-destructive/40 bg-destructive/5"
//           : "border-primary/30 bg-primary/5"
//       }`}
//     >
//       <h3 className="font-semibold text-lg">{title}</h3>

//       <ul className="space-y-3 text-sm text-muted-foreground">
//         {points.map((p, i) => (
//           <li key={i}>• {p}</li>
//         ))}
//       </ul>
//     </div>
//   )
// }

// type FeatureCardProps = {
//   icon: ReactNode
//   title: string
//   description: string
// }

// function FeatureCard({ icon, title, description }: FeatureCardProps) {
//   return (
//     <div className="rounded-2xl border border-border bg-card p-8 space-y-4 card-glow">
//       <div className="text-2xl">{icon}</div>
//       <h3 className="font-semibold text-lg">{title}</h3>
//       <p className="text-sm text-muted-foreground">{description}</p>
//     </div>
//   )
// }






"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Activity,
  Zap,
  Layers,
  Terminal,
} from "lucide-react"

const fade = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function WhyHookTracePage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-4 sm:px-6 pt-32 pb-24">
      <div className="max-w-6xl mx-auto space-y-24 sm:space-y-32">

        {/* HERO */}
        <section className="text-center space-y-6 sm:space-y-8">
          <motion.h1
            variants={fade}
            initial="hidden"
            animate="show"
            className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-tight"
          >
            Ever found out a webhook failed
            <span className="text-primary block mt-3">
              after it already broke your system?
            </span>
          </motion.h1>

          <motion.p
            variants={fade}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base md:text-lg"
          >
            Webhooks power payments, automation, and integrations —
            but when they fail, everything downstream breaks.
            <br /><br />
            HookTrace gives you full control over the entire webhook pipeline:
            from ingestion → processing → delivery.
          </motion.p>
        </section>

        {/* PROBLEM */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-semibold">
              Webhooks aren’t the problem.
              <br />
              Your system around them is.
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base">
              You don’t just need logs —
              you need control over how events flow through your system.
            </p>

            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>• No control over event flow</li>
              <li>• No visibility into failures</li>
              <li>• Manual retries and debugging</li>
              <li>• Issues discovered too late</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 sm:p-8 space-y-4">
            <AlertTriangle className="text-destructive h-8 w-8" />
            <h3 className="font-semibold">Silent Failure</h3>
            <p className="text-sm text-muted-foreground">
              A webhook fails.  
              Your system continues.  
              Data goes missing.  
              Revenue disappears quietly.
            </p>
          </div>
        </section>

        {/* BEFORE vs AFTER */}
        <section className="space-y-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center">
            Before vs After HookTrace
          </h2>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <ComparisonCard
              title="Without HookTrace"
              negative={true}
              points={[
                "Events disappear without visibility",
                "Retries are manual and painful",
                "No control over delivery flow",
                "You react after users complain",
              ]}
            />

            <ComparisonCard
              title="With HookTrace"
              points={[
                "Every event tracked end-to-end",
                "Replay or reprocess instantly",
                "Control routing, batching, delivery",
                "Know failures before users do",
              ]}
            />
          </div>
        </section>

        {/* FEATURES */}
        <section className="space-y-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">
            What HookTrace Gives You
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              icon={<Layers className="text-primary" />}
              title="Full Event Pipeline"
              description="Ingest → queue → process → deliver. Control every step."
            />

            <FeatureCard
              icon={<Zap className="text-primary" />}
              title="Plug & Play Integrations"
              description="Stripe, GitHub, Shopify — connect and receive events instantly."
            />

            <FeatureCard
              icon={<Activity className="text-primary" />}
              title="Smart Delivery Routing"
              description="Send events to multiple targets with retries and control."
            />

            <FeatureCard
              icon={<RotateCcw className="text-primary" />}
              title="Event Aggregation"
              description="Batch, deduplicate, and optimize high-volume webhooks."
            />

            <FeatureCard
              icon={<Terminal className="text-primary" />}
              title="Local Dev (CLI)"
              description="Receive webhooks locally without exposing your server."
            />

            <FeatureCard
              icon={<AlertTriangle className="text-primary" />}
              title="Deep Visibility"
              description="Every event, attempt, and failure — fully traceable."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 pt-10 border-t border-border">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />

          <h2 className="text-2xl sm:text-3xl font-semibold">
            You finally control your webhooks.
          </h2>

          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            From ingestion to delivery — nothing is invisible anymore.
          </p>

          <Link
            href="/#waitlist"
            className="inline-block rounded-full bg-primary px-8 py-3 text-primary-foreground font-medium hover:opacity-90 transition"
          >
            Join Early Access
          </Link>
        </section>

      </div>
    </main>
  )
}

/* ---------------- Components ---------------- */

type ComparisonCardProps = {
  title: string
  points: string[]
  negative?: boolean
}

function ComparisonCard({ title, points, negative }: ComparisonCardProps) {
  return (
    <div
      className={`rounded-2xl border p-8 space-y-4 ${
        negative
          ? "border-destructive/40 bg-destructive/5"
          : "border-primary/30 bg-primary/5"
      }`}
    >
      <h3 className="font-semibold text-lg">{title}</h3>

      <ul className="space-y-3 text-sm text-muted-foreground">
        {points.map((p, i) => (
          <li key={i}>• {p}</li>
        ))}
      </ul>
    </div>
  )
}

type FeatureCardProps = {
  icon: ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 space-y-4 card-glow">
      <div className="text-2xl">{icon}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}