---
name: zeabur-service-delete
description: Use when deleting a Zeabur service. Use when user says "delete service", "remove service", or "tear down service". Always confirm service name and ID with the user before deleting.
---

# Zeabur Service Delete

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

Deleting a service removes its deployments, domains, and data. This is irreversible — always confirm with the user before proceeding.

## Safety First

Before deleting:

1. **List services** so the user can verify the target
2. **Show the service name and ID** and ask for explicit confirmation
3. Only then run the delete command

## Delete by ID

```bash
npx zeabur@latest service delete -i=false --id <service-id> -y
```

## Flags

| Flag | Description |
|------|-------------|
| `--id` | Service ID to delete |
| `-y, --yes` | Skip confirmation prompt |
| `-i=false` | Non-interactive mode (always use this) |

## Workflow

```bash
# 1. List services to find the target (use the `zeabur-service-list` skill)
npx zeabur@latest service list --project-id <project-id> -i=false --json

# 2. Confirm with user: "Delete <service-name> (<service-id>)?"

# 3. Delete
npx zeabur@latest service delete -i=false --id <service-id> -y
```

To delete an entire project instead, use the `zeabur-project-delete` skill.
