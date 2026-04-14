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

> **Warning:** The CLI `-k` flag uses Cobra's `StringToStringVar` parser which cannot reliably handle values containing `${}`, even with single quotes. The value may be truncated or emptied. See [zeabur/cli#201](https://github.com/zeabur/cli/issues/201).

```bash
# WRONG — shell expands ${VAR} to empty
npx zeabur@latest variable create --id <service-id> -k "REDIS_URL=${REDIS_URI_INTERNAL}" -y -i=false

# STILL UNRELIABLE — single quotes prevent shell expansion but Cobra's CSV parser may still mangle the value
npx zeabur@latest variable create --id <service-id> -k 'REDIS_URL=${REDIS_URI_INTERNAL}' -y -i=false

# RECOMMENDED — set variable references in Zeabur Dashboard
# Or use GraphQL API with updateEnvironmentVariable(data: Map!) mutation
```

For cross-service variable references like `${POSTGRES_CONNECTION_STRING}` (Zeabur uses a flat namespace — all exposed variables from other services are merged directly, no service prefix needed), **always use the Zeabur Dashboard** until the CLI bug is fixed.

## Quick Reference

| Need | Command | Behavior |
|------|---------|----------|
| Add new vars | `npx zeabur@latest variable create --id <service-id> -k "K=V" -y -i=false` | Errors if key exists |
| Change existing vars | `npx zeabur@latest variable update --id <service-id> -k "K=V" -y -i=false` | Only updates specified keys |
| Remove specific vars | `npx zeabur@latest variable delete --id <service-id> --delete-keys "K" -y -i=false` | Only removes specified keys |
| Overwrite all vars from file | `npx zeabur@latest variable env --id <service-id> -f .env` | **Replaces entire variable set** |
| View vars | `npx zeabur@latest variable list --id <service-id> -i=false` | Read-only |

