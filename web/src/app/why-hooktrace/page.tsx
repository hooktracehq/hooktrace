


"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion"
import { ChevronRight, Maximize2, Printer, X } from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/sections"
import { Shot } from "@/components/landing/shot"
import { GET_STARTED, GITHUB_URL, WAITLIST_URL } from "@/components/landing/links"

/* ---------- content ---------- */

const screens = [
  {
    id: "dashboard", n: "3.1", title: "The dashboard",
    src: "/landing/dashboard.png", alt: "HookTrace dashboard with event counts and a 24-hour throughput chart",
    p: "The dashboard is the summary. It answers one question first: is anything wrong right now? Counts for incoming, delivered, failed, retrying and dead-lettered events sit above a chart of the last 24 hours.",
    sees: ["Incoming, Delivered, Failures, Retries, DLQ and average latency as separate counters", "Event throughput over 24 hours, split into delivered and failed"],
  },
  {
    id: "connect", n: "3.2", title: "Connect a provider",
    src: "/landing/connections.png", alt: "Connections page with a connected Stripe provider and its webhook URL",
    p: "A connection is the entry point for one sender. You create it, copy the webhook URL HookTrace generates, and register that URL with the provider.",
    sees: ["Each provider with its status and the route it maps to", "Totals for providers, healthy connections, errors and events today", "The webhook URL in the inspector"],
  },
  {
    id: "route", n: "3.3", title: "Manage routes",
    src: "/landing/routes.png", alt: "Routes explorer listing routes with throughput and failure counts",
    p: "Routes are the ingress paths. Every route has its own endpoint, an environment mode, and a set of targets, so what arrives where is never ambiguous.",
    sees: ["Status, throughput, failures, targets and last-seen time per route", "Development and production route counts", "Copy the endpoint, or jump to that route’s events"],
  },
  {
    id: "inspect", n: "3.4", title: "Inspect every event",
    src: "/landing/events.png", alt: "Event workspace listing Stripe events with status and attempts",
    p: "The event workspace is a live list of everything that arrived. Each row shows the outcome and how many delivery attempts it took, so a failure is visible without opening a log file.",
    sees: ["Filter by status and provider, or search", "Pause and resume the live stream", "Status, route, provider, attempts and age for every event"],
  },
  {
    id: "aggregate", n: "3.5", title: "Aggregate high-volume traffic",
    src: "/landing/aggregation.png", alt: "Aggregation rules page with batching rules and an overview panel",
    p: "Some senders are noisy. Aggregation rules group events into batches and skip duplicates before delivery, and the page reports how much each rule saved.",
    sees: ["Active rules, events processed, batches produced and traffic reduction", "Per-rule provider, strategy and events saved", "Enable, disable, edit or delete a rule from the inspector"],
  },
  {
    id: "deliver", n: "3.6", title: "Deliver to destinations",
    src: "/landing/destinations.png", alt: "Destinations page with health, delivery counts and an inspector",
    p: "A destination is where events end up. Each one tracks its own health, delivered and failed counts, and latency, and can be tested before you depend on it.",
    sees: ["Targets, healthy, failed and successful totals", "Delivered count, latency and last-seen time per destination", "Test, edit or delete, with Overview, Logs and Insights tabs"],
  },
  {
    id: "recover", n: "3.7", title: "Replay what failed",
    src: "/landing/replay.png", alt: "Replay queue with a failed event open in the replay inspector",
    p: "Failed events are not discarded. They wait in the replay queue with their payload intact. You can inspect one, replay it, or replay every failed event in one action.",
    sees: ["Queued, running, completed and failed counts", "Attempts and status for each replay", "The replay payload in the inspector, and Replay All Failed"],
  },
  {
    id: "local", n: "3.8", title: "Develop against localhost",
    src: "/landing/tunnels.png", alt: "Dev tunnels forwarding public URLs to localhost",
    p: "Dev tunnels give you a public URL that forwards incoming webhooks to a server on your machine. The sender never has to change.",
    sees: ["Each tunnel’s public URL and the local address it forwards to", "Active tunnels, request count, paused tunnels and last activity"],
  },
]

