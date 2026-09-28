# Tunnels

A **tunnel** allows webhook traffic received by HookTrace to reach a local development application.

This is useful when your application is running on your own machine and does not have a publicly accessible URL.

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

## Why use a tunnel?

Webhook providers typically need a URL they can reach over the internet.

During local development, your application may instead be running at an address such as:

```text
http://localhost:3000
```

A webhook provider cannot normally send requests directly to that local address.

A HookTrace tunnel provides a connection between the publicly reachable HookTrace infrastructure and your local application.

## Tunnel workflow

A typical development workflow looks like this:

```text
1. Start your local application
        │
        ▼
2. Create a HookTrace tunnel
        │
        ▼
3. Start the HookTrace tunnel client
        │
        ▼
4. Configure your webhook provider
        │
        ▼
5. Provider sends webhook to HookTrace
        │
        ▼
6. HookTrace forwards traffic through the tunnel
        │
        ▼
7. Local application receives webhook
```

## Tunnel components

A tunnel involves two sides:

### HookTrace

HookTrace provides the publicly reachable side of the connection.

```text
Webhook Provider
       │
       ▼
   HookTrace
```

### Local tunnel client

The tunnel client runs on your development machine and connects your local application to HookTrace.

```text
HookTrace
    │
    ▼
Tunnel Client
    │
    ▼
localhost
```

Together they create the connection between the external webhook provider and your local application.

## Creating a tunnel

HookTrace provides tunnel management through its API.

A tunnel can be created and managed through the HookTrace dashboard or API.

Tunnel operations include:

* List tunnels
* Create a tunnel
* Retrieve a tunnel
* Update a tunnel
* Delete a tunnel
* Inspect tunnel logs
* Inspect tunnel statistics

## Tunnel credentials

A tunnel is associated with connection information that the tunnel client uses when connecting to HookTrace.

The HookTrace dashboard provides the information required to start the tunnel client.

Keep tunnel credentials private.

Do not commit tunnel tokens or other credentials to your repository.

## Starting a local tunnel

After creating a tunnel, use the tunnel client configuration provided by HookTrace to connect your local environment.

The general flow is:

```text
Create Tunnel
     │
     ▼
Get Tunnel Credentials
     │
     ▼
Start Tunnel Client
     │
     ▼
Connect Local Application
```

The exact tunnel client command depends on the current HookTrace tunnel tooling.

## Local webhook development

Once the tunnel is connected, a webhook provider can send requests through HookTrace to your local application.

For example:

```text
Stripe
  │
  │ webhook
  ▼
HookTrace
  │
  │ tunnel
  ▼
localhost
  │
  ▼
Your webhook handler
```

This allows you to develop and debug webhook integrations without deploying your application for every change.

## Tunnel logs

HookTrace exposes tunnel logs so you can investigate tunnel activity.

Logs can help answer questions such as:

* Is the tunnel connected?
* Is traffic reaching the tunnel?
* Is the local connection responding?
* Are requests being forwarded?

When debugging a tunnel, inspect the tunnel status and logs before troubleshooting the webhook provider itself.

## Tunnel statistics

HookTrace also exposes tunnel statistics.

Statistics provide visibility into tunnel activity and can help determine whether traffic is successfully moving through the connection.

## Tunnel lifecycle

A tunnel can move through a lifecycle such as:

```text
Create
  │
  ▼
Connect
  │
  ▼
Active
  │
  ├── Traffic
  │
  └── Disconnect
        │
        ▼
      Delete
```

The tunnel can be managed independently from the webhook routes and events that use it.

## Tunnels and routes

Routes and tunnels solve different problems.

A **route** defines the HookTrace webhook entry point and delivery configuration.

A **tunnel** provides a connection from HookTrace to a local development environment.

```text
Webhook Provider
       │
       ▼
     Route
       │
       ▼
     Event
       │
       ▼
    Tunnel
       │
       ▼
Local Application
```

This makes tunnels particularly useful when developing and testing webhook integrations locally.

## Security

Treat tunnel credentials as secrets.

Do not:

* Commit tunnel tokens to Git
* Share tokens publicly
* Include credentials in screenshots
* Store credentials in frontend source code

If a tunnel credential is exposed, revoke or rotate it according to the tunnel management capabilities of your HookTrace installation.

## Troubleshooting

If your local application is not receiving webhook traffic, check the connection in this order:

1. Confirm your local application is running.
2. Confirm the tunnel exists.
3. Confirm the tunnel client is running.
4. Check the tunnel status.
5. Check tunnel logs.
6. Confirm the webhook provider is sending requests.
7. Inspect the corresponding HookTrace event.
8. Inspect the delivery or forwarding result.

This separates tunnel connectivity problems from webhook delivery problems.

## Next steps

* [Routes](./routes.md) — configure webhook entry points
* [Events](./events.md) — inspect received webhook events
* [Integrations](./integrations.md) — connect webhook providers
* [Self-hosting](../self-hosting/overview.md) — configure your HookTrace installation
