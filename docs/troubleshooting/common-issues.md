# Common Issues

This page covers common problems when running or using a self-hosted HookTrace installation.

## Check service status

```bash
docker compose ps
```

If a service is not running:

```bash
docker compose logs api
docker compose logs worker
```

Follow logs with:

```bash
docker compose logs -f api
```

## API health check fails

Check:

```bash
curl http://localhost:3001/health
```

On Windows PowerShell:

```powershell
curl.exe http://localhost:3001/health
```

A healthy API returns:

```json
{"status":"ok"}
```

If it does not respond, check service status, API logs, port `3001`, environment configuration, PostgreSQL, and Redis.

## Containers do not start

Inspect the affected service:

```bash
docker compose logs <service>
```

Rebuild when dependencies or images changed:

```bash
docker compose up -d --build
```

For persistent build problems:

```bash
docker compose build --no-cache
docker compose up -d
```

## PostgreSQL connection problems

Verify:

- PostgreSQL is running.
- `DATABASE_URL` is correct.
- Database credentials match.
- The database name is correct.
- API and PostgreSQL share the expected Compose network.

Inspect:

```bash
docker compose logs postgres
```

Validate configuration with:

```bash
docker compose config
```

Do not share resolved configuration publicly if it contains credentials.

## Redis connection problems

Check:

```bash
docker compose ps
docker compose logs redis
```

Verify:

```env
REDIS_URL=redis://redis:6379
```

The hostname must match the Redis service in the deployment environment.

## Dashboard cannot reach the API

For local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Restart the web development server after changing frontend environment variables.

Also verify:

```text
http://localhost:3001/health
```

If the API is reachable but browser requests fail, inspect API CORS and `FRONTEND_URL`.

## Port already in use

Common development ports are `3000` for Web and `3001` for API.

On Windows:

```powershell
netstat -ano | findstr :3001
```

Stop or reconfigure the conflicting process.

## Worker is not processing jobs

Check:

```bash
docker compose ps
docker compose logs worker
```

Verify Redis connectivity and worker configuration.

After worker changes:

```bash
docker compose up -d --build worker
```

## Environment variable problems

Start from:

```powershell
Copy-Item .env.example .env
```

Review `.env`, then validate:

```bash
docker compose config
```

After changing environment variables, recreate the relevant services:

```bash
docker compose up -d
```

## Reset a development installation

Stop the stack:

```bash
docker compose down
```

Reset containers and Compose volumes:

```bash
docker compose down -v
```

**Warning:** `down -v` can delete PostgreSQL data.

## Useful diagnostic commands

```bash
docker compose ps
docker compose logs
docker compose logs api
docker compose logs worker
docker compose config
curl http://localhost:3001/health
```

On Windows:

```powershell
curl.exe http://localhost:3001/health
```

## Next steps

- [Authentication](./authentication.md)
- [Deliveries](./deliveries.md)
- [Tunnels](./tunnels.md)
- [Deployment](./deployment.md)
