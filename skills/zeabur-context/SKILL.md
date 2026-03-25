---
name: zeabur-context
description: Use when setting default project/environment/service to avoid repeating --project-id and --id flags. Use when user says "set default project", "use this project", "switch project", "set context", or "default environment".
---

# Zeabur Context Management

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Set Context

```bash
# Set default project
npx zeabur@latest context set project --id <project-id> -i=false

# Set default environment
npx zeabur@latest context set env --id <env-id> -i=false

# Set default service
npx zeabur@latest context set service --id <service-id> -i=false
```

Supports `--name` as alternative to `--id`. Abbreviations also work: `proj`, `env`, `svc`.

## Get Context

```bash
npx zeabur@latest context get -i=false
```

## Clear Context

```bash
npx zeabur@latest context clear -i=false
```

## Workflow

```bash
# 1. List projects and pick one
npx zeabur@latest project list -i=false

# 2. Set it as default
npx zeabur@latest context set project --id <project-id> -i=false

# 3. Now all commands use this project automatically
npx zeabur@latest service list -i=false
npx zeabur@latest variable list --id <service-id> -i=false
```

> **Tip:** Set context once, then skip `--project-id` on every subsequent command in the session.

## See Also

- `zeabur-project-create` — create a project to set as context
- `zeabur-service-list` — list services (simplified after setting context)
