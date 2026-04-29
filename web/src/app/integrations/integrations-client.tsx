// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { 
//   type LucideIcon,
//   Search, 
//   Zap, 
//   CheckCircle2, 
//   Plus,
//   ArrowRight,
//   Filter,
//   Webhook,
// } from "lucide-react"
// import { motion } from "framer-motion"
// import { ThemeToggle } from "@/components/theme-toggle"
// import { UserNav } from "@/components/user-nav"

// type Provider = {
//   id: string
//   name: string
//   description: string
//   icon: string
//   color: string
//   category: string
//   webhooks: string[]
//   status: "active" | "available" | "coming_soon"
// }

// type User = {
//   email: string
//   avatar_url?: string
// }

// const fadeUp = {
//   hidden: { opacity: 0, y: 20 },
//   show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
// }

// const container = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: { staggerChildren: 0.05 },
//   },
// }

// export default function IntegrationsClient({
//   providers,
//   connectedIntegrations,
//   user,
// }: {
//   providers: Provider[]
//   connectedIntegrations: string[]
//   user: User
// }) {
//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedCategory, setSelectedCategory] = useState<string>("all")

//   // Filter providers
//   const filteredProviders = providers.filter((provider) => {
//     const matchesSearch =
//       provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       provider.description.toLowerCase().includes(searchQuery.toLowerCase())

//     const matchesCategory =
//       selectedCategory === "all" || provider.category === selectedCategory

//     return matchesSearch && matchesCategory
//   })

//   // Get categories
//   const categories = [
//     { id: "all", label: "All", count: providers.length },
//     ...Array.from(new Set(providers.map((p) => p.category))).map((cat) => ({
//       id: cat,
//       label: cat.charAt(0).toUpperCase() + cat.slice(1),
//       count: providers.filter((p) => p.category === cat).length,
//     })),
//   ]

//   // Stats
//   const connectedCount = connectedIntegrations.length
//   const availableCount = providers.filter((p) => p.status === "active").length

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
//         {/* Header */}
//         <motion.div
//           variants={fadeUp}
//           initial="hidden"
//           animate="show"
//           className="flex items-start justify-between"
//         >
//           <div>
//             <div className="flex items-center gap-3 mb-2">
//               <div className="p-2.5 bg-primary/10 rounded-xl">
//                 <Zap className="w-6 h-6 text-primary" />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold">Integrations</h1>
//                 <p className="text-sm text-muted-foreground mt-1">
//                   Connect your favorite services and start monitoring webhooks
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <Link
//               href="/dashboard"
//               className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm font-medium transition-colors"
//             >
//               Dashboard
//             </Link>
//             <ThemeToggle />
//             <UserNav user={user} />
//           </div>
//         </motion.div>

//         {/* Stats */}
//         <motion.div
//           variants={container}
//           initial="hidden"
//           animate="show"
//           className="grid gap-4 sm:grid-cols-3"
//         >
//           <StatCard
//             label="Connected"
//             value={connectedCount}
//             icon={CheckCircle2}
//             color="emerald"
//           />
//           <StatCard
//             label="Available"
//             value={availableCount}
//             icon={Webhook}
//             color="blue"
//           />
//           <StatCard
//             label="Total Providers"
//             value={providers.length}
//             icon={Zap}
//             color="violet"
//           />
//         </motion.div>

//         {/* Search & Filter */}
//         <motion.div
//           variants={fadeUp}
//           initial="hidden"
//           animate="show"
//           className="flex flex-col sm:flex-row gap-4"
//         >
//           {/* Search */}
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//             <input
//               type="text"
//               placeholder="Search integrations..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
//             />
//           </div>

//           {/* Category Filter */}
//           <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
//             {categories.map((category) => (
//               <button
//                 key={category.id}
//                 onClick={() => setSelectedCategory(category.id)}
//                 className={`
//                   px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
//                   ${
//                     selectedCategory === category.id
//                       ? "bg-primary text-primary-foreground"
//                       : "bg-muted hover:bg-muted/80"
//                   }
//                 `}
//               >
//                 {category.label}
//                 <span className="ml-2 text-xs opacity-70">
//                   {category.count}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </motion.div>

//         {/* Providers Grid */}
//         <motion.div
//           variants={container}
//           initial="hidden"
//           animate="show"
//           className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
//         >
//           {filteredProviders.map((provider) => (
//             <ProviderCard
//               key={provider.id}
//               provider={provider}
//               isConnected={connectedIntegrations.includes(provider.id)}
//             />
//           ))}
//         </motion.div>

//         {/* Empty State */}
//         {filteredProviders.length === 0 && (
//           <motion.div
//             variants={fadeUp}
//             initial="hidden"
//             animate="show"
//             className="text-center py-12"
//           >
//             <div className="mx-auto w-fit p-3 rounded-full bg-muted/50 mb-4">
//               <Search className="w-8 h-8 text-muted-foreground" />
//             </div>
//             <h3 className="text-lg font-semibold mb-2">No integrations found</h3>
//             <p className="text-sm text-muted-foreground mb-6">
//               Try adjusting your search or filter
//             </p>
//             <button
//               onClick={() => {
//                 setSearchQuery("")
//                 setSelectedCategory("all")
//               }}
//               className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
//             >
//               Clear Filters
//             </button>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   )
// }

// /* ------------------ Components ------------------ */

// function StatCard({
//   label,
//   value,
//   icon: Icon,
//   color,
// }: {
//   label: string
//   value: number
//   icon: LucideIcon
//   color: "emerald" | "blue" | "violet"
// }) {
//   const colorMap = {
//     emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
//     blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30",
//     violet: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30",
//   }

//   return (
//     <motion.div
//       variants={fadeUp}
//       className="rounded-lg border border-border bg-card p-5"
//     >
//       <div className="flex items-center justify-between mb-3">
//         <div className={`p-2 rounded-lg ${colorMap[color]}`}>
//           <Icon className="w-5 h-5" />
//         </div>
//       </div>
//       <p className="text-2xl font-bold mb-1">{value}</p>
//       <p className="text-sm text-muted-foreground">{label}</p>
//     </motion.div>
//   )
// }

// function ProviderCard({
//   provider,
//   isConnected,
// }: {
//   provider: Provider
//   isConnected: boolean
// }) {
//   return (
//     <motion.div variants={fadeUp} whileHover={{ y: -4 }}>
//       <Link
//         href={`/integrations/${provider.id}`}
//         className="block rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-all group"
//       >
//         {/* Header */}
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex items-center gap-3">
//             <div className={`w-12 h-12 rounded-xl ${provider.color} flex items-center justify-center text-2xl`}>
//               {provider.icon}
//             </div>
//             <div>
//               <h3 className="font-semibold group-hover:text-primary transition-colors">
//                 {provider.name}
//               </h3>
//               <p className="text-xs text-muted-foreground capitalize">
//                 {provider.category}
//               </p>
//             </div>
//           </div>

//           {isConnected && (
//             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
//               <CheckCircle2 className="w-3 h-3" />
//               Connected
//             </div>
//           )}
//         </div>

//         {/* Description */}
//         <p className="text-sm text-muted-foreground mb-4">
//           {provider.description}
//         </p>

//         {/* Webhook Examples */}
//         <div className="mb-4">
//           <p className="text-xs font-medium text-muted-foreground mb-2">
//             Sample Webhooks:
//           </p>
//           <div className="flex flex-wrap gap-1.5">
//             {provider.webhooks.slice(0, 2).map((webhook) => (
//               <span
//                 key={webhook}
//                 className="px-2 py-1 rounded-md bg-muted text-xs font-mono"
//               >
//                 {webhook}
//               </span>
//             ))}
//             {provider.webhooks.length > 2 && (
//               <span className="px-2 py-1 text-xs text-muted-foreground">
//                 +{provider.webhooks.length - 2} more
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Action */}
//         <div className="flex items-center justify-between pt-4 border-t border-border">
//           <span className="text-sm font-medium text-primary group-hover:underline">
//             {isConnected ? "View Details" : "Connect"}
//           </span>
//           <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
//         </div>
//       </Link>
//     </motion.div>
//   )
// }





"use client"



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
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30",
    violet: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30",
  }

  return (
    <motion.div variants={fadeUp} className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
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
        className="block rounded-xl border bg-card p-6 hover:shadow-lg transition-all group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${provider.color} flex items-center justify-center text-2xl`}>
              {provider.icon}
            </div>
            <div>
              <h3 className="font-semibold group-hover:text-primary">
                {provider.name}
              </h3>
              <p className="text-xs text-muted-foreground capitalize">
                {provider.category}
              </p>
            </div>
          </div>

          {isConnected && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs">
              <CheckCircle2 className="w-3 h-3" />
              Connected
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {provider.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm font-medium text-primary">
            {isConnected ? "View Details" : "Connect"}
          </span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </Link>
    </motion.div>
  )
}

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

type User = {
  email: string
  avatar_url?: string
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
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
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  //  Safe normalize (important fix)
  const connectedSet = new Set(connectedIntegrations || [])

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === "all" || provider.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = [
    { id: "all", label: "All", count: providers.length },
    ...Array.from(new Set(providers.map((p) => p.category))).map((cat) => ({
      id: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: providers.filter((p) => p.category === cat).length,
    })),
  ]

  const connectedCount = connectedSet.size
  const availableCount = providers.filter((p) => p.status === "active").length

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Integrations</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect your favorite services and start monitoring webhooks
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <ThemeToggle />
            <UserNav user={user} />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Connected" value={connectedCount} icon={CheckCircle2} color="emerald" />
          <StatCard label="Available" value={availableCount} icon={Webhook} color="blue" />
          <StatCard label="Total Providers" value={providers.length} icon={Zap} color="violet" />
        </motion.div>

        {/* Search & Filter */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                  ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }
                `}
              >
                {category.label}
                <span className="ml-2 text-xs opacity-70">{category.count}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Providers Grid */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isConnected={connectedSet.has(provider.id)} 
            />
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredProviders.length === 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No integrations found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Try adjusting your search or filter
            </p>
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}