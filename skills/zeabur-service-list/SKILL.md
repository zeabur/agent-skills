---
name: zeabur-service-list
description: Use when needing service IDs for other commands. Use when checking what services exist in a project. Use when user says "list services", "what's running", or "show my services".
---

# Zeabur Service List

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Get Service IDs

```bash
npx zeabur@latest service list --project-id <project-id> -i=false
```

## Output Example

```
     ID              NAME        TYPE          CREATEDAT
-----------------+-------------+-------------+------------------
 696faeb192eadb...  postgresql   PREBUILT_V2   18 minute(s) ago
 696faeb192eadb...  api          PREBUILT_V2   18 minute(s) ago
 696faeb192eadb...  web          PREBUILT_V2   18 minute(s) ago
```

## Common Use Cases

| Need | Command |
|------|---------|
| Check variables | `npx zeabur@latest variable list --id <service-id> -i=false` (use the `zeabur-variables` skill) |
| Set variables | `npx zeabur@latest variable create --id <service-id> --key "KEY=value" -y -i=false` (use the `zeabur-variables` skill) |
| View logs | `npx zeabur@latest deployment log --service-id <id> -t runtime` (use the `zeabur-deployment-logs` skill) |
| Restart service | `npx zeabur@latest service restart --id <id> -y` (use the `zeabur-restart` skill) |

**Always use `--id` not `--name`** — name lookup is unreliable.

> **Setting or updating variables?** Load the `zeabur-variables` skill first for full syntax, known issues, and shell escaping rules. Do not guess CLI syntax — subcommands like `set` do not exist and will silently fail.

