import { ReactNode } from "react"
import { AppShell } from "@/components/shell/app-shell"
import { CommandMenu } from "@/components/cmdk/command-menu"
import { SystemToasts } from "@/components/system/system-toasts"

import { ReactNode } from "react"

import { AppShell } from "@/components/shell/app-shell"

import { CommandMenu } from "@/components/cmdk/command-menu"

import { SystemToasts } from "@/components/system/system-toasts"

import { RealtimeProvider } from "@/components/system/realtime-provider"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <RealtimeProvider>

      <AppShell>

        {children}

        <SystemToasts />

        <CommandMenu />

      </AppShell>

    </RealtimeProvider>
  )
}