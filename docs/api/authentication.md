# Authentication

HookTrace uses JWT-based authentication for API management operations.

Authentication is available through local email/password accounts and,
when configured, Google or GitHub OAuth.

## Access tokens

Successful local registration and login return an `access_token`.

Example:

``` json
{
  "success": true,
  "access_token": "<jwt>"
}
```

For authenticated API requests, send the token with the `Authorization`
header:

``` http
Authorization: Bearer <jwt>
```

HookTrace also sets an `access_token` HTTP cookie. The API can use that
cookie as a fallback when the Authorization header is not present.

## Register

``` http
POST /auth/register
Content-Type: application/json
```

Request:

``` json
{
  "email": "you@example.com",
  "password": "your-password"
}
```

A successful registration creates a local user and returns a JWT access
token.

## Login

``` http
POST /auth/login
Content-Type: application/json
```

Request:

``` json
{
  "email": "you@example.com",
  "password": "your-password"
}
```

Successful authentication returns an access token and sets the
authentication cookie.

## Logout

``` http
POST /auth/logout
```

Logout clears the `access_token` cookie.

## Current user

``` http
GET /auth/me
Authorization: Bearer <jwt>
```

Example response:

``` json
{
  "id": "user-id",
  "email": "you@example.com",
  "avatar_url": null,
  "provider": "local"
}
```

## OAuth

HookTrace supports Google and GitHub OAuth when their credentials are
configured.

Start authentication with:

``` text
GET /auth/login/google
GET /auth/login/github
```

The OAuth callback endpoints are:

``` text
GET /auth/callback/google
GET /auth/callback/github
```

After successful OAuth authentication, HookTrace creates or finds the
corresponding user and redirects to the configured frontend dashboard.

## JWT behavior

The current implementation signs JWTs with `HS256` and gives them a
24-hour expiry.

The signing secret is configured through:

``` text
JWT_SECRET
```

Do not use the development fallback secret in production. Set a strong,
private `JWT_SECRET` in the deployment environment.

## Browser and cookie security

The authentication cookie is HTTP-only and uses `SameSite=Lax`. In
production, HookTrace enables the cookie's `Secure` attribute based on
the `ENV=production` setting.

For production deployments, serve the application over HTTPS and
configure the frontend/API origins correctly.

## Authentication errors

Typical authentication failures include:

``` text
401 Not authenticated
401 Malformed token
401 Invalid or expired token
401 User not found
```

When troubleshooting authenticated requests, first verify that the JWT
is present, valid, unexpired, and signed with the same `JWT_SECRET` used
by the API.
