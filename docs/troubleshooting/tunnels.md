# Tunnel Troubleshooting

## Tunnel is not connecting

Check:

1. The tunnel exists in HookTrace.
2. The tunnel client is running.
3. Credentials are correct.
4. The local application is running.
5. HookTrace is reachable.

## Local application receives nothing

Trace the workflow:

```text
Webhook Provider
       ↓
HookTrace
       ↓
Tunnel
       ↓
Local Application
```

If no event appears in HookTrace, investigate the provider and route.

If the event exists but the local application receives nothing, investigate the tunnel and local application.

Check:

- Tunnel status
- Tunnel client logs
- Local application status
- Local application port
- Tunnel target configuration

## Check the local application

Confirm that the application is listening on the expected port.

```text
http://localhost:<port>
```

The tunnel target must match the application port.

## Check tunnel credentials

Treat tunnel credentials as secrets.

Verify the token and tunnel configuration. If credentials were exposed, rotate or revoke them as appropriate.

Never commit tunnel tokens to Git.

## Check tunnel logs

Look for:

- Connection failures
- Authentication failures
- Connection resets
- Target connection failures
- Forwarding errors

## Tunnel connects but requests fail

Check:

1. Local application logs.
2. Local route.
3. HTTP method.
4. Request handling.
5. Payload processing.

A connected tunnel can still forward a request that the local application rejects.

## Localhost and Docker

Inside a container, `localhost` refers to that container.

It does not automatically refer to your host machine or another container.

If the tunnel client and application run in different containers, configure networking and the target address accordingly.

## Provider cannot reach HookTrace

Check:

- Public endpoint
- DNS
- HTTPS
- Firewall
- Reverse proxy
- Provider delivery logs

The provider must be able to reach the public HookTrace endpoint.

## Tunnel stopped after restart

Check:

- Tunnel client restarted.
- Tunnel configuration is unchanged.
- Credentials are valid.
- Local application is running.
- Expected port is available.
- HookTrace is healthy.

Reconnect the tunnel client when necessary.

## Next steps

- [Common Issues](./common-issues.md)
- [Deliveries](./deliveries.md)
- [Deployment](./deployment.md)
- [Concepts: Tunnels](../concepts/tunnels.md)
