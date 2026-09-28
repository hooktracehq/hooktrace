# Docker

Docker Compose is the primary way to run HookTrace locally and is also suitable for self-hosted deployments where you want to manage the complete HookTrace stack yourself.

The Compose configuration starts the application and its supporting infrastructure together.

```text id="j8k4sd"
                    Docker Compose
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
      Web               API              Worker
                         │                 │
                         ├───────┐         │
                         ▼       ▼         │
                    PostgreSQL  Redis ◄────┘
```

## Prerequisites

Before starting HookTrace with Docker, install:

* Docker
* Docker Compose

Docker Desktop includes Docker Compose on supported platforms.

Verify the installation:

```bash
docker --version
docker compose version
```

## Get the source

Clone the HookTrace repository:

```bash
git clone https://github.com/hooktracehq/hooktrace.git
cd hooktrace
```

## Configure the environment

Create your local environment file from the provided example.

### Linux and macOS

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Review `.env` before starting the stack.

At minimum, make sure production deployments use secure values for secrets such as:

```env
JWT_SECRET=your-secure-secret
```

Do not commit `.env` to Git.

## Start HookTrace

From the repository root:

```bash
docker compose up -d --build
```

The `--build` flag ensures the containers are rebuilt using the current source and dependency configuration.

To see the running services:

```bash
docker compose ps
```

You should see the HookTrace services and their supporting infrastructure.

## Verify the API

After the containers start, check the API health endpoint:

```bash
curl http://localhost:3001/health
```

A successful response should look like:

```json
{
  "status": "ok"
}
```

On Windows PowerShell, you can use:

```powershell
curl.exe http://localhost:3001/health
```

## API documentation

The FastAPI application exposes interactive API documentation at:

```text
http://localhost:3001/docs
```

Open that address in your browser to inspect the available API endpoints.

## Start the web dashboard

The web dashboard runs separately from the Docker Compose backend during the standard local development workflow.

From the repository root:

```bash
cd web
npm install
npm run dev
```

The dashboard is available at:

```text
http://localhost:3000
```

Make sure the frontend is configured to use the API:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Service architecture

The Docker Compose environment contains the services required by HookTrace and its supporting infrastructure.

The main application services are:

### API

The API provides the HTTP interface for HookTrace.

```text
API
└── http://localhost:3001
```

### Worker

The worker handles background processing such as webhook delivery jobs.

### PostgreSQL

PostgreSQL provides persistent storage for HookTrace.

### Redis

Redis provides queueing and background processing infrastructure.

Additional services may be included in the Compose environment for features such as metrics, messaging, local development, or integrations.

## Viewing logs

If a service is not behaving as expected, inspect its logs.

For the API:

```bash
docker compose logs api
```

For the worker:

```bash
docker compose logs worker
```

To follow logs continuously:

```bash
docker compose logs -f api
```

You can also inspect all service logs:

```bash
docker compose logs
```

## Restarting services

To restart the complete stack:

```bash
docker compose restart
```

To restart a specific service:

```bash
docker compose restart api
```

Or:

```bash
docker compose restart worker
```

## Rebuilding services

After changing application code or dependencies, rebuild the affected containers:

```bash
docker compose up -d --build
```

For a clean rebuild without using cached Docker layers:

```bash
docker compose build --no-cache
docker compose up -d
```

Use a no-cache build when debugging dependency or image build problems.

## Stopping HookTrace

To stop the running containers:

```bash
docker compose down
```

This stops and removes the Compose containers while preserving named volumes unless they are explicitly removed.

## Resetting the development environment

To remove the containers and their associated Compose volumes:

```bash
docker compose down -v
```

**Warning:** removing volumes can delete persistent development data, including PostgreSQL data.

Use this command only when you intentionally want to reset the environment.

## Checking configuration

Before starting a deployment, you can validate the resolved Compose configuration:

```bash
docker compose config
```

This is useful for detecting malformed configuration and checking that environment variables are being resolved as expected.

Do not share the output publicly if it contains credentials or other sensitive values.

## Production considerations

The default development configuration should not be treated as a production security configuration.

For production deployments:

* Use strong, unique secrets
* Do not use development database passwords
* Configure the correct frontend URL
* Use HTTPS
* Protect PostgreSQL and Redis from public access
* Use persistent database storage
* Back up important data
* Review resource requirements
* Monitor application and worker logs
* Keep credentials outside the repository

## Updating a Docker deployment

When updating HookTrace:

```bash
git pull
```

Then rebuild and restart the services:

```bash
docker compose up -d --build
```

After the update, verify the API:

```bash
curl http://localhost:3001/health
```

Then check the service status:

```bash
docker compose ps
```

## Troubleshooting

If the API does not start, inspect the API logs:

```bash
docker compose logs api
```

If webhook processing is not occurring, inspect the worker:

```bash
docker compose logs worker
```

If the API cannot connect to the database, verify:

* PostgreSQL is running
* `DATABASE_URL` is correct
* Database credentials match
* The API and PostgreSQL services are on the same Compose network

If queue processing is failing, verify:

* Redis is running
* `REDIS_URL` is correct
* The worker is running

For additional troubleshooting, see [Troubleshooting](./troubleshooting.md).

## Next steps

* [Environment](./environment.md) — configure HookTrace environment variables
* [Troubleshooting](./troubleshooting.md) — diagnose common problems
* [Self-hosting Overview](./overview.md) — understand the complete deployment architecture
