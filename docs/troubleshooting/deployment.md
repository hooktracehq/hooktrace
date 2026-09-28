# Deployment Troubleshooting

## Verify the deployment

Check:

```bash
docker compose ps
```

Then:

```bash
curl http://localhost:3001/health
```

On Windows:

```powershell
curl.exe http://localhost:3001/health
```

Verify the API, Web dashboard, workers, PostgreSQL, and Redis.

## Containers fail to start

Inspect:

```bash
docker compose logs <service>
```

Validate:

```bash
docker compose config
```

Rebuild:

```bash
docker compose up -d --build
```

For persistent image/dependency issues:

```bash
docker compose build --no-cache
docker compose up -d
```

## Database unavailable

Check:

```bash
docker compose ps
docker compose logs postgres
```

Verify:

```env
DATABASE_URL=...
```

Use persistent database storage and backups for production.

## Redis unavailable

Check:

```bash
docker compose ps
docker compose logs redis
```

Verify:

```env
REDIS_URL=...
```

Redis must be reachable from the API and worker.

## API is healthy but dashboard fails

Verify:

```env
NEXT_PUBLIC_API_URL=...
FRONTEND_URL=...
```

For local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

For public deployments, use the public URLs reachable by the browser.

## HTTPS and reverse proxy

For a public deployment, use an HTTPS-capable reverse proxy or platform ingress.

Verify:

- TLS certificate
- DNS
- Proxy forwarding
- API routing
- Web routing
- WebSocket support where required
- Request size and timeout settings

Do not expose PostgreSQL or Redis directly to the public internet.

## Authentication breaks after deployment

Check:

```env
JWT_SECRET=...
FRONTEND_URL=...
```

For OAuth, verify the provider callback URL.

See [Authentication](./authentication.md).

## Workers are not processing events

Check:

```bash
docker compose logs worker
```

Then verify Redis and database connectivity.

Rebuild if necessary:

```bash
docker compose up -d --build worker
```

## Environment changes

After changing environment variables:

```bash
docker compose up -d
```

For source or dependency changes:

```bash
docker compose up -d --build
```

## Post-deployment checks

After an update, verify:

1. API `/health`.
2. Web dashboard.
3. Authentication.
4. PostgreSQL.
5. Redis.
6. Worker.
7. Test webhook creates an event.
8. Event reaches destination.
9. Retry behavior.
10. Replay.

## Safe updates

Before production updates:

1. Review the change.
2. Back up important data.
3. Check environment changes.
4. Pull the desired version.
5. Rebuild services.
6. Start the stack.
7. Verify health.
8. Send a test webhook.

## Rollback

If an update causes problems:

1. Record logs and errors.
2. Restore the previous application version.
3. Restart affected services.
4. Verify API health.
5. Verify webhook processing.
6. Investigate before retrying the update.

Avoid deleting database volumes as part of routine rollback.

## Production security checklist

Before exposing HookTrace publicly:

- Use strong secrets.
- Use production database credentials.
- Use HTTPS.
- Protect PostgreSQL.
- Protect Redis.
- Restrict infrastructure access.
- Keep OAuth secrets private.
- Keep tunnel credentials private.
- Configure persistent storage.
- Back up important data.
- Review logs for exposed secrets.

## Next steps

- [Common Issues](./common-issues.md)
- [Authentication](./authentication.md)
- [Deliveries](./deliveries.md)
- [Tunnels](./tunnels.md)
- [Self-hosting Overview](../self-hosting/overview.md)
- [Docker](../self-hosting/docker.md)