const toc: { id: string; label: string; sub?: boolean }[] = [
  { id: "abstract", label: "Abstract" },
  { id: "problem", label: "1  The problem" },
  { id: "selfhost", label: "1.1  Why self-host?" },
  { id: "lifecycle", label: "2  The lifecycle" },
  { id: "product", label: "3  Inside the product" },
  ...screens.map((s) => ({ id: s.id, label: `${s.n}  ${s.title}`, sub: true })),
  { id: "scenario", label: "4  A failure, end to end" },
  { id: "glossary", label: "5  Glossary" },
  { id: "start", label: "6  Get started" },
]

const pipeline = [
  ["Sender", "A provider such as Stripe makes an HTTP request."],
  ["Connection", "Gives that provider its own webhook URL."],
  ["Route", "Receives the request and records it as an event."],
  ["Aggregation", "Optional. Batches or deduplicates events."],
  ["Destination", "Delivers to your endpoint and records each attempt."],
]

const scenario = [
  ["Stripe sends payment_intent.succeeded.", "It reaches the stripe route and is recorded as an event."],
  ["Your endpoint is down.", "The first delivery attempt fails."],
  ["HookTrace retries.", "Each attempt is counted on the event."],
  ["The event lands in the DLQ.", "Once its attempts are used up it is marked DLQ and stays visible in the event workspace."],
  ["You fix your endpoint.", "Nothing was lost, so there is nothing to reconstruct."],
  ["You replay the event.", "Check the payload in the replay queue, then replay it, or use Replay All Failed."],
]

const glossary = [
  ["Event", "One webhook request received by HookTrace."],
  ["Connection", "The entry point for a single provider, with its own webhook URL."],
  ["Route", "An ingress path that receives events and hands them to targets."],
  ["Destination", "An endpoint HookTrace delivers events to."],
  ["Attempt", "One try at delivering an event to a destination."],
  ["Aggregation rule", "A rule that batches or deduplicates events before delivery."],
  ["DLQ", "The dead-letter queue: events that still need attention after delivery attempts."],
  ["Replay", "Sending a stored event through delivery again."],
  ["Tunnel", "A public URL that forwards webhooks to a local server."],
]

/* ---------- small pieces ---------- */

const P = ({ children }: { children: ReactNode }) => (
  <p className="max-w-[68ch] text-[17px] leading-[1.8] text-foreground/80">{children}</p>
)

function Sec({ id, n, title, children }: { id: string; n?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-border pb-16 pt-14">
      {n && <p className="font-mono text-xs text-secondary">§ {n}</p>}
      <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  )
}

function Figure({ n, src, alt, onZoom }: { n: string; src: string; alt: string; onZoom: (z: { src: string; alt: string }) => void }) {
  return (
    <figure className="my-7">
      <div
        role="button" tabIndex={0} aria-label={`Enlarge figure ${n}`}
        onClick={() => onZoom({ src, alt })}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onZoom({ src, alt })}
        className="group relative cursor-zoom-in rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-secondary"
      >
        <Shot src={src} alt={alt} sizes="(min-width: 1152px) 820px, 100vw" />
        <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2 py-1 text-xs opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 print:hidden">
          <Maximize2 className="h-3 w-3" aria-hidden /> Enlarge
        </span>
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        <span className="mr-2 font-mono text-secondary">Fig. {n}</span>{alt}
      </figcaption>
    </figure>
  )
}

/* ---------- page ---------- */

