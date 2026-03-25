---
name: zeabur-service-suspend
description: Use when pausing a service to save costs without deleting it. Use when user says "suspend service", "pause service", "stop billing", "save costs", "temporarily stop service", or "resume service".
---

# Zeabur Service Suspend & Resume

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Suspend a Service

```bash
npx zeabur@latest service suspend --id <service-id> -y -i=false
```

The service stops running and stops incurring compute charges. Data volumes are preserved.

## Resume a Service

Restarting a suspended service resumes it:

```bash
npx zeabur@latest service restart --id <service-id> -y -i=false
```

## Workflow

```bash
# 1. Get service ID
npx zeabur@latest service list --project-id <project-id> -i=false

# 2. Suspend (stops billing)
npx zeabur@latest service suspend --id <service-id> -y -i=false

# 3. Later — resume when needed
npx zeabur@latest service restart --id <service-id> -y -i=false
```

## Suspend vs Delete

| Action | Billing | Data | Can recover? |
|--------|---------|------|-------------|
| **Suspend** | Stops compute charges | Volumes preserved | Yes — restart to resume |
| **Delete** | Stops all charges | Everything removed | No |

> **Tip:** Suspend staging/dev services when not in use. Delete only when you no longer need the service at all.

## See Also

- `zeabur-restart` — resume a suspended service
- `zeabur-service-delete` — permanently remove a service
- `zeabur-service-list` — get service IDs
