---
name: zeabur-startup-order
description: Use when service fails with Connection refused to database or redis. Use when API crashes because DB not ready.
---

# Zeabur Startup Order Issues

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Symptom

```
Connection refused :5432
connection to server at "X" failed
OperationalError: connection failed
```

## Cause

Service starts before dependency (DB/Redis) is ready. `dependencies` only ensures container start order, NOT that the service is accepting connections.

## Fix (Recommended): healthCheck on dependency services

Add `healthCheck` to database/Redis services so Zeabur waits until the port is accepting connections before starting dependent services — no need to modify the app's command.

Edit the template YAML (use the `zeabur-template` skill for YAML reference):

```yaml
- name: postgresql
  spec:
    ports:
      - id: database
        port: 5432
        type: TCP
    healthCheck:
      type: TCP
      port: database    # references the port ID above
```

```yaml
- name: redis
  spec:
    ports:
      - id: database
        port: 6379
        type: TCP
    healthCheck:
      type: TCP
      port: database
```

## Fix (Alternative): Wait loop in command

If you can't modify the template (use the `zeabur-template` skill), add wait logic to the app's command (command MUST be inside `source`):

```yaml
spec:
  source:
    image: myapp:latest
    command:
      - /bin/sh
      - -c
      - "until nc -z postgres 5432; do sleep 1; done && node server.js"
```

## Quick Fix

If DB is now ready, just restart the failed service:
```bash
npx zeabur@latest service restart --id <service-id> -y -i=false
```

If the issue is specifically about database migration waiting loops rather than startup order, use the `zeabur-migration` skill.
