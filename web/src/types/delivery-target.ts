/* ---------------- Core Target ---------------- */

export type DeliveryTarget = {
  id: string
  name: string
  type: string
  config: TargetConfig
  enabled: boolean
  createdAt: string
  lastUsed?: string | null
  successCount: number
  errorCount: number
  providers: string[]
}



export type DeliveryTargetPayload = {
  name: string
  type: string
  config: TargetConfig
  providers?: string[]
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








export type HttpConfig = {
  url?: string
  method?: string
  timeout?: number
  retries?: number
  secret?: string
  headers?: string | Record<string, string>
  transform?: string

}

export type KafkaConfig = {
  brokers?: string
  topic?: string
  clientId?: string
  username?: string 
  password?: string
}

export type RedisConfig = {
  redisUrl?: string
  channel?: string
}

export type SqsConfig = {
  queueUrl?: string
  region?: string
  accessKeyId?: string 
  secretAccessKey?: string 
  messageGroupId?: string
}

export type RabbitMQConfig = {
  host?: string
  exchange?: string
  routingKey?: string
}

export type SlackConfig = {
  webhookUrl?: string
  channel?: string 
  mentionOnError?: string
}

export type EmailConfig = {
  recipients?: string
  subject?: string
  includePayload?: boolean
}

export type GrpcConfig = {
  grpcUrl?: string
  service?: string
}


export type TargetConfig = Partial<
  HttpConfig &
  KafkaConfig &
  RedisConfig &
  SqsConfig &
  RabbitMQConfig &
  SlackConfig &
  EmailConfig &
  GrpcConfig
>