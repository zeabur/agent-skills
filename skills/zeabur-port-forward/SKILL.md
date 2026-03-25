---
name: zeabur-port-forward
description: Use when user needs local access to a remote service (database, cache, internal API). Use when user says "connect to database locally", "port forward", "access service from my machine", "local database connection", or "expose port locally".
---

# Zeabur Port Forwarding

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Enable Port Forwarding

```bash
npx zeabur@latest service port-forward --id <service-id> --enable -i=false
```

## Disable Port Forwarding

```bash
npx zeabur@latest service port-forward --id <service-id> --disable -i=false
```

## Workflow

```bash
# 1. Get service ID (e.g., for a PostgreSQL service)
npx zeabur@latest service list --project-id <project-id> -i=false

# 2. Enable port forwarding
npx zeabur@latest service port-forward --id <service-id> --enable -i=false

# 3. Check network info for the forwarded hostname and port
npx zeabur@latest service network --id <service-id> -i=false

# 4. Connect locally using the provided hostname:port
# e.g., psql -h <hostname> -p <port> -U <user> <database>

# 5. Disable when done
npx zeabur@latest service port-forward --id <service-id> --disable -i=false
```

## When to Use

- Connect to a remote database (PostgreSQL, MySQL, Redis, MongoDB) from local machine
- Debug an internal service that has no public domain
- Run database migrations from a local script

> **Security:** Use port forwarding instead of adding a public domain to databases or internal services. Public domains expose services to the internet — port forwarding provides access without that risk.

## See Also

- `zeabur-service-list` — get service IDs needed for port forwarding
- `zeabur-domain-url` — for services that should be publicly accessible (not databases)
- `zeabur-port-mismatch` — troubleshoot port configuration issues
