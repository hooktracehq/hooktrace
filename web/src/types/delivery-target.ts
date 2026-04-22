/* ---------------- Core Target ---------------- */

export type DeliveryTarget = {
  id: string
  name: string
  type: string
  config: Record<string, unknown>
  enabled: boolean
  createdAt: string
  lastUsed?: string | null
  successCount: number
  errorCount: number
  providers: string[]
}

/* ---------------- Target Stats ---------------- */

export type TargetStats = {
  successCount: number
  errorCount: number
  totalCount: number
  successRate: number
  lastUsed?: string | null
}

/* ---------------- Target Types (UI config) ---------------- */

export type TargetFieldType =
  | "text"
  | "number"
  | "select"
  | "password"
  | "json"
  | "checkbox"

export type TargetConfigField = {
  name: string
  label: string
  type: TargetFieldType
  placeholder?: string
  required?: boolean
  options?: string[]
}

export type TargetType = {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: "web" | "queue" | "streaming" | "rpc"
  configFields: TargetConfigField[]
}