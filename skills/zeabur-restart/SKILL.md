---
name: zeabur-restart
description: Use when restarting Zeabur service. Use when you see error --env-id is required.
---

# Zeabur Service Restart

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method.

## Restart Requires env-id

```bash
# ❌ FAILS
npx zeabur@latest service restart --name live -y
# ERROR: --env-id is required

# ✅ CORRECT
npx zeabur@latest service restart --id <service-id> --env-id <env-id> -y
```

## Extract env-id from Logs

```bash
npx zeabur@latest deployment log --service-id <id> -i=false 2>/dev/null | \
  grep -o "environment-[a-f0-9]*" | head -1
# Returns: environment-696f996ecc2bf23f5a3d7aaa
# Use: 696f996ecc2bf23f5a3d7aaa as env-id
```

## Full Workflow

```bash
# Get env-id
ENV_ID=$(npx zeabur@latest deployment log --service-id <service-id> -i=false 2>/dev/null | grep -o "environment-[a-f0-9]*" | head -1 | cut -d'-' -f2)

# Restart
npx zeabur@latest service restart --id <service-id> --env-id $ENV_ID -y
```
