---
name: zeabur-update-service
description: Use when modifying service config without full redeploy. Use when updating env vars and restarting single service. Use when user says "change env var", "update config", "fix variable without redeploying", "upgrade service version", "update image tag", or "change service tag".
---

# Zeabur Update Service Without Redeploy

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Workflow

```bash
# 1. Get service ID (use the `zeabur-service-list` skill)
npx zeabur@latest service list --project-id <project-id> -i=false

# 2. Check current variables
npx zeabur@latest variable list --id <service-id> -i=false

# 3a. Add new variables (errors if key already exists)
npx zeabur@latest variable create --id <service-id> \
  --key "KEY1=value1" \
  --key "KEY2=value2" \
  -i=false -y

# 3b. Update existing variables (only updates specified keys)
npx zeabur@latest variable update --id <service-id> \
  --key "KEY1=new_value1" \
  -i=false -y

# 4. Restart service (use the `zeabur-restart` skill for details)
npx zeabur@latest service restart --id <service-id> -y -i=false
```

## Caveats

| Issue | Solution |
|-------|----------|
| `${VAR}` references | Set in Dashboard, not CLI (shell expands to empty) |

## Update Image Tag (Upgrade Service Version)

For prebuilt/marketplace services, update the image tag to upgrade to a newer version.

### Workflow

```bash
# 1. Get service ID (use the `zeabur-service-list` skill)
npx zeabur@latest service list --project-id <project-id> -i=false

# 2. Update tag (triggers redeploy automatically)
npx zeabur@latest service update tag --id <service-id> -t <new-tag> -y -i=false
```

### Flags

| Flag | Description |
|------|-------------|
| `--id` | Service ID (**required**, do not use `--name`) |
| `-t, --tag` | New image tag to deploy |
| `--env-id` | Environment ID (optional, resolved automatically) |
| `-y, --yes` | Skip confirmation |

> **Note:** Updating the tag triggers a new deployment. The service will restart with the updated image.

## When to Use

- Fix environment variable typos
- Add missing config
- Change ports, URLs, credentials
- Upgrade a prebuilt service to a newer version
- **No need to redeploy entire template**

