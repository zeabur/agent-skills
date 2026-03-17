---
name: zeabur-service-expose
description: Use when temporarily exposing a Zeabur service for testing. Use when user says "expose service", "temporary URL", "test my service publicly", or "quick access to service". Useful for services without a domain that need brief external access.
---

# Zeabur Service Expose

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

Temporarily expose a service with a public URL. The exposure lasts 3600 seconds (1 hour) by default. Useful for quick testing, webhook callbacks, or sharing a preview without setting up a domain.

## Usage

```bash
npx zeabur@latest service expose --id <service-id> --env-id <env-id> -i=false
```

## Flags

| Flag | Description |
|------|-------------|
| `--id` | Service ID |
| `-n, --name` | Service name (prefer `--id`) |
| `--env-id` | Environment ID (required in non-interactive mode) |

## Getting the Environment ID

The expose command requires `--env-id`. Get it from service details:

```bash
npx zeabur@latest service get --id <service-id> -i=false --json
```

## When to Use

- Testing webhook integrations that need a public callback URL
- Sharing a quick preview with teammates
- Debugging connectivity from external services

For permanent public access, set up a domain instead (`zeabur-domain-url`).

## See Also

- `zeabur-service-list` — find service IDs
- `zeabur-domain-url` — set up permanent domains
