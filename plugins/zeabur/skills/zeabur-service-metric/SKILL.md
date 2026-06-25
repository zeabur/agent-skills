---
name: zeabur-service-metric
description: Use when diagnosing service performance issues. Use when user says "service is slow", "high CPU", "out of memory", "check resource usage", "monitor service", or "why is my service lagging".
---

# Zeabur Service Metrics

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Check Metrics

```bash
# CPU usage
npx zeabur@latest service metric CPU --id <service-id> -i=false

# Memory usage
npx zeabur@latest service metric MEMORY --id <service-id> -i=false

# Network I/O
npx zeabur@latest service metric NETWORK --id <service-id> -i=false
```

Use `--hour <N>` to change the time window (default: 2 hours):

```bash
npx zeabur@latest service metric CPU --id <service-id> --hour 24 -i=false
```

## Diagnostic Workflow

When a user reports a slow or unresponsive service, **check metrics before restarting**:

```bash
# 1. Get service ID (use the `zeabur-service-list` skill)
npx zeabur@latest service list --project-id <project-id> -i=false

# 2. Check CPU — is the service compute-bound?
npx zeabur@latest service metric CPU --id <service-id> -i=false

# 3. Check memory — is the service running out of RAM?
npx zeabur@latest service metric MEMORY --id <service-id> -i=false

# 4. Check network — is there unusual traffic?
npx zeabur@latest service metric NETWORK --id <service-id> -i=false

# 5. Check logs for errors (use the `zeabur-deployment-logs` skill for details)
npx zeabur@latest deployment log --id <service-id> -i=false
```

**Then decide the action based on evidence:**

| Symptom | Likely cause | Action |
|---------|-------------|--------|
| CPU consistently near 100% | Compute-bound workload | Upgrade plan or optimize code |
| Memory climbing until OOM | Memory leak or undersized plan | Restart with `zeabur-restart` skill (temporary) + fix leak |
| Network spikes | Traffic surge or external API issues | Check logs for request patterns |
| All metrics normal | Application-level bug | Check deployment logs |