export default function WhyHookTracePage() {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const spring = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const [active, setActive] = useState("abstract")
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-20% 0px -70% 0px" }
    )
    toc.forEach((t) => { const el = document.getElementById(t.id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!zoom) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null)
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev }
  }, [zoom])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })
    setActive(id)
  }

  const tocLinks = (cls: string) =>
    toc.map((t) => (
      <a key={t.id} href={`#${t.id}`} onClick={go(t.id)}
        className={`${cls} block border-l-2 py-1.5 transition-colors ${t.sub ? "pl-7 text-[13px]" : "pl-3 text-sm"} ${
          active === t.id ? "border-primary text-foreground" : "border-border text-muted-foreground hover:text-secondary"
        }`}>
        {t.label}
      </a>
    ))

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground print:[&>header]:hidden">
      <motion.div style={{ scaleX: reduce ? scrollYProgress : spring }} className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-primary print:hidden" />
      <Navbar />

      <main>
        {/* Title block */}
        <header className="relative px-5 pb-14 pt-36 sm:pt-44">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-24 h-[340px] w-[760px] max-w-full -translate-x-1/2 rounded-full bg-primary/10 blur-[120px] print:hidden" />
          <div className="relative mx-auto max-w-6xl lg:pl-[258px]">
            <p className="font-mono text-xs text-secondary">Technical overview · v0.1.0</p>
            <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              HookTrace: Technical Overview
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
              How HookTrace receives, inspects, delivers, retries and replays webhooks — and why teams may choose to run that infrastructure themselves.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
              <span>Open source · Apache 2.0</span>
              <span>About 8 min read</span>
              <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 transition-colors hover:border-secondary/50 hover:text-secondary print:hidden">
                <Printer className="h-4 w-4" aria-hidden /> Save as PDF
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[210px_minmax(0,1fr)]">
          <aside className="hidden print:hidden lg:block">
            <nav aria-label="On this page" className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              <p className="mb-3 text-xs text-muted-foreground">On this page</p>
              {tocLinks("")}
            </nav>
          </aside>

          <article className="min-w-0">
            <details className="mb-10 rounded-xl border border-border px-4 py-3 lg:hidden print:hidden">
              <summary className="cursor-pointer text-sm">On this page</summary>
              <nav className="mt-3">{tocLinks("")}</nav>
            </details>

            {/* Abstract */}
            <section id="abstract" className="scroll-mt-28 rounded-2xl border border-primary/25 bg-primary/[0.05] p-6 sm:p-8">
              <h2 className="text-lg font-semibold">Abstract</h2>
              <p className="mt-3 max-w-[68ch] text-[17px] leading-[1.8] text-foreground/80">
                Webhooks are simple to receive and hard to operate. Failures can be difficult to trace, retries can become manual, and the record of what a provider actually sent can be easy to lose. HookTrace is an open-source, self-hostable system for receiving, inspecting, delivering, retrying and replaying webhooks. This paper explains the problem, the webhook lifecycle, the product screens, and the operational model behind HookTrace.
              </p>
            </section>

            <Sec id="problem" n="1" title="The problem: easy to receive, hard to operate">
              <P>A webhook is a single HTTP request from someone else’s system. Receiving it takes a few lines of code. Operating it is harder, because you do not control the sender, the network, or the moment your own service happens to be down.</P>
              <P>When something goes wrong, three questions come up. Did the event arrive at all? Did it reach the right place? If it failed, can it be delivered again without asking the sender to resend it? Without a system built for this, each answer means searching logs or writing one-off scripts.</P>
              <P>HookTrace exists to make those three answers visible in one place.</P>
            </Sec>

            <Sec id="selfhost" n="1.1" title="Why self-host?">
              <P>Online webhook inspectors are useful when you need a temporary URL to see what a provider sends during development. HookTrace is aimed at a different layer of the problem: teams that want a persistent system for operating webhooks rather than only inspecting a single request.</P>
              <P>Self-hosting lets a team run HookTrace inside its own environment and keep webhook ingestion, event history, delivery state and replay workflows under its control. The goal is not to replace every lightweight webhook testing tool, but to provide an open-source foundation for teams that want ownership of their webhook infrastructure.</P>
              <div className="grid gap-4 py-2 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-surface-1 p-5">
                  <p className="text-sm font-medium">Temporary inspection</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">Useful for quickly seeing a webhook during development or troubleshooting.</p>
                </div>
                <div className="rounded-xl border border-primary/25 bg-primary/[0.05] p-5">
                  <p className="text-sm font-medium">Production webhook operations</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">Persistent events, delivery attempts, retries, dead-letter handling and replay in infrastructure your team can operate itself.</p>
                </div>
              </div>
            </Sec>

            <Sec id="lifecycle" n="2" title="The lifecycle of a webhook">
              <P>Every event moves through the same operational stages. Aggregation is optional. The core flow records what arrived, controls where it goes, records delivery attempts, and preserves failed events for recovery.</P>
              <ol className="grid gap-4 py-2 sm:grid-cols-2 md:grid-cols-5 md:gap-6" aria-label="Webhook lifecycle">
                {pipeline.map(([t, d], i) => (
                  <li key={t} className={`relative rounded-xl border p-4 ${t === "Aggregation" ? "border-dashed border-border" : "border-border bg-surface-1"}`}>
                    <p className="text-sm font-medium">{t}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{d}</p>
                    {i < pipeline.length - 1 && <ChevronRight aria-hidden className="absolute -right-4 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-primary md:block" />}
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-xl border border-primary/25 bg-primary/[0.05] px-4 py-3 text-sm">
                <span className="font-medium">If delivery fails</span>
                {["Retried", "Attempts recorded", "DLQ", "Replay"].map((s) => (
                  <span key={s} className="flex items-center gap-2 text-foreground/80">
                    <ChevronRight aria-hidden className="h-3.5 w-3.5 text-primary" /> {s}
                  </span>
                ))}
              </div>
            </Sec>

            <Sec id="product" n="3" title="Inside the product">
              <P>The figures below are screenshots of the current app, captured with development data. Select any figure to enlarge it.</P>
              {screens.map((s) => (
                <div key={s.id} id={s.id} className="scroll-mt-28 pt-8">
                  <h3 className="text-xl font-semibold tracking-tight">
                    <span className="mr-3 font-mono text-sm text-secondary">{s.n}</span>{s.title}
                  </h3>
                  <div className="mt-4"><P>{s.p}</P></div>
                  <Figure n={s.n} src={s.src} alt={s.alt} onZoom={setZoom} />
                  <p className="text-sm font-medium">On this screen</p>
                  <ul className="mt-2 max-w-[68ch] list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-muted-foreground marker:text-primary">
                    {s.sees.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                </div>
              ))}
            </Sec>

            <Sec id="scenario" n="4" title="A failure, end to end">
              <P>An illustrative production scenario: a payment webhook arrives while your own service is unavailable.</P>
              <ol className="relative ml-2 space-y-6 border-l border-border py-2 pl-7">
                {scenario.map(([t, d], i) => (
                  <li key={t} className="relative">
                    <span aria-hidden className={`absolute -left-[35px] top-1 h-3 w-3 rounded-full border-2 border-background ${i === scenario.length - 1 ? "bg-primary" : "bg-muted-foreground/50"}`} />
                    <p className="font-medium">{t}</p>
                    <p className="mt-1 max-w-[62ch] text-[15px] leading-relaxed text-muted-foreground">{d}</p>
                  </li>
                ))}
              </ol>
            </Sec>

            <Sec id="glossary" n="5" title="Glossary">
              <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                {glossary.map(([t, d]) => (
                  <div key={t} className="border-t border-border pt-4">
                    <dt className="font-medium">{t}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{d}</dd>
                  </div>
                ))}
              </dl>
            </Sec>

            <Sec id="start" n="6" title="Get started">
              <P>HookTrace is open source and self-hostable. Run it in your own environment, inspect the code, and build your webhook workflow around infrastructure you control. HookTrace Cloud is planned for teams that prefer a managed service instead of operating the stack themselves.</P>
              <div className="flex flex-col gap-3 sm:flex-row print:hidden">
                <Link href={GET_STARTED} className="rounded-lg bg-primary px-6 py-3 text-center text-sm font-medium text-primary-foreground transition-all hover:opacity-90 hover:shadow-[0_0_0_4px_color-mix(in_oklab,var(--secondary)_30%,transparent)]">Get Started</Link>
                <a href={GITHUB_URL} className="rounded-lg border border-border px-6 py-3 text-center text-sm font-medium transition-colors hover:border-secondary/50 hover:bg-secondary/10">View on GitHub</a>
                <Link href={WAITLIST_URL} className="rounded-lg border border-border px-6 py-3 text-center text-sm font-medium transition-colors hover:border-secondary/50 hover:bg-secondary/10">HookTrace Cloud — coming soon</Link>
              </div>
            </Sec>
          </article>
        </div>
      </main>

      <Footer />

      {zoom && (
        <div role="dialog" aria-modal="true" aria-label={zoom.alt} onClick={() => setZoom(null)}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm print:hidden">
          <button ref={closeRef} aria-label="Close" onClick={() => setZoom(null)}
            className="absolute right-4 top-4 rounded-full border border-border bg-background/80 p-2 hover:text-secondary">
            <X className="h-5 w-5" />
          </button>
          <Image src={zoom.src} alt={zoom.alt} width={1900} height={870} onClick={(e) => e.stopPropagation()}
            className="h-auto max-h-[88vh] w-auto max-w-full rounded-lg border border-border object-contain" />
        </div>
      )}
    </div>
  )
}