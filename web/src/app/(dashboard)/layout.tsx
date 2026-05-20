import { ReactNode } from "react"
import { AppShell } from "@/components/shell/app-shell"
import { CommandMenu } from "@/components/cmdk/command-menu"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return <AppShell>{children}
  <CommandMenu />
  </AppShell>
}