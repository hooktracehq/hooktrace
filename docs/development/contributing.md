# Contributing

Contributions to HookTrace are welcome.

Before contributing, familiarize yourself with the project structure, local development workflow, and existing documentation.

## Before you start

Read:

- [Local Development](./local-development.md)
- [Project Structure](./project-structure.md)
- [Testing](./testing.md)

For broader project context, also read the repository README.

## Get the repository

Fork the repository on GitHub and clone your fork:

```bash
git clone https://github.com/hooktracehq/hooktrace.git
cd hooktrace
```

If you use a fork, configure the appropriate Git remotes for your workflow.

## Create a branch

Create a focused branch for your change:

```bash
git checkout -b fix/webhook-delivery
```

Use a descriptive branch name that reflects the work.

## Set up the environment

Create the local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Start the required services:

```bash
docker compose up -d --build
```

Run the web application when frontend work is required:

```bash
cd web
npm install
npm run dev
```

## Make focused changes

Keep pull requests focused on a clear problem or feature.

Avoid mixing unrelated changes into the same pull request.

When modifying an existing subsystem:

1. Read the relevant implementation.
2. Understand the current behavior.
3. Make the smallest appropriate change.
4. Test the affected behavior.
5. Update documentation when necessary.

## Backend changes

Backend changes generally live under:

```text
services/api/
```

or the relevant backend service directory.

After backend changes, rebuild and test the affected service:

```bash
docker compose up -d --build
```

Then inspect logs when necessary:

```bash
docker compose logs api
docker compose logs worker
```

## Frontend changes

Frontend changes live under:

```text
web/
```

Run the development server:

```bash
cd web
npm run dev
```

Before submitting frontend changes, also verify the production build:

```bash
npm run build
```

## Documentation changes

Documentation lives under:

```text
docs/
```

Keep documentation:

- Practical
- Clear
- Consistent with the implementation
- Free of secrets
- Linked to related pages

When behavior changes, update the relevant documentation in the same change when practical.

## Testing

Run the tests and validation relevant to your change.

At minimum, verify the affected feature manually when appropriate.

For webhook changes, test the lifecycle:

```text
Receive
  ↓
Record Event
  ↓
Deliver
  ↓
Retry if needed
  ↓
Replay if needed
```

See [Testing](./testing.md).

## Check configuration changes

If you modify Docker or environment configuration:

```bash
docker compose config
```

Also inspect the diff carefully for accidentally exposed credentials.

## Review your diff

Before committing:

```bash
git status
git diff
```

Look for:

- Unintended files
- Debug code
- Generated files
- Credentials
- Environment secrets
- Unrelated changes

## Commit changes

Use a clear commit message describing the change.

For example:

```bash
git add .
git commit -m "fix webhook delivery retry handling"
```

Avoid committing `.env` files or credentials.

## Pull request

Push your branch:

```bash
git push origin fix/webhook-delivery
```

Then open a pull request against the project's default branch.

The pull request description should explain:

- What changed
- Why it changed
- How it was tested
- Any configuration changes
- Any documentation changes
- Any known limitations

## Review process

Keep pull requests easy to review.

A good pull request should have:

- A focused scope
- A clear description
- Relevant tests
- Updated documentation when needed
- No secrets
- No unrelated formatting changes

Reviewers may request changes before the pull request is merged.

## Security issues

Do not publicly disclose sensitive security vulnerabilities through a normal issue if doing so would expose an exploitable weakness.

Use the project's documented security reporting process when one is available.

Never include credentials, tokens, private webhook payloads, or other sensitive data in public issues or pull requests.

## Updating documentation

When adding or changing functionality, ask:

- Does the README need an update?
- Does the Concepts documentation need an update?
- Does the API documentation need an update?
- Does the self-hosting documentation need an update?
- Does the troubleshooting documentation need an update?
- Does an integration guide need an update?

Documentation is part of the feature.

## Keep the repository clean

Do not commit:

```text
.env
.env.local
node_modules/
build output
local database data
private credentials
temporary debugging files
```

Follow the repository's `.gitignore` configuration.

## Next steps

- [Local Development](./local-development.md)
- [Project Structure](./project-structure.md)
- [Testing](./testing.md)
- [Troubleshooting](../troubleshooting/common-issues.md)
