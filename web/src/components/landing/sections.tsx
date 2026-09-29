import Link from "next/link"
import Image from "next/image"
import { Cable, History, Inbox, RotateCcw, Search, Send } from "lucide-react"
import { CONTRIBUTING_URL, DOCS_URL, GET_STARTED, GITHUB_URL } from "./links"
import { Reveal } from "./shot"

const wrap = "mx-auto max-w-6xl px-5"
const h2 = "text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
const lead = "mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground"

export function Problem() {
  return (
    <section className={`${wrap} py-28 sm:py-36`}>
      <Reveal className="max-w-2xl">
        <h2 className={h2}>Webhooks are easy to receive. Hard to operate.</h2>
        <p className={lead + " max-w-xl"}>
          Events fail. Services go offline. Deliveries need to be retried. Sometimes you need to understand exactly what happened hours ago.
        </p>
        <p className="mt-6 max-w-xl text-lg font-medium">
          HookTrace gives you one place to see, control, and recover the entire webhook lifecycle.
        </p>
      </Reveal>
    </section>
  )
}

const caps = [
  { icon: Inbox, t: "Receive", d: "Accept webhooks through configurable routes." },
  { icon: Search, t: "Inspect", d: "Understand payloads and event activity." },
  { icon: Send, t: "Deliver", d: "Route events to your destinations." },
  { icon: RotateCcw, t: "Retry", d: "Recover from failed deliveries." },
  { icon: History, t: "Replay", d: "Re-process events when you need to." },
  { icon: Cable, t: "Tunnel", d: "Bring webhooks into local development." },
]

export function Capabilities() {
  return (
    <section className={`${wrap} pb-28 sm:pb-36`}>
      <Reveal>
        <dl className="grid gap-x-10 gap-y-10 border-t border-border pt-12 sm:grid-cols-2 lg:grid-cols-3">
          {caps.map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex gap-4">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div>
                <dt className="font-medium">{t}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{d}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  )
}

function Buttons({ primary, secondary }: { primary: [string, string]; secondary: [string, string] }) {
  const ext = (h: string) => !h.startsWith("/")
  const P = ext(primary[1]) ? "a" : Link
  const S = ext(secondary[1]) ? "a" : Link
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <P href={primary[1]} className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto">{primary[0]}</P>
      <S href={secondary[1]} className="w-full rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-secondary/50 hover:bg-secondary/10 sm:w-auto">{secondary[0]}</S>
    </div>
  )
}

export function OpenSource() {
  return (
    <section className={`${wrap} pb-28 sm:pb-36`}>
      <Reveal className="rounded-2xl border border-border bg-surface-1 px-6 py-16 text-center sm:px-16 sm:py-20">
        <h2 className={h2}>Built in the open. Ready to run yourself.</h2>
        <p className={lead + " mx-auto"}>
          HookTrace is open source and self-hostable. Explore the code, run it locally, and make it your own.
        </p>
        <Buttons primary={["View on GitHub", GITHUB_URL]} secondary={["Read the Docs", DOCS_URL]} />
      </Reveal>
    </section>
  )
}

export function Footer() {
  const links = [
    ["GitHub", GITHUB_URL],
    ["Docs", DOCS_URL],
    ["Get Started", GET_STARTED],
    ["Contributing", CONTRIBUTING_URL],
  ]
  return (
    <footer className="border-t border-border">
      <div className={`${wrap} flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="" width={22} height={22} className="rounded" />
          <span className="text-sm font-semibold">HookTrace</span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {links.map(([l, h]) => (
            <a key={l} href={h} className="transition-colors hover:text-secondary">{l}</a>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground">Open source · Apache 2.0</p>
      </div>
    </footer>
  )
}