type Props = {
    provider?: string
  }
  
  const PROVIDERS: Record<string, { label: string; icon: string; color: string }> = {
    stripe: { label: "Stripe", icon: "💳", color: "bg-purple-100 text-purple-700" },
    github: { label: "GitHub", icon: "🐙", color: "bg-gray-100 text-gray-700" },
    shopify: { label: "Shopify", icon: "🛍️", color: "bg-emerald-100 text-emerald-700" },
    razorpay: { label: "Razorpay", icon: "💰", color: "bg-blue-100 text-blue-700" },
    slack: { label: "Slack", icon: "💬", color: "bg-purple-100 text-purple-700" },
    discord: { label: "Discord", icon: "🎮", color: "bg-indigo-100 text-indigo-700" },
    notion: { label: "Notion", icon: "📝", color: "bg-gray-200 text-gray-800" },
    supabase: { label: "Supabase", icon: "⚡", color: "bg-emerald-100 text-emerald-700" },
    generic: { label: "Generic", icon: "🔗", color: "bg-gray-100 text-gray-700" },
  }
  
  export function ProviderBadge({ provider = "generic" }: Props) {
    const p = PROVIDERS[provider] || PROVIDERS.generic
  
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${p.color}`}
      >
        <span>{p.icon}</span>
        {p.label}
      </span>
    )
  }