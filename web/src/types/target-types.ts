import type { TargetType } from "@/types/delivery-target"

export const TARGET_TYPES: TargetType[] = [
  {
    id: "http",
    name: "HTTP Endpoint",
    description: "Send webhooks to any HTTP/HTTPS URL",
    icon: "🌐",
    color: "bg-blue-500",
    category: "web",
    configFields: [
      {
        name: "url",
        label: "Endpoint URL",
        type: "text",
        placeholder: "https://api.example.com/webhook",
        required: true,
      },
      {
        name: "method",
        label: "HTTP Method",
        type: "select",
        options: ["POST", "PUT", "PATCH"],
        required: true,
      },
    ],
  },

  {
    id: "sqs",
    name: "AWS SQS",
    description: "Publish webhooks to an Amazon SQS queue",
    icon: "📬",
    color: "bg-orange-500",
    category: "queue",
    configFields: [
      {
        name: "queueUrl",
        label: "Queue URL",
        type: "text",
        required: true,
      },
      {
        name: "region",
        label: "AWS Region",
        type: "select",
        options: ["us-east-1", "ap-south-1"],
        required: true,
      },
    ],
  },

  {
    id: "kafka",
    name: "Apache Kafka",
    description: "Stream webhooks to a Kafka topic",
    icon: "📊",
    color: "bg-purple-500",
    category: "streaming",
    configFields: [
      {
        name: "brokers",
        label: "Broker URLs",
        type: "text",
        required: true,
      },
      {
        name: "topic",
        label: "Topic",
        type: "text",
        required: true,
      },
    ],
  },
]