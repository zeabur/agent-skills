---
name: zeabur-deployment-logs
description: Use when viewing service runtime or build logs. Use when user says "show logs", "why did deploy fail", "check build output", or "debug runtime error".
---

# Zeabur Deployment Logs

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Workflow

```bash
# 1. Get service ID (use the `zeabur-service-list` skill)
npx zeabur@latest service list --project-id <project-id> -i=false

# 2. View runtime logs
npx zeabur@latest deployment log --service-id <service-id> -t runtime -i=false 2>&1 | tail -50
```

## Log Types

```bash
# Runtime logs (CLI auto-resolves the latest deployment if needed)
npx zeabur@latest deployment log --service-id <id> -t runtime -i=false

# Runtime logs for a specific deployment
npx zeabur@latest deployment log --service-id <id> --deployment-id <deployment-id> -t runtime -i=false

# Build logs (CLI auto-resolves the latest deployment if needed)
npx zeabur@latest deployment log --service-id <id> -t build -i=false

# Build logs for a specific deployment
npx zeabur@latest deployment log --deployment-id <deployment-id> -t build -i=false

# Watch logs (live tail)
npx zeabur@latest deployment log --service-id <id> -w -i=false
```

## DeploymentID Behavior

The CLI automatically resolves the latest deployment when `--deployment-id` is not provided:

| Scenario | What happens |
|----------|-------------|
| Git/Upload service, no `--deployment-id` | CLI auto-resolves latest deployment → logs returned |
| Pure image service (e.g. Docker image), runtime log | No deployment exists → falls back to prebuilt query → logs returned |
| Pure image service, build log | No deployment exists → returns error (image services have no build logs) |
| Explicit `--deployment-id` provided | Uses the provided ID directly, no auto-resolution |

Use `--deployment-id` when you need logs from a **specific** deployment (not the latest). List deployments with:

```bash
npx zeabur@latest deployment list --service-id <service-id> -i=false
```

## Tips

| Tip | Details |
|-----|---------|
| Use `tail -50` | Logs can be verbose, pipe to tail for recent entries |
| Use `grep` to filter | `... 2>&1 | grep -i "error\|started\|ready"` |
| Note singular | `deployment log` not `deployment logs` |
| Check service status | Look for `SERVER STARTED`, `Ready`, `listening` |

After diagnosing issues from logs, use the `zeabur-restart` skill to restart the service if needed.
