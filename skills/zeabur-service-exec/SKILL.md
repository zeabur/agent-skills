---
name: zeabur-service-exec
description: Use when running commands inside a Zeabur service container. Use for one-off database operations like queries, data cleanup, or migrations (e.g. mongosh, psql, mysql, redis-cli). Use when user says "exec into container", "run command in service", "query database", "delete from database", "run mongo command", "run SQL", "check files in container", "debug inside service", or "shell into service". Use for container-level debugging like checking env vars, files, processes, or connectivity. NOT for deploying databases (use zeabur-template-deploy instead).
---

# Zeabur Service Exec

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

Run commands inside a running service container. Useful for debugging, inspecting files, checking env vars, testing connectivity, or running one-off database operations.

## Basic Usage

Commands and arguments go after `--`:

```bash
npx zeabur@latest service exec --id <service-id> -- <command> [args...]
```

## Database Operations

```bash
# MongoDB - query, update, delete data
npx zeabur@latest service exec --id <mongodb-service-id> -- mongosh --eval 'db.users.find({})'
npx zeabur@latest service exec --id <mongodb-service-id> -- mongosh --eval 'db.sessions.deleteMany({title: /test/i})'

# PostgreSQL - run SQL queries (PGPASSWORD is set automatically in Zeabur containers)
npx zeabur@latest service exec --id <pg-service-id> -- psql -U postgres -c 'SELECT * FROM users LIMIT 10;'

# MySQL - run SQL queries (use env var to avoid interactive password prompt)
npx zeabur@latest service exec --id <mysql-service-id> -- sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "SHOW DATABASES;"'

# Redis - run commands
npx zeabur@latest service exec --id <redis-service-id> -- redis-cli KEYS '*'
```

## Examples

```bash
# List files
npx zeabur@latest service exec --id <service-id> -- ls -la

# Check environment variables
npx zeabur@latest service exec --id <service-id> -- env

# Check a specific env var
npx zeabur@latest service exec --id <service-id> -- sh -c "echo \$DATABASE_URL"

# Test database connectivity
npx zeabur@latest service exec --id <service-id> -- sh -c "nc -zv postgres 5432"

# Check running processes
npx zeabur@latest service exec --id <service-id> -- ps aux

# Read a config file
npx zeabur@latest service exec --id <service-id> -- cat /app/config.json

# Check disk usage
npx zeabur@latest service exec --id <service-id> -- df -h
```

## Flags

| Flag | Description |
|------|-------------|
| `--id` | Service ID |
| `-n, --name` | Service name (prefer `--id`) |
| `--env-id` | Environment ID (if multiple environments) |

## Tips

- The `--` separator is required — everything after it is the command to run inside the container.
- For compound commands, wrap in `sh -c "..."`.
- Not all containers have a full shell — `sh` is more portable than `bash`.
- Use single quotes outside and double quotes inside when dealing with variable expansion: `sh -c "echo \$VAR"`.
- To find service IDs, use the `zeabur-service-list` skill. To check logs without exec, use the `zeabur-deployment-logs` skill. To manage env vars via CLI, use the `zeabur-variables` skill.
