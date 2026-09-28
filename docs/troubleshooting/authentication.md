# Authentication Troubleshooting

## Login fails

Check:

1. The API is healthy.
2. API logs contain no authentication errors.
3. Account credentials are correct.
4. The frontend points to the correct API.
5. Browser network requests do not show failed authentication calls.

Inspect:

```bash
docker compose logs api
```

## Session or cookie problems

Verify:

```env
JWT_SECRET=change-me-in-production
FRONTEND_URL=http://localhost:3000
```

The example JWT value is for development only. Use a strong random secret in production.

After changing authentication configuration:

```bash
docker compose up -d --build api
```

## Frontend and API URLs

For local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

Make sure the browser is using the frontend origin configured for the API.

## CORS errors

If the browser reports CORS errors, verify `FRONTEND_URL`:

```env
FRONTEND_URL=http://localhost:3000
```

Restart the API after changing it.

Inspect browser network requests and API logs.

## OAuth login problems

HookTrace can be configured with OAuth providers such as Google and GitHub.

Verify:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

Also verify that the provider has the correct callback URL registered for the HookTrace installation.

Never expose OAuth client secrets in logs, screenshots, issues, or source control.

## OAuth callback fails

Check:

1. API logs.
2. OAuth client ID.
3. OAuth client secret.
4. Application/frontend URL.
5. Provider callback URL.
6. Callback reachability.

## Authentication after deployment

Verify:

- `JWT_SECRET` is a strong production value.
- `FRONTEND_URL` matches the public frontend.
- The frontend uses the correct public API URL.
- HTTPS is configured.
- OAuth callback URLs use the public hostname.

## Logs

Use:

```bash
docker compose logs api
```

or:

```bash
docker compose logs -f api
```

Avoid sharing logs containing tokens or credentials.

## Next steps

- [Common Issues](./common-issues.md)
- [Deliveries](./deliveries.md)
- [Deployment](./deployment.md)
