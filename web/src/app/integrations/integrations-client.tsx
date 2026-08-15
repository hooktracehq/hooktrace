"use client"

import { useState } from "react"
import Link from "next/link"

import {
  type LucideIcon,
  Search,
  Zap,
  CheckCircle2,
  ArrowRight,
  Webhook,
} from "lucide-react"

import { motion } from "framer-motion"

import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import type { User } from "@/lib/auth"

type Provider = {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  webhooks: string[]
  status: "active" | "available" | "coming_soon"
}

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
}

const container = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: LucideIcon
  color: "emerald" | "blue" | "violet"
}) {
  const colorMap = {
    emerald:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",

    blue:
      "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30",

    violet:
      "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30",
  }

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-lg border border-border bg-card p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <div
          className={`rounded-lg p-2 ${colorMap[color]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mb-1 text-2xl font-bold">
        {value}
      </p>

      <p className="text-sm text-muted-foreground">
        {label}
      </p>
    </motion.div>
  )
}

function ProviderCard({
  provider,
  isConnected,
}: {
  provider: Provider
  isConnected: boolean
}) {
  return (
    <motion.div whileHover={{ y: -4 }}>
      <Link
        href={`/integrations/${provider.id}`}
        className="group block rounded-xl border bg-card p-6 transition-all hover:shadow-lg"
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${provider.color}`}
            >
              {provider.icon}
            </div>

            <div>
              <h3 className="font-semibold group-hover:text-primary">
                {provider.name}
              </h3>

              <p className="text-xs capitalize text-muted-foreground">
                {provider.category}
              </p>
            </div>
          </div>

          {isConnected && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </div>
          )}
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          {provider.description}
        </p>

        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm font-medium text-primary">
            {isConnected
              ? "View Details"
              : "Connect"}
          </span>

          <ArrowRight className="h-4 w-4" />
        </div>
      </Link>
    </motion.div>
  )
}

export default function IntegrationsClient({
  providers,
  connectedIntegrations,
  user,
}: {
  providers: Provider[]
  connectedIntegrations: string[]
  user: User
}) {
  const [searchQuery, setSearchQuery] =
    useState("")

  const [selectedCategory, setSelectedCategory] =
    useState<string>("all")

  const connectedSet = new Set(
    connectedIntegrations || []
  )

  const filteredProviders = providers.filter(
    (provider) => {
      const query =
        searchQuery.toLowerCase()

      const matchesSearch =
        provider.name
          .toLowerCase()
          .includes(query) ||
        provider.description
          .toLowerCase()
          .includes(query)

      const matchesCategory =
        selectedCategory === "all" ||
        provider.category ===
          selectedCategory

      return (
        matchesSearch &&
        matchesCategory
      )
    }
  )

  const categories = [
    {
      id: "all",
      label: "All",
      count: providers.length,
    },

    ...Array.from(
      new Set(
        providers.map(
          (provider) =>
            provider.category
        )
      )
    ).map((category) => ({
      id: category,
      label:
        category.charAt(0).toUpperCase() +
        category.slice(1),
      count: providers.filter(
        (provider) =>
          provider.category ===
          category
      ).length,
    })),
  ]

  const connectedCount =
    connectedSet.size

  const availableCount =
    providers.filter(
      (provider) =>
        provider.status === "active"
    ).length

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">

        {/* Header */}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex items-start justify-between"
        >
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <Zap className="h-6 w-6 text-primary" />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Integrations
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  Connect your favorite services
                  and start monitoring webhooks
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              Dashboard
            </Link>

            <ThemeToggle />

            <UserNav
  user={{
    ...user,
    name: user.name ?? undefined,
    avatar_url: user.avatar_url ?? undefined,
  }}
/>
          </div>
        </motion.div>

        {/* Stats */}

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-3"
        >
          <StatCard
            label="Connected"
            value={connectedCount}
            icon={CheckCircle2}
            color="emerald"
          />

          <StatCard
            label="Available"
            value={availableCount}
            icon={Webhook}
            color="blue"
          />

          <StatCard
            label="Total Providers"
            value={providers.length}
            icon={Zap}
            color="violet"
          />
        </motion.div>

        {/* Search & Filter */}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map(
              (category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    setSelectedCategory(
                      category.id
                    )
                  }
                  className={`
                    whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all
                    ${
                      selectedCategory ===
                      category.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }
                  `}
                >
                  {category.label}

                  <span className="ml-2 text-xs opacity-70">
                    {category.count}
                  </span>
                </button>
              )
            )}
          </div>
        </motion.div>

        {/* Providers Grid */}

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredProviders.map(
            (provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isConnected={connectedSet.has(
                  provider.id
                )}
              />
            )
          )}
        </motion.div>

        {/* Empty State */}

        {filteredProviders.length ===
          0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="py-12 text-center"
          >
            <h3 className="mb-2 text-lg font-semibold">
              No integrations found
            </h3>

            <p className="mb-6 text-sm text-muted-foreground">
              Try adjusting your search
              or filter
            </p>

            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory(
                  "all"
                )
              }}
              className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}