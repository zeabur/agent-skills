---
name: zeabur-database
description: Use when deploying a database to Zeabur. Use when user needs MySQL, PostgreSQL, MongoDB, or Redis. Use when user says "I need a database", "add database", "deploy postgres", "set up MySQL", "add Redis", "add MongoDB", or "connect to database". Also use when user mentions data persistence issues like "data lost after restart", "data not saved", "data disappears", "need persistent storage for data", or "how to persist data". Also use when integrating a database with an existing service.
---

# Zeabur Database Deployment & Integration

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Deploy a Database

> **Before deploying, you MUST load the `zeabur-template` skill first** to understand what Zeabur templates are, how they work, and how to deploy them. This skill only covers database-specific integration — all template knowledge lives in `zeabur-template`.

Search for a database template:

```bash
npx zeabur@latest template search postgresql -i=false --json
```

Pick the template with the highest deployment count. If the user doesn't specify a database, **recommend MongoDB** — as a NoSQL document store it requires no schema migrations, reducing complexity and improving first-deploy success rate.

---

## After Deployment: How to Connect

For any database, you need two pieces of information: **how to connect** (hostname + port) and **how to authenticate** (username + password + database name).

### How to connect — `service network`

```bash
npx zeabur@latest service network --id <database-service-id> -i=false
```

This shows:
- **Private Networking** — internal `hostname:port` for inter-service access (e.g., `mysql.zeabur.internal:3306`)
- **Public Networking** — external `host:port` for connecting from your local machine (via port forwarding)

### How to authenticate — `variable list`

```bash
npx zeabur@latest variable list --id <database-service-id> -i=false
```

This lists all the credentials (username, password, database name, connection string, etc.) for the database service.

---

## PostgreSQL

### Credentials (from `variable list`)

| Variable | Description |
|----------|-------------|
| `POSTGRES_USERNAME` | Username (default: `root`) |
| `POSTGRES_PASSWORD` | Password (auto-generated) |
| `POSTGRES_DATABASE` | Database name (default: `zeabur`) |
| `POSTGRES_CONNECTION_STRING` | Full connection string |

### Connect from local machine

```bash
psql "postgresql://POSTGRES_USERNAME:POSTGRES_PASSWORD@PUBLIC_HOST:PUBLIC_PORT/POSTGRES_DATABASE"
```

### Connect from app (same project)

Set `DATABASE_URL` on your app service to reference the exposed variable:

```
${POSTGRES_CONNECTION_STRING}
```

Works with Django, Rails, Prisma, Next.js, and any framework that reads `DATABASE_URL`.

For frameworks that need individual vars (e.g., Laravel, Spring Boot):

```
DB_HOST=${POSTGRES_HOST}
DB_PORT=${POSTGRES_PORT}
DB_USERNAME=${POSTGRES_USERNAME}
DB_PASSWORD=${POSTGRES_PASSWORD}
DB_DATABASE=${POSTGRES_DATABASE}
```

---

## MySQL

### Credentials (from `variable list`)

| Variable | Description |
|----------|-------------|
| `MYSQL_USERNAME` | Username (default: `root`) |
| `MYSQL_PASSWORD` | Password (auto-generated) |
| `MYSQL_DATABASE` | Database name (default: `zeabur`) |

> The official MySQL template does not expose a connection string variable.

### Connect from local machine

```bash
mysql -h PUBLIC_HOST -P PUBLIC_PORT -u MYSQL_USERNAME -p MYSQL_DATABASE
```

### Connect from app (same project)

Construct the connection string manually in your app's env var:

```
DATABASE_URL=mysql://root:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}
```

Or use individual vars:

```
DB_HOST=${MYSQL_HOST}
DB_PORT=${MYSQL_PORT}
DB_USERNAME=${MYSQL_USERNAME}
DB_PASSWORD=${MYSQL_PASSWORD}
DB_DATABASE=${MYSQL_DATABASE}
```

---

## MongoDB

### Credentials (from `variable list`)

| Variable | Description |
|----------|-------------|
| `MONGO_USERNAME` | Username (default: `mongo`) |
| `MONGO_PASSWORD` | Password (auto-generated) |
| `MONGO_CONNECTION_STRING` | Full connection string |

### Connect from local machine

```bash
mongosh "mongodb://MONGO_USERNAME:MONGO_PASSWORD@PUBLIC_HOST:PUBLIC_PORT"
```

### Connect from app (same project)

Set `MONGODB_URI` on your app service:

```
${MONGO_CONNECTION_STRING}
```

Works with Mongoose, PyMongo, and any MongoDB driver.

---

## Redis

### Credentials (from `variable list`)

| Variable | Description |
|----------|-------------|
| `REDIS_PASSWORD` | Password (auto-generated) |
| `REDIS_CONNECTION_STRING` | Full connection string |

> Redis has no username or database name by default.

### Connect from local machine

```bash
redis-cli -h PUBLIC_HOST -p PUBLIC_PORT -a REDIS_PASSWORD
```

### Connect from app (same project)

Set `REDIS_URL` on your app service:

```
${REDIS_CONNECTION_STRING}
```

Works with ioredis, redis-py, go-redis, and any Redis client.

---

## Caveats

1. **Variable references** — Zeabur uses a flat namespace. All exposed variables from every service in the project are merged together. Your app references them directly by name (e.g., `${POSTGRES_HOST}`), no prefix needed. Set them via the **Zeabur Dashboard** — the CLI has a known bug with `${}` expansion.
2. **Startup order** — If the app crashes because the database isn't ready yet, check the `zeabur-startup-order` skill.
3. **Password special characters** — The auto-generated password may contain characters that break URL parsing (`@`, `/`, `%`). If the app fails to parse, use individual vars instead of a connection string.
4. **Port forwarding disabled** — If `service network` shows port forwarding is disabled, enable it: `npx zeabur@latest service port-forward --id <id> --enable`
