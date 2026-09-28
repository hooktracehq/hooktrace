# Self-hosting

HookTrace is open source and can be self-hosted on your own infrastructure.

Self-hosting gives you control over the HookTrace application, its data, deployment environment, and supporting services.

```text id="6xq2mt"
                    HookTrace
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
      Web            API           Workers
        │              │              │
        └──────────────┼──────────────┘
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
         PostgreSQL           Redis
```

## What you need

A HookTrace installation consists of several application and infrastructure services.

The core components are:

| Component  | Purpose                          |
| ---------- | -------------------------------- |
| Web        | HookTrace dashboard              |
| API        | HTTP API and application backend |
| Worker     | Processes webhook delivery jobs  |
| PostgreSQL | Persistent application data      |
| Redis      | Queues and background processing |

Additional services may be used by specific HookTrace features or development environments.

## Recommended deployment

For getting started with a self-hosted HookTrace installation, Docker Compose is the primary deployment path documented by this project.

Docker Compose allows the required services to run together with a consistent configuration.

```text id="u3f9kp"
                    Docker Compose
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
      Web               API              Worker
                         │                 │
                         └────────┬────────┘
                                  │
                         ┌────────┴────────┐
                         ▼                 ▼
                    PostgreSQL           Redis
```

See [Docker](./docker.md) for the installation procedure.

## Application components

### Web dashboard

The web application provides the HookTrace user interface.

The dashboard is used to work with routes, events, deliveries, tunnels, and other HookTrace functionality.

The default development port is:

```text id="4q7d9m"
http://localhost:3000
```

### API

The API provides the backend functionality used by the dashboard and external clients.

The default development port is:

```text id="k5r2wx"
http://localhost:3001
```

The API health endpoint is:

```text id="p8n4vc"
http://localhost:3001/health
```

Interactive API documentation is available at:

```text id="w2j6qa"
http://localhost:3001/docs
```

### Worker

The worker processes background webhook jobs.

This separates asynchronous processing from the API so webhook processing does not depend on keeping the HTTP request handler running for the entire delivery workflow.

### PostgreSQL

PostgreSQL stores persistent HookTrace data.

The database is required for a complete HookTrace installation.

### Redis

Redis is used for queueing and background processing.

The API and worker communicate through the configured Redis instance for asynchronous webhook processing.

## Configuration

HookTrace uses environment variables for configuration.

For local development, start from the provided example:

```bash id="s9x3hd"
cp .env.example .env
```

On Windows PowerShell:

```powershell id="v4c7mn"
Copy-Item .env.example .env
```

Review the resulting `.env` file before starting the services.

Do not commit `.env` or other files containing secrets to Git.

See [Environment](./environment.md) for the available configuration options.

## Database and Redis

A self-hosted installation needs access to both PostgreSQL and Redis.

When using Docker Compose, these services can run as part of the same Compose environment.

The API and workers use the configured connection URLs:

```env id="d7m2qx"
DATABASE_URL=...
REDIS_URL=...
```

For production deployments, use credentials and infrastructure appropriate for your environment rather than development defaults.

## Authentication

HookTrace supports local authentication as well as configured OAuth providers.

Authentication configuration can require environment variables for secrets and provider credentials.

For production deployments:

* Use a strong `JWT_SECRET`
* Keep OAuth credentials private
* Configure the correct frontend URL
* Do not commit credentials to the repository
* Use HTTPS for externally accessible deployments

See the authentication and environment documentation for configuration details.

## Production considerations

A local Docker Compose installation is useful for development and self-hosted environments.

For production, consider:

* Persistent PostgreSQL storage
* Persistent Redis configuration where required
* Secure application secrets
* HTTPS
* Appropriate firewall rules
* Database backups
* Monitoring and logging
* Resource limits
* Worker capacity
* Secure OAuth configuration

The exact production architecture depends on your infrastructure and traffic requirements.

## Updating HookTrace

Because HookTrace is open source, you control when and how you update your installation.

Before updating a production deployment:

1. Review the release or changelog.
2. Back up important data.
3. Pull the desired version.
4. Review configuration changes.
5. Rebuild the affected containers.
6. Start the updated services.
7. Verify the API health endpoint.
8. Verify the dashboard and webhook processing.

## Deployment options

HookTrace can be deployed using different infrastructure approaches.

The documentation provides separate guides for:

* [Docker](./docker.md)
* [Railway](./railway.md)
* [Render](./render.md)
* [Kubernetes](./kubernetes.md)

These guides should be used according to the infrastructure you choose.

## Troubleshooting

If a self-hosted installation is not working as expected, start by checking the service status:

```bash id="n8v3cl"
docker compose ps
```

Then inspect the relevant service logs:

```bash id="q6k1fz"
docker compose logs api
docker compose logs worker
```

Also verify:

* PostgreSQL is healthy
* Redis is reachable
* API environment variables are configured
* The API health endpoint responds
* The web application points to the correct API URL
* Required credentials are present

See [Troubleshooting](./troubleshooting.md) for common problems.

## Next steps

* [Docker](./docker.md) — run HookTrace with Docker Compose
* [Environment](./environment.md) — configure environment variables
* [Railway](./railway.md) — deploy on Railway
* [Render](./render.md) — deploy on Render
* [Kubernetes](./kubernetes.md) — deploy with Kubernetes
* [Troubleshooting](./troubleshooting.md) — diagnose deployment issues
