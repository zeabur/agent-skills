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

## Behavior to be aware of

- **Deletion is async.** A successful `service delete` schedules the removal — the service typically continues to appear in `service list` for a while as `Status=SUSPENDED` until eventual consistency clears it. Don't panic if the list still shows it right after.
- **Retrying a delete errors out.** If you call `service delete` a second time on a service whose first delete is already scheduled, the CLI returns:

  ```
  ERROR  delete service failed: Message: Resource already exists, ...
         description:service deletion already scheduled or service not found
  ```

  This means the first delete worked. Treat this error as "already done", not as a failure.
- **Confirming actual removal.** If you need to know whether a service is gone, query its status with `service get --id <id>` — once removed, the call returns "service not found". The `service list` output may lag behind by minutes.

To delete an entire project instead, use the `zeabur-project-delete` skill.
