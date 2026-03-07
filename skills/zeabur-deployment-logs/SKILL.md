---
name: zeabur-deployment-logs
description: Use when viewing service logs fails with env-id required error. Use when checking runtime or build logs.
---

# Zeabur Deployment Logs

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method.

## Important: Always Use --env-id

`deployment log` often requires `--env-id` even for single-environment projects (unlike `variable list` which auto-selects). **Always get the env-id first and pass it explicitly.**

### Symptom

```
ERROR: when deployment-id is not specified, env-id is required
ERROR: environment is required
```

## Workflow

```bash
# 1. Get service ID
npx zeabur@latest service list --project-id <project-id> -i=false

# 2. Get env-id (see methods below)

# 3. View logs with env-id
npx zeabur@latest deployment log --service-id <service-id> --env-id <env-id> -t runtime -i=false 2>&1 | tail -50
```

### Get env-id

```bash
# Method 1: From variable list output
npx zeabur@latest variable list --id <service-id> -i=false
# Shows: "Only one environment... select <production> automatically"

# Method 2: Extract from error message
ENV_ID=$(npx zeabur@latest deployment log --service-id <service-id> 2>&1 | grep -o "environment-[a-f0-9]*" | head -1 | cut -d'-' -f2)
```

### View logs with env-id

```bash
# Runtime logs
npx zeabur@latest deployment log \
  --service-id <id> \
  --env-id <env-id> \
  -t runtime \
  -i=false

# Build logs
npx zeabur@latest deployment log \
  --service-id <id> \
  --env-id <env-id> \
  -t build \
  -i=false

# Watch logs (live tail)
npx zeabur@latest deployment log \
  --service-id <id> \
  --env-id <env-id> \
  -w \
  -i=false
```

## Tips

| Tip | Details |
|-----|---------|
| Use `tail -50` | Logs can be verbose, pipe to tail for recent entries |
| Use `grep` to filter | `... 2>&1 \| grep -i "error\|started\|ready"` |
| Note singular | `deployment log` not `deployment logs` |
| Check service status | Look for `SERVER STARTED`, `Ready`, `listening` |
