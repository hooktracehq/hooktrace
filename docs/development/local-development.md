# Local Development

This guide explains how to set up HookTrace for local development.

## Prerequisites

Install:

- Git
- Docker
- Docker Compose
- Node.js
- Python 3.11+

Verify the tools:

```bash
git --version
docker --version
docker compose version
node --version
python --version
```

## Clone the repository

```bash
git clone https://github.com/hooktracehq/hooktrace.git
cd hooktrace
```

## Configure the environment

Create the local environment file:

### Linux and macOS

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Review `.env` before starting the services.

Do not commit populated environment files or secrets.

See [Environment](../self-hosting/environment.md).

## Start the backend

Build and start the Docker Compose environment:

```bash
docker compose up -d --build
```

Check the services:

```bash
docker compose ps
```

## Verify the API

Check:

```bash
curl http://localhost:3001/health
```

On Windows:

```powershell
curl.exe http://localhost:3001/health
```

Expected response:

```json
{"status":"ok"}
```

Interactive API documentation is available at:

```text
http://localhost:3001/docs
```

## Run the web application

The web dashboard can be run from the `web` directory:

```bash
cd web
npm install
npm run dev
```

The dashboard is available at:

```text
http://localhost:3000
```

Configure the frontend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Backend development

The FastAPI backend lives under `services/`.

The Docker Compose setup is the recommended way to run the complete backend environment because HookTrace depends on supporting services such as PostgreSQL and Redis.

For API-only work, use the project's Python dependencies and the API module from the repository structure.

Always verify the current repository configuration before introducing a new local startup command.

## Worker development

The worker handles background webhook processing.

Inspect worker logs with:

```bash
docker compose logs worker
```

Follow them during development:

```bash
docker compose logs -f worker
```

After worker code or dependencies change:

```bash
docker compose up -d --build worker
```

## Database development

PostgreSQL is part of the Docker Compose environment.

Check its status:

```bash
docker compose ps
```

Inspect logs:

```bash
docker compose logs postgres
```

Avoid deleting the database volume unless you intentionally want to reset local data.

## Redis development

Redis provides queueing and background-processing infrastructure.

Inspect it with:

```bash
docker compose ps
docker compose logs redis
```

## Making code changes

A typical development loop is:

```text
Change code
    │
    ▼
Run or rebuild affected service
    │
    ▼
Check logs
    │
    ▼
Test behavior
    │
    ▼
Run validation
```

For frontend changes, the Next.js development server provides the normal development feedback loop.

For backend or worker dependency changes, rebuild the relevant Docker service.

## Checking the Compose configuration

Before committing deployment configuration changes:

```bash
docker compose config
```

This catches malformed Compose configuration and helps verify environment-variable resolution.

Do not share the output publicly if it contains secrets.

## Code quality checks

Before opening a pull request, run the project's available build, type-check, lint, and test commands relevant to the code you changed.

For the web application, verify the production build when changing frontend code:

```bash
cd web
npm run build
```

The exact available scripts are defined by the current project configuration.

## Testing a webhook locally

A useful local workflow is:

```text
Start HookTrace
      │
      ▼
Create Route
      │
      ▼
Send Test Webhook
      │
      ▼
Inspect Event
      │
      ▼
Verify Delivery
      │
      ▼
Test Replay
```

For local applications that need externally reachable webhook traffic, use HookTrace tunnels.

See [Tunnels](../concepts/tunnels.md).

## Viewing logs

Useful commands:

```bash
docker compose logs api
docker compose logs worker
docker compose logs -f api
docker compose logs -f worker
```

Inspect the relevant service rather than relying only on application logs.

## Resetting local development

Stop services:

```bash
docker compose down
```

Reset the local Compose volumes:

```bash
docker compose down -v
```

**Warning:** removing volumes can delete local PostgreSQL data.

## Next steps

- [Project Structure](./project-structure.md)
- [Testing](./testing.md)
- [Contributing](./contributing.md)
- [Self-hosting](../self-hosting/overview.md)
