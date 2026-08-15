import { redirect } from "next/navigation"
import { CalendarDays, Mail, Shield, UserRound } from "lucide-react"

import { getCurrentUser } from "@/lib/auth"
import { LogoutButton } from "@/components/account/logout-button"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          Settings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your Hooktrace account and subscription.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-surface-1 p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
            <UserRound className="h-4 w-4 text-orange-400" />
          </div>

          <div>
            <h2 className="text-sm font-semibold">
              Profile
            </h2>

            <p className="text-xs text-muted-foreground">
              Your account information
            </p>
          </div>
        </div>

        <div className="divide-y divide-border">
          <div className="flex items-center justify-between gap-6 py-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />

              <div>
                <p className="text-xs text-muted-foreground">
                  Email
                </p>

                <p className="mt-0.5 text-sm font-medium">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-6 py-4">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />

              <div>
                <p className="text-xs text-muted-foreground">
                  Authentication
                </p>

                <p className="mt-0.5 text-sm font-medium capitalize">
                  {user.provider || "local"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-6 py-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />

              <div>
                <p className="text-xs text-muted-foreground">
                  User ID
                </p>

                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {user.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface-1 p-6">
        <div className="mb-5">
          <h2 className="text-sm font-semibold">
            Subscription
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Your current Hooktrace plan.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background/20 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">
                Self-hosted
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Free and open source
              </p>
            </div>

            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-emerald-400">
              Current
            </span>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-medium">
              Hooktrace Cloud
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Managed hosting, Hooktrace API, AI debugging,
              and additional providers.
            </p>

            <div className="mt-3 inline-flex items-baseline gap-1">
              <span className="text-2xl font-semibold">
                $9
              </span>

              <span className="text-xs text-muted-foreground">
                / month
              </span>
            </div>

            <p className="mt-2 text-xs text-orange-400">
              Cloud billing coming soon.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-rose-500/15 bg-rose-500/[0.02] p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold">
            Security
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            End your current Hooktrace session.
          </p>
        </div>

        <div className="max-w-xs">
          <LogoutButton />
        </div>
      </section>
    </div>
  )
}