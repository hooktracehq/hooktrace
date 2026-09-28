# Testing

Testing helps ensure that changes do not break webhook ingestion, delivery, authentication, or the dashboard.

## Testing workflow

A useful development workflow is:

```text
Make Change
    │
    ▼
Run Relevant Checks
    │
    ▼
Start Required Services
    │
    ▼
Test the Feature
    │
    ▼
Run Build / Tests Again
```

## Start the development environment

Start the backend services:

```bash
docker compose up -d --build
```

Verify:

```bash
docker compose ps
```

Check API health:

```bash
curl http://localhost:3001/health
```

On Windows:

```powershell
curl.exe http://localhost:3001/health
```

## API testing

FastAPI exposes interactive API documentation at:

```text
http://localhost:3001/docs
```

Use it to inspect and manually exercise available API endpoints during development.

When testing authenticated endpoints, use the authentication mechanism expected by the current API.

## Webhook testing

A basic webhook test should verify the complete lifecycle:

```text
Send Webhook
     │
     ▼
Route Receives Request
     │
     ▼
Event Created
     │
     ▼
Delivery Queued
     │
     ▼
Destination Receives Request
```

After the event is created, inspect the event and delivery through the dashboard or API.

## Delivery testing

Test both successful and failed delivery scenarios.

### Successful delivery

Verify:

- Event is received.
- Delivery is attempted.
- Destination receives the request.
- Destination returns the expected response.

### Failed delivery

Verify:

- Failed delivery is visible.
- Retry behavior occurs according to configuration.
- Worker continues processing.
- The event can be replayed when appropriate.

## Replay testing

Replay is an important part of the webhook workflow.

A replay test should verify:

1. An existing event is selected.
2. Replay is requested.
3. The event returns to the processing workflow.
4. A new delivery attempt occurs.
5. The destination receives the replayed event.

See [Replay](../concepts/replay.md).

## Authentication testing

Authentication changes should be tested for:

- Registration
- Login
- Logout
- Current-user retrieval
- Invalid credentials
- Session handling
- OAuth flows when configured

Do not use production credentials during local testing.

## Tunnel testing

When changing tunnel functionality, test:

```text
Webhook Provider
       │
       ▼
HookTrace
       │
       ▼
Tunnel
       │
       ▼
Local Application
```

Verify both tunnel connectivity and actual request forwarding.

See [Tunnel Troubleshooting](../troubleshooting/tunnels.md).

## Frontend testing

For frontend changes, verify the application locally:

```bash
cd web
npm install
npm run dev
```

Then test the affected dashboard flow in the browser.

For production-build validation:

```bash
npm run build
```

This catches TypeScript, compilation, and build-time issues that may not appear during development.

## Build validation

Before submitting changes, run the appropriate production build for affected components.

For the web application:

```bash
cd web
npm run build
```

For Dockerized backend changes:

```bash
docker compose build
```

Then start the services:

```bash
docker compose up -d
```

## Configuration validation

Validate Docker Compose configuration:

```bash
docker compose config
```

This is especially important after changing:

- `docker-compose.yml`
- `.env.example`
- Service environment variables
- Database configuration
- Redis configuration

## Logs during tests

Use service logs when a test fails:

```bash
docker compose logs api
docker compose logs worker
```

Follow logs during an active test:

```bash
docker compose logs -f worker
```

## Regression testing

When fixing a bug, test the original failure case after applying the fix.

A useful regression workflow is:

```text
Reproduce Bug
     │
     ▼
Apply Fix
     │
     ▼
Repeat Original Test
     │
     ▼
Run Related Tests
     │
     ▼
Run Build / Validation
```

## Before opening a pull request

At minimum:

- Run relevant tests.
- Run the affected build.
- Check TypeScript/build errors for frontend changes.
- Validate Docker configuration when Compose files change.
- Test the affected webhook workflow.
- Review the diff.
- Confirm no secrets were added.

## Test data

Avoid committing real webhook payloads containing:

- API keys
- Access tokens
- Personal information
- Payment information
- Production identifiers
- Other confidential data

Use synthetic or sanitized test payloads when adding fixtures or examples.

## Next steps

- [Local Development](./local-development.md)
- [Project Structure](./project-structure.md)
- [Contributing](./contributing.md)
- [Troubleshooting](../troubleshooting/common-issues.md)
