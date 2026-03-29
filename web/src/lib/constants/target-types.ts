// export const TARGET_TYPES = [
//     {
//       id: "http",
//       name: "HTTP Endpoint",
//       description: "Send webhooks to any HTTP/HTTPS URL",
//       icon: "🌐",
//       color: "bg-blue-500",
//       configFields: [
//         { name: "url", label: "Endpoint URL", type: "text", required: true },
//         { name: "method", label: "HTTP Method", type: "select", options: ["POST", "PUT", "PATCH"], required: true },
//       ],
//     },
//     {
//       id: "sqs",
//       name: "AWS SQS",
//       description: "Publish webhooks to an SQS queue",
//       icon: "📬",
//       color: "bg-orange-500",
//       configFields: [
//         { name: "queueUrl", label: "Queue URL", type: "text", required: true },
//         { name: "region", label: "AWS Region", type: "select", options: ["us-east-1","ap-south-1"], required: true },
//       ],
//     },
//     {
//       id: "webhook",
//       name: "Custom Webhook",
//       description: "Send to a custom webhook",
//       icon: "🔗",
//       color: "bg-emerald-500",
//       configFields: [
//         { name: "url", label: "Webhook URL", type: "text", required: true },
//       ],
//     }
//   ]





// Complete TARGET_TYPES matching your backend workers
// Place this in: app/delivery-targets/page.tsx

export const TARGET_TYPES = [
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
          required: true 
        },
        { 
          name: "method", 
          label: "HTTP Method", 
          type: "select", 
          options: ["POST", "PUT", "PATCH"], 
          required: true 
        },
        { 
          name: "headers", 
          label: "Custom Headers (JSON)", 
          type: "json", 
          placeholder: '{"Authorization": "Bearer token", "X-Custom": "value"}',
          required: false 
        },
        { 
          name: "timeout", 
          label: "Timeout (seconds)", 
          type: "number", 
          placeholder: "30",
          required: false 
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
          placeholder: "https://sqs.us-east-1.amazonaws.com/123456789/my-queue",
          required: true 
        },
        { 
          name: "region", 
          label: "AWS Region", 
          type: "select", 
          options: [
            "us-east-1",
            "us-west-2", 
            "eu-west-1",
            "eu-central-1",
            "ap-south-1",
            "ap-southeast-1",
            "ap-northeast-1"
          ], 
          required: true 
        },
        { 
          name: "accessKeyId", 
          label: "AWS Access Key ID", 
          type: "text", 
          placeholder: "AKIAIOSFODNN7EXAMPLE",
          required: true 
        },
        { 
          name: "secretAccessKey", 
          label: "AWS Secret Access Key", 
          type: "password", 
          placeholder: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
          required: true 
        },
        { 
          name: "messageGroupId", 
          label: "Message Group ID (FIFO only)", 
          type: "text", 
          placeholder: "webhook-group",
          required: false 
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
          label: "Broker URLs (comma-separated)", 
          type: "text", 
          placeholder: "localhost:9092,localhost:9093",
          required: true 
        },
        { 
          name: "topic", 
          label: "Topic Name", 
          type: "text", 
          placeholder: "webhooks",
          required: true 
        },
        { 
          name: "clientId", 
          label: "Client ID", 
          type: "text", 
          placeholder: "hooktrace-producer",
          required: false 
        },
        { 
          name: "saslMechanism", 
          label: "SASL Mechanism", 
          type: "select", 
          options: ["PLAIN", "SCRAM-SHA-256", "SCRAM-SHA-512", "GSSAPI"],
          required: false 
        },
        { 
          name: "username", 
          label: "SASL Username", 
          type: "text", 
          placeholder: "kafka-user",
          required: false 
        },
        { 
          name: "password", 
          label: "SASL Password", 
          type: "password", 
          placeholder: "••••••••",
          required: false 
        },
        { 
          name: "enableSsl", 
          label: "Enable SSL", 
          type: "checkbox",
          required: false 
        },
      ],
    },
    {
      id: "rabbitmq",
      name: "RabbitMQ",
      description: "Publish webhooks to a RabbitMQ exchange",
      icon: "🐰",
      color: "bg-amber-500",
      category: "queue",
      configFields: [
        { 
          name: "host", 
          label: "RabbitMQ Host", 
          type: "text", 
          placeholder: "localhost or amqp://localhost:5672",
          required: true 
        },
        { 
          name: "exchange", 
          label: "Exchange Name", 
          type: "text", 
          placeholder: "webhooks",
          required: true 
        },
        { 
          name: "routingKey", 
          label: "Routing Key", 
          type: "text", 
          placeholder: "webhook.event",
          required: false 
        },
        { 
          name: "username", 
          label: "Username", 
          type: "text", 
          placeholder: "guest",
          required: false 
        },
        { 
          name: "password", 
          label: "Password", 
          type: "password", 
          placeholder: "••••••••",
          required: false 
        },
        { 
          name: "vhost", 
          label: "Virtual Host", 
          type: "text", 
          placeholder: "/",
          required: false 
        },
        { 
          name: "exchangeType", 
          label: "Exchange Type", 
          type: "select", 
          options: ["direct", "fanout", "topic", "headers"],
          required: false 
        },
      ],
    },
    {
      id: "redis",
      name: "Redis Pub/Sub",
      description: "Publish webhooks to a Redis channel",
      icon: "🔴",
      color: "bg-red-500",
      category: "streaming",
      configFields: [
        { 
          name: "host", 
          label: "Redis Host", 
          type: "text", 
          placeholder: "localhost",
          required: true 
        },
        { 
          name: "port", 
          label: "Redis Port", 
          type: "number", 
          placeholder: "6379",
          required: true 
        },
        { 
          name: "channel", 
          label: "Channel Name", 
          type: "text", 
          placeholder: "webhooks",
          required: true 
        },
        { 
          name: "password", 
          label: "Password", 
          type: "password", 
          placeholder: "••••••••",
          required: false 
        },
        { 
          name: "db", 
          label: "Database Number", 
          type: "number", 
          placeholder: "0",
          required: false 
        },
        { 
          name: "enableSsl", 
          label: "Enable SSL/TLS", 
          type: "checkbox",
          required: false 
        },
      ],
    },
    {
      id: "grpc",
      name: "gRPC Service",
      description: "Send webhooks to a gRPC service",
      icon: "⚡",
      color: "bg-indigo-500",
      category: "rpc",
      configFields: [
        { 
          name: "host", 
          label: "gRPC Host", 
          type: "text", 
          placeholder: "localhost:50051",
          required: true 
        },
        { 
          name: "service", 
          label: "Service Name", 
          type: "text", 
          placeholder: "webhook.WebhookService",
          required: true 
        },
        { 
          name: "method", 
          label: "Method Name", 
          type: "text", 
          placeholder: "ProcessWebhook",
          required: true 
        },
        { 
          name: "enableTls", 
          label: "Enable TLS", 
          type: "checkbox",
          required: false 
        },
        { 
          name: "metadata", 
          label: "Metadata (JSON)", 
          type: "json", 
          placeholder: '{"authorization": "Bearer token"}',
          required: false 
        },
        { 
          name: "timeout", 
          label: "Timeout (seconds)", 
          type: "number", 
          placeholder: "30",
          required: false 
        },
      ],
    },
  ]