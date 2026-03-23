---
name: zeabur-variables
description: Use for ALL Zeabur environment variable operations — create, list, delete, or troubleshoot. Use when user says "set env var", "add variable", "create variable", "update variable", "delete variable", or "why is my variable empty". Also use when variables are empty or SERVICE_NOT_FOUND errors.
---

# Zeabur Variables Management

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

> **Do not guess CLI syntax.** Only `create`, `delete`, `env`, `list`, and `update` are valid subcommands. Subcommands like `set` or `add` do not exist and will silently fail with no error output.

## Known Issues

1. **Use `--id` not `--name`** - name lookup unreliable
2. **`${VAR}` gets empty** - shell expands before CLI receives
3. **`variable update` may clear all vars** - bug in CLI

## Create Variables

```bash
# Always use service ID (name lookup is unreliable)
npx zeabur@latest variable create --id <service-id> \
  --key "KEY1=value1" \
  --key "KEY2=value2" \
  -y -i=false
```

## Variable References

```bash
# WRONG - shell expands ${VAR} to empty
--key "REDIS_URL=${REDIS_URI_INTERNAL}"

# Use single quotes to prevent shell expansion
--key 'REDIS_URL=${REDIS_URI_INTERNAL}'

# Or set references in Zeabur Dashboard instead
```

## List Variables

```bash
npx zeabur@latest variable list --id <service-id> -i=false
```

**For `${VAR}` references → use single quotes or set via Zeabur Dashboard.**

## Delete Variables

```bash
npx zeabur@latest variable delete --id <service-id> --delete-keys "KEY_NAME" -y -i=false
```

## See Also

- `zeabur-service-list` — get service IDs needed for variable commands
- `zeabur-update-service` — update variables and restart in one workflow
