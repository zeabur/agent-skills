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
3. **`variable update` replaces ALL variables** — it overwrites the entire variable set with only the specified keys; all existing variables not included in the command will be **deleted**
4. **`variable env` replaces ALL variables** — it overwrites the entire variable set with the .env file contents; existing variables not in the file will be removed

## Create Variables

Creates new variables. **Errors if a key already exists** — to change an existing key, delete it first then create with the new value (see safe alternative under Update Variables).

```bash
npx zeabur@latest variable create --id <service-id> \
  -k "KEY1=value1" \
  -k "KEY2=value2" \
  -y -i=false
```

## Update Variables

> **⚠️ WARNING: `variable update` replaces the ENTIRE variable set** with only the keys you specify. All existing variables not included in the command will be **deleted**. To safely change a single variable without affecting others, use the Zeabur Dashboard or delete + recreate the specific key.

```bash
npx zeabur@latest variable update --id <service-id> \
  -k "KEY1=new_value1" \
  -k "KEY2=new_value2" \
  -y -i=false
```

**Safe alternative — delete then create the specific key:**

```bash
npx zeabur@latest variable delete --id <service-id> --delete-keys "KEY1" -y -i=false
npx zeabur@latest variable create --id <service-id> -k "KEY1=new_value1" -y -i=false
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

```bash
# WRONG — shell expands ${VAR} to empty
npx zeabur@latest variable create --id <service-id> -k "REDIS_URL=${REDIS_URI_INTERNAL}" -y -i=false

# CORRECT — single quotes prevent shell expansion
npx zeabur@latest variable create --id <service-id> -k 'REDIS_URL=${REDIS_URI_INTERNAL}' -y -i=false

# Or set references in Zeabur Dashboard instead
```

## Quick Reference

| Need | Command | Behavior |
|------|---------|----------|
| Add new vars | `npx zeabur@latest variable create --id <service-id> -k "K=V" -y -i=false` | Errors if key exists |
| Change existing vars | `npx zeabur@latest variable update --id <service-id> -k "K=V" -y -i=false` | **⚠️ Replaces ALL vars** — use delete+create instead |
| Remove specific vars | `npx zeabur@latest variable delete --id <service-id> --delete-keys "K" -y -i=false` | Only removes specified keys |
| Overwrite all vars from file | `npx zeabur@latest variable env --id <service-id> -f .env` | **Replaces entire variable set** |
| View vars | `npx zeabur@latest variable list --id <service-id> -i=false` | Read-only |

## See Also

- `zeabur-service-list` — get service IDs needed for variable commands
- `zeabur-update-service` — update variables and restart in one workflow
