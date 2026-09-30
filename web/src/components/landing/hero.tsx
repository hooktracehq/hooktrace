
import Link from "next/link"
import { DOCS_URL, GITHUB_URL } from "./links"
import { Reveal } from "./shot"
import { WaitlistForm } from "@/components/landing/waitlist-form"

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center px-5 pb-20 pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[820px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[130px]"
      />

      <Reveal className="relative mx-auto max-w-3xl text-center">
        <p className="mb-5 text-xs font-medium tracking-[0.14em] text-muted-foreground">
          OPEN-SOURCE WEBHOOK INFRASTRUCTURE
        </p>

        <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
          Know what happened to every{" "}
          <span className="cursor-default text-transparent transition-colors duration-500 [-webkit-text-stroke:1.5px_var(--primary)] hover:text-primary">
            webhook
          </span>
          .
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
          Receive, inspect, deliver, retry, and replay webhooks with
          infrastructure you can actually see and control.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={DOCS_URL}
            className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 hover:shadow-[0_0_0_4px_color-mix(in_oklab,var(--secondary)_30%,transparent)] sm:w-auto"
          >
            Self-host HookTrace
          </Link>

          <a
            href={GITHUB_URL}
            className="w-full rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-secondary/50 hover:bg-secondary/10 sm:w-auto"
          >
            View on GitHub
          </a>
        </div>

        <div
          id="waitlist"
          className="mt-14 flex scroll-mt-28 flex-col items-center"
        >
          <p className="text-sm text-muted-foreground">
            Don&apos;t want to self-host? Join the HookTrace Cloud waitlist.
          </p>

          <div className="flex w-full justify-center [&>div]:mt-4">
            <WaitlistForm />
          </div>
        </div>
      </Reveal>
    </section>
  )
}