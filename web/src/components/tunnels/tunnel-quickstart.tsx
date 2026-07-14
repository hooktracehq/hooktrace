"use client"

import {
  CheckCircle2,
  Globe,
  PlayCircle,
} from "lucide-react"

import { TunnelCli } from "./tunnel-cli"

type Props = {
  token: string
  publicUrl: string
}

export function TunnelQuickStart({
  token,
  publicUrl,
}: Props) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-border
        bg-card
      "
    >
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-orange-500/10
              text-orange-400
            "
          >
            <PlayCircle className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Quick Start
            </h2>

            <p className="text-sm text-muted-foreground">
              Connect your local server in less than a minute.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="flex gap-4">
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-orange-500/10
              text-sm
              font-semibold
              text-orange-400
            "
          >
            1
          </div>

          <div>
            <div className="font-medium">
              Start your local server
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Make sure your application is running on
              <span className="ml-1 font-mono text-foreground">
                localhost:3000
              </span>
              {" "}
              (or the port you configured).
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-orange-500/10
              text-sm
              font-semibold
              text-orange-400
            "
          >
            2
          </div>

          <div className="flex-1">
            <div className="font-medium">
              Run the Hooktrace CLI
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              The CLI creates a secure websocket tunnel between Hooktrace
              and your local machine.
            </p>

            <TunnelCli token={token} />
          </div>
        </div>

        <div className="flex gap-4">
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-orange-500/10
              text-sm
              font-semibold
              text-orange-400
            "
          >
            3
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 font-medium">
              <Globe className="h-4 w-4 text-orange-400" />

              <span>Send requests to your public URL</span>
            </div>

            <div
              className="
                mt-3
                overflow-x-auto
                rounded-xl
                border
                border-border
                bg-background
                px-4
                py-3
                font-mono
                text-sm
              "
            >
              {publicUrl}
            </div>
          </div>
        </div>

        <div
          className="
            rounded-xl
            border
            border-emerald-500/20
            bg-emerald-500/5
            p-4
          "
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />

            <div>
              <div className="font-medium">
                You&apos;re ready.
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Every request sent to your public Hooktrace URL will appear
                instantly in the Live Requests panel where you can inspect
                headers, payloads, latency and responses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}