# Environment Variables

HookTrace is configured through environment variables.

For local development, copy the provided example file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Review the values before starting HookTrace.

> **Security:** Never commit `.env` files or production credentials to Git. Use secure, unique values for production secrets.

## Database

These variables configure PostgreSQL.

| Variable            | Description               | Example            |
| ------------------- | ------------------------- | ------------------ |
| `POSTGRES_USER`     | PostgreSQL username       | `hooktrace`        |
| `POSTGRES_PASSWORD` | PostgreSQL password       | `hooktrace_dev`    |
| `POSTGRES_DB`       | PostgreSQL database name  | `hooktrace`        |
| `DATABASE_URL`      | PostgreSQL connection URL | `postgresql://...` |

For a Docker Compose installation, the API and worker use the configured PostgreSQL connection.

For production, replace development credentials with strong credentials and use a persistent database.

## Redis

Redis is used for queues and background processing.

| Variable    | Description          | Example              |
| ----------- | -------------------- | -------------------- |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379` |

For a local Docker Compose installation, the Redis service is available to the application through the Compose network.

## API

These variables configure the API service.

| Variable       | Description                                          | Example                   |
| -------------- | ---------------------------------------------------- | ------------------------- |
| `ENV`          | Application environment                              | `development`             |
| `NODE_ENV`     | Node environment value used by the application stack | `development`             |
| `API_HOST`     | API bind address                                     | `0.0.0.0`                 |
| `API_PORT`     | API port                                             | `3001`                    |
| `FRONTEND_URL` | Frontend URL used by the API                         | `http://localhost:3000`   |
| `JWT_SECRET`   | Secret used for authentication/session signing       | `change-me-in-production` |
| `LOG_LEVEL`    | Application logging level                            | `debug`                   |

### JWT secret

Do not use the example value in production:

```env
JWT_SECRET=change-me-in-production
```

Generate and use a strong random secret for production.

## Web dashboard

The web application uses the API URL to communicate with the backend.

| Variable              | Description                                | Example                 |
| --------------------- | ------------------------------------------ | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Public API URL used by the web application | `http://localhost:3001` |
| `DASHBOARD_PORT`      | Dashboard development port                 | `3000`                  |

For a local installation:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

If the API is deployed at another hostname, update this value accordingly.

## Webhook configuration

These variables control webhook processing behavior.

| Variable                     | Description                     | Example |
| ---------------------------- | ------------------------------- | ------- |
| `WEBHOOK_DEFAULT_TIMEOUT`    | Default webhook request timeout | `30000` |
| `WEBHOOK_MAX_RETRY_ATTEMPTS` | Maximum webhook retry attempts  | `5`     |
| `WEBHOOK_BATCH_SIZE`         | Webhook processing batch size   | `100`   |

Timeout values are expressed in milliseconds where applicable.

## Worker configuration

These variables configure background worker behavior.

| Variable                          | Description              | Example |
| --------------------------------- | ------------------------ | ------- |
| `WORKER_CONCURRENCY`              | Worker concurrency       | `5`     |
| `WORKER_MAX_RETRIES`              | Maximum worker retries   | `5`     |
| `WORKER_RETRY_BACKOFF_MULTIPLIER` | Retry backoff multiplier | `2`     |
| `WORKER_RETRY_BACKOFF_DELAY_MS`   | Base retry backoff delay | `1000`  |

Retry settings should be chosen according to the reliability requirements of your deployment.

See [Retries](../concepts/retries.md) for the webhook retry model.

## Feature flags

HookTrace includes feature flags for functionality that can be enabled or disabled through configuration.

| Variable                       | Default |
| ------------------------------ | ------: |
| `FEATURE_IDEMPOTENCY`          | `false` |
| `FEATURE_SIGNATURE_VALIDATION` | `false` |
| `FEATURE_DLQ`                  | `false` |
| `FEATURE_WEBSOCKET_LOGS`       | `false` |
| `FEATURE_EVENT_AGGREGATION`    | `false` |
| `FEATURE_MULTIPLE_TARGETS`     | `false` |
| `FEATURE_AI_DIAGNOSTICS`       | `false` |
| `FEATURE_REPLAY_COMPARE`       | `false` |

Enable a feature only when the corresponding functionality is available and configured in your installation.

For example:

```env
FEATURE_IDEMPOTENCY=false
FEATURE_SIGNATURE_VALIDATION=false
FEATURE_DLQ=false
```

## OAuth

HookTrace can be configured with OAuth providers.

### Google

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### GitHub

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

Keep OAuth client secrets private.

Do not commit populated OAuth credentials to the repository.

## Kafka

Kafka configuration is available for deployments that use Kafka-backed processing or integrations.

| Variable        | Description                         |
| --------------- | ----------------------------------- |
| `KAFKA_BROKERS` | Kafka broker connection information |

Example:

```env
KAFKA_BROKERS=kafka:9092
```

Use the broker address appropriate for your deployment.

## RabbitMQ

RabbitMQ configuration controls access to the RabbitMQ service.

| Variable                | Description       | Example         |
| ----------------------- | ----------------- | --------------- |
| `RABBITMQ_HOST`         | RabbitMQ hostname | `rabbitmq`      |
| `RABBITMQ_DEFAULT_USER` | RabbitMQ username | `hooktrace`     |
| `RABBITMQ_DEFAULT_PASS` | RabbitMQ password | `hooktrace_dev` |

For production, use secure credentials.

## AWS and LocalStack

HookTrace can be configured with AWS-related settings and LocalStack for local development.

| Variable                | Description                      |
| ----------------------- | -------------------------------- |
| `AWS_REGION`            | AWS region                       |
| `AWS_ENDPOINT_URL`      | Optional AWS-compatible endpoint |
| `LOCALSTACK_AUTH_TOKEN` | LocalStack authentication token  |

Example region:

```env
AWS_REGION=us-east-1
```

If using LocalStack, configure its endpoint and credentials according to your local environment.

Do not commit LocalStack or AWS credentials to Git.

## Local development

A minimal local development environment can start with the values supplied by `.env.example`.

For example:

```env
ENV=development
NODE_ENV=development

POSTGRES_USER=hooktrace
POSTGRES_PASSWORD=hooktrace_dev
POSTGRES_DB=hooktrace

DATABASE_URL=postgresql://hooktrace:hooktrace_dev@postgres:5432/hooktrace
REDIS_URL=redis://redis:6379

API_HOST=0.0.0.0
API_PORT=3001

NEXT_PUBLIC_API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

DASHBOARD_PORT=3000
LOG_LEVEL=debug
```

The complete `.env.example` should remain the source of truth for the currently supported configuration variables.

## Production configuration

Before deploying HookTrace publicly, review all configuration values.

At minimum:

* Replace development database credentials.
* Generate a strong `JWT_SECRET`.
* Configure the correct `FRONTEND_URL`.
* Configure the correct public API URL.
* Configure OAuth credentials if OAuth is enabled.
* Review retry and timeout settings.
* Configure persistent PostgreSQL storage.
* Protect Redis and PostgreSQL from public access.
* Keep all credentials outside the Git repository.
* Use HTTPS for public deployments.

## Checking Docker configuration

When using Docker Compose, you can validate the resolved configuration with:

```bash
docker compose config
```

This is useful for checking configuration syntax and environment-variable resolution.

Be careful when sharing the output because resolved configuration can contain credentials and other secrets.

## Environment files and Git

The repository should contain:

```text
.env.example
```

but not your populated:

```text
.env
```

A safe workflow is:

```text
.env.example
     │
     │ copy
     ▼
   .env
     │
     └── local / deployment secrets
```

The example file documents the expected configuration without exposing your actual credentials.

## Next steps

* [Docker](./docker.md) — run HookTrace with Docker Compose
* [Troubleshooting](./troubleshooting.md) — diagnose configuration and deployment problems
* [Self-hosting Overview](./overview.md) — understand the self-hosted architecture
