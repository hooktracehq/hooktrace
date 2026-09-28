# Delivery Troubleshooting

This page covers cases where HookTrace receives an event but it does not reach the configured destination.

## Start with the event

First confirm that HookTrace received the webhook.

If no event exists, investigate the provider and route:

```text
Provider → HookTrace Route → Event
```

If the event exists, continue with delivery troubleshooting.

## Check the delivery target

Verify:

- Target URL
- Development or production mode
- Route configuration
- Destination availability

A wrong target URL can prevent delivery.

## Check the destination

Make sure the destination application is running and reachable.

For a public destination, verify the URL is reachable from the HookTrace environment.

Remember that `localhost` inside a Docker container refers to that container, not your host machine.

## Inspect API and worker logs

```bash
docker compose logs api
docker compose logs worker
```

Follow worker logs while testing:

```bash
docker compose logs -f worker
```

## Delivery fails repeatedly

Check:

1. Destination URL.
2. Destination logs.
3. HTTP response.
4. Connection or timeout errors.
5. Retry configuration.

Relevant settings include:

```env
WEBHOOK_DEFAULT_TIMEOUT=30000
WEBHOOK_MAX_RETRY_ATTEMPTS=5
WORKER_MAX_RETRIES=5
WORKER_RETRY_BACKOFF_MULTIPLIER=2
WORKER_RETRY_BACKOFF_DELAY_MS=1000
```

## Destination returns an error

Common causes include:

- Application exception
- Invalid request handling
- Authentication failure
- Incorrect endpoint
- Missing required headers
- Temporary application outage

Inspect both HookTrace delivery information and destination logs.

## Destination times out

Check:

- Destination reachability
- Application response time
- Configured timeout
- Network connectivity
- Reverse proxy behavior

For local development, verify the tunnel and local application.

## Delivery succeeds but application does not behave correctly

A successful HTTP response does not necessarily mean the business operation succeeded.

Check:

- Response status
- Application logs
- Payload parsing
- Provider-specific event handling
- Idempotency behavior

## Retry

HookTrace can retry failed deliveries according to its retry configuration.

See [Retries](../concepts/retries.md).

## Replay

After fixing the destination, intentionally resend an existing event with replay.

See [Replay](../concepts/replay.md).

## Provider delivered but HookTrace did not receive it

Check:

- Provider webhook URL
- DNS
- HTTPS
- Reverse proxy
- Firewall
- Public accessibility
- Provider delivery logs

Compare provider HTTP responses with HookTrace API logs.

## Next steps

- [Common Issues](./common-issues.md)
- [Retries](../concepts/retries.md)
- [Replay](../concepts/replay.md)
- [Tunnels](./tunnels.md)
