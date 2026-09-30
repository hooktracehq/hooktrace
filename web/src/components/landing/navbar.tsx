

"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { FaGithub } from "react-icons/fa"
import { DOCS_URL, GITHUB_URL } from "./links"

const link =
  "text-sm text-muted-foreground transition-colors hover:text-secondary focus-visible:text-secondary"

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:px-5">
      <div className="relative mx-auto max-w-5xl rounded-2xl border border-primary/25 bg-primary/[0.07] shadow-[0_8px_40px_-12px_rgba(255,110,30,0.35)] backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-x-0 -top-10 h-16 bg-primary/25 blur-2xl" />
        </div>

        <div className="relative flex h-14 items-center justify-between px-4 sm:px-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="HookTrace"
              width={28}
              height={28}
              className="rounded-md"
            />

            <span className="text-[15px] font-semibold tracking-tight">
              HookTrace
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-7 md:flex">
            <Link href="/why-hooktrace" className={link}>
              Why HookTrace
            </Link>

            <a href={DOCS_URL} className={link}>
              Docs
            </a>

            <a
              href={GITHUB_URL}
              aria-label="HookTrace on GitHub"
              className={`${link} flex items-center gap-2`}
            >
              {/* <FaGithub className="h-5 w-5" /> */}
              <span>GitHub</span>
            </a>

            {/* Pricing — coming soon */}
            <div className="group relative">
              <button
                type="button"
                aria-disabled
                className={`${link} cursor-default`}
              >
                Pricing
              </button>

              <span
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 -translate-x-1/2 whitespace-nowrap rounded-md border border-secondary/30 bg-background/90 px-2.5 py-1 text-xs text-secondary opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
              >
                Coming soon
              </span>
            </div>
          </nav>

          {/* GitHub CTA + mobile menu */}
          <div className="flex items-center gap-2">
            <a
              href={GITHUB_URL}
              aria-label="Star HookTrace on GitHub"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 hover:shadow-[0_0_0_3px_color-mix(in_oklab,var(--secondary)_35%,transparent)]"
            >
              <FaGithub className="h-4 w-4" />
              <span>GitHub</span>
            </a>

            <button
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="rounded-lg p-2 text-muted-foreground hover:text-secondary md:hidden"
            >
              {open ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {open && (
          <nav className="relative border-t border-primary/20 px-5 py-2 md:hidden">
            <Link
              href="/why-hooktrace"
              onClick={() => setOpen(false)}
              className={`block py-3 ${link}`}
            >
              Why HookTrace
            </Link>

            <a
              href={DOCS_URL}
              onClick={() => setOpen(false)}
              className={`block py-3 ${link}`}
            >
              Docs
            </a>

            <a
              href={GITHUB_URL}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 py-3 ${link}`}
            >
              <FaGithub className="h-4 w-4" />
              GitHub
            </a>

            <p className="flex items-center justify-between py-3 text-sm text-muted-foreground">
              Pricing
              <span className="text-xs text-secondary">Coming soon</span>
            </p>
          </nav>
        )}
      </div>
    </header>
  )
}