---
name: zeabur-update-service
description: Use when modifying service config without full redeploy. Use when updating env vars and restarting single service.
---

# Zeabur Update Service Without Redeploy

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method.

## Workflow

```bash
# 1. Get service ID
npx zeabur@latest service list --project-id <project-id> -i=false

# 2. Check current variables
npx zeabur@latest variable list --id <service-id> -i=false

# 3. Add/update variables
npx zeabur@latest variable create --id <service-id> \
  --key "KEY1=value1" \
  --key "KEY2=value2" \
  -i=false -y

# 4. Get env-id (from step 2 output or deployment list)
# Look for: "Only one environment... select <production>"

# 5. Restart service
npx zeabur@latest service restart --id <service-id> --env-id <env-id> -i=false -y
```

## Caveats

| Issue | Solution |
|-------|----------|
| `${VAR}` references | Set in Dashboard, not CLI (shell expands to empty) |
| `variable update` clears vars | Use `variable create` instead |
| Need env-id | Get from `variable list` output or Dashboard URL |

## When to Use

- Fix environment variable typos
- Add missing config
- Change ports, URLs, credentials
- **No need to redeploy entire template**
