import { motion } from "framer-motion"

type FeatureProps = {
  title: string
  description: string
}

function Feature({ title, description }: FeatureProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-border bg-card p-6 space-y-3 card-glow"
    >
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}

export function Features() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-semibold">
          Built for production webhooks
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <Feature
            title="Reliable Delivery"
            description="Automatic retries, DLQ, and idempotency protection."
          />

          <Feature
            title="Full Visibility"
            description="Inspect payloads, headers, and delivery logs."
          />

          <Feature
            title="One-Click Replay"
            description="Fix endpoint → resend instantly."
          />
        </div>
      </div>
    </section>
  )
}