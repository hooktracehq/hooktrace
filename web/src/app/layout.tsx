import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@vercel/analytics/next"
import { GoogleAnalytics } from "@/components/analytics/ga"
import { QueryProvider } from "@/providers/query-provider"
import { Toaster } from "sonner"

import "./global.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://hooktrace.xyz"),

  title: "Hooktrace – Webhook Debugging & Retry Platform",

  description:
    "Capture, inspect, and replay webhook events. Debug integrations in minutes, not hours.",

  alternates: {
    canonical: "https://hooktrace.xyz",
  },

  icons: {
    icon: "/favicon.ico",
  },

  openGraph: {
    title: "Hooktrace – Webhook Debugging & Retry Platform",

    description:
      "Relay, debug and monitor webhooks with retries and AI debugging.",

    url: "https://hooktrace.xyz",

    siteName: "Hooktrace",

    locale: "en_US",

    type: "website",

    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Hooktrace — webhook debugging, monitoring, and replay platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Hooktrace – Webhook Debugging & Retry Platform",

    description:
      "Webhook relay with retries, observability and AI debugging.",

    images: ["/og.jpg"],

    // Add this only if this is your actual Hooktrace X username:
    // site: "@hooktrace",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <QueryProvider>
            {children}
          </QueryProvider>

          <Toaster
            richColors
            position="top-right"
          />

          <Analytics />

          <GoogleAnalytics />
        </ThemeProvider>
      </body>
    </html>
  )
}