---
name: zeabur-variables
description: Use for ALL Zeabur environment variable operations — create, list, update, delete, or troubleshoot. Use when user says "set env var", "add variable", "create variable", "update variable", "delete variable", "change env var", or "why is my variable empty". Also use when variables are empty or SERVICE_NOT_FOUND errors.
---

# Zeabur Variables Management

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.
>
> **Do not guess CLI syntax.** Only `create`, `update`, `delete`, `env`, and `list` are valid subcommands. Subcommands like `set` or `add` do not exist and will silently fail with no error output.

## Known Issues

1. **Use `--id` not `--name`** — name lookup is unreliable
2. **`${VAR}` gets empty** — shell expands before CLI receives; use single quotes
3. **`variable env` replaces ALL variables** — it overwrites the entire variable set with the .env file contents; existing variables not in the file will be removed

## Create Variables

Creates new variables. **Errors if a key already exists** — use `update` to change existing keys.

```bash
# Always use service ID — use the `zeabur-service-list` skill to get it
npx zeabur@latest variable create --id <service-id> \
  -k "KEY1=value1" \
  -k "KEY2=value2" \
  -y -i=false
```

## Update Variables

Updates only the specified keys. **Does NOT clear other variables.**

```bash
npx zeabur@latest variable update --id <service-id> \
  -k "KEY1=new_value1" \
  -k "KEY2=new_value2" \
  -y -i=false
```

## Delete Variables

Deletes only the specified keys.

```bash
npx zeabur@latest variable delete --id <service-id> \
  --delete-keys "KEY1" \
  --delete-keys "KEY2" \
  -y -i=false
```

## List Variables

```bash
npx zeabur@latest variable list --id <service-id> -i=false
```

## Load from .env File

> **Warning:** This **replaces ALL variables** on the service with the contents of the .env file. Existing variables not in the file will be removed.

```bash
npx zeabur@latest variable env --id <service-id> -f .env
```

After running `env`, you must restart the service manually to apply changes.

## Variable References

> **Status (verified 2026-04):** Single-quoted `${VAR}` references via `update -k` DO get stored and DO resolve at injection time — no longer requiring the dashboard. Earlier reports of total breakage tracked in [zeabur/cli#201](https://github.com/zeabur/cli/issues/201) appear to be fixed for the common case. The Cobra parser can still mangle exotic values (commas inside the value, multiple `=` signs in a complex URL) — when in doubt, verify with `variable list` after the update and fall back to the dashboard if the stored value looks wrong.

```bash
# WRONG — double quotes let the shell expand ${VAR} to empty before the CLI sees it
npx zeabur@latest variable update --id <service-id> -k "REDIS_URL=${REDIS_URI_INTERNAL}" -y -i=false

# CORRECT — single quotes preserve ${VAR} so Zeabur resolves it at injection time
npx zeabur@latest variable update --id <service-id> \
  -k 'DATABASE_URL=postgresql+psycopg://${POSTGRES_USERNAME}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE}' \
  -k 'REDIS_URL=${REDIS_CONNECTION_STRING}' \
  -y -i=false

# After updating, verify the stored value with variable list, then exec into the container
# to confirm it resolved correctly: `service exec --id <id> -- env | grep DATABASE_URL`
```

Cross-service references work in a flat namespace — all exposed variables from other services in the project are merged directly, no service prefix needed (e.g. `${POSTGRES_HOST}` resolves regardless of which service exposes it).

## zbpack build-time configuration via env vars

For services that build from source, zbpack reads its config from BOTH `zbpack.json` AND service env vars (env vars take precedence). The most useful one for monorepo deploys:

```bash
# Tell zbpack to use a specific Dockerfile path (relative to upload tarball root)
npx zeabur@latest variable update --id <service-id> \
  -k 'ZBPACK_DOCKERFILE_PATH=infra/zeabur/api.Dockerfile' -y -i=false
```

The naming rule is `ZBPACK_<SCREAMING_SNAKE_CASE>` of the underlying config key — e.g. zbpack key `dockerfile.path` becomes env var `ZBPACK_DOCKERFILE_PATH`. This is preferable to swapping a root `zbpack.json` between deploys when the project has multiple services with different Dockerfiles.

## Quick Reference

| Need | Command | Behavior |
|------|---------|----------|
| Add new vars | `npx zeabur@latest variable create --id <service-id> -k "K=V" -y -i=false` | Errors if key exists |
| Change existing vars | `npx zeabur@latest variable update --id <service-id> -k "K=V" -y -i=false` | Only updates specified keys |
| Remove specific vars | `npx zeabur@latest variable delete --id <service-id> --delete-keys "K" -y -i=false` | Only removes specified keys |
| Overwrite all vars from file | `npx zeabur@latest variable env --id <service-id> -f .env` | **Replaces entire variable set** |
| View vars | `npx zeabur@latest variable list --id <service-id> -i=false` | Read-only |

