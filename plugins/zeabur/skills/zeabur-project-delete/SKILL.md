---
name: zeabur-project-delete
description: Use when deleting a Zeabur project. Use when user says "delete project", "remove project", or "clean up project". Use when tearing down test or temporary projects. Always confirm project name and ID with the user before deleting.
---

# Zeabur Project Delete

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

Deleting a project removes all services, deployments, and data in it. This is irreversible — always confirm with the user before proceeding.

## Safety First

Before deleting:

1. **List projects** so the user can verify the target
2. **Show the project name and ID** and ask for explicit confirmation
3. Only then run the delete command

Never batch-delete more than one project without confirming each one.

## Delete by ID

```bash
npx zeabur@latest project delete -i=false --id <project-id> -y
```

## Delete by Name

```bash
npx zeabur@latest project delete -i=false -n "<project-name>" -y
```

## Find Project ID

```bash
# List all projects
npx zeabur@latest project list -i=false

# Filter by name (strip ANSI codes)
npx zeabur@latest project list -i=false 2>/dev/null | grep "<project-name>"
```

## Workflow

```bash
# 1. List projects to find the target
npx zeabur@latest project list -i=false

# 2. Check services with the `zeabur-service-list` skill, then confirm with user: "Delete <project-name> (<project-id>)?"

# 3. Delete
npx zeabur@latest project delete -i=false --id <project-id> -y
```

## Flags

| Flag | Description |
|------|-------------|
| `--id` | Project ID to delete |
| `-n, --name` | Project name to delete |
| `-y, --yes` | Skip confirmation prompt |
| `-i=false` | Non-interactive mode (always use this) |

