

"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Mail,
  Lock,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react"
import { FaGithub } from "react-icons/fa"
import { useState } from "react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
  
    const form = e.currentTarget
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
  
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      )
  
      const data = await res.json()
      if (!res.ok) {
        alert(data.detail || "An error occurred")
        setIsLoading(false)
        return
      }

      window.location.replace("/dashboard")
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="HookTrace"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold">HookTrace</span>
          </Link>

          {/* Value Props */}
          <div className="space-y-8 max-w-md">
            <div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Welcome back to HookTrace
              </h2>
              <p className="text-lg text-muted-foreground">
                Continue monitoring and debugging your webhooks with confidence.
              </p>
            </div>

            <div className="space-y-6">
              <Feature
                icon={<Zap className="w-5 h-5" />}
                title="Real-time Monitoring"
                description="Track webhook deliveries as they happen with instant updates"
              />
              <Feature
                icon={<Shield className="w-5 h-5" />}
                title="Reliable Delivery"
                description="Automatic retries and dead letter queue for failed webhooks"
              />
              <Feature
                icon={<BarChart3 className="w-5 h-5" />}
                title="Powerful Analytics"
                description="Visualize success rates, latency, and delivery metrics"
              />
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-muted-foreground">
            Trusted by developers at companies worldwide
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="HookTrace"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold">HookTrace</span>
            </Link>
            <p className="text-muted-foreground">Monitor and debug webhooks effortlessly</p>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to access your webhook dashboard
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/auth/login/google`}
              className="flex items-center justify-center gap-3 w-full border border-border rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent transition-all hover:shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </a>

            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/auth/login/github`}
              className="flex items-center justify-center gap-3 w-full border border-border rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent transition-all hover:shadow-sm"
            >
              <FaGithub className="w-5 h-5" />
              Continue with GitHub
            </a>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground uppercase tracking-wide">
                Or
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                name="email"
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="w-full border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                name="password"
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}