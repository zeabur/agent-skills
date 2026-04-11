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

## Retrieve Connection Parameters

After deploying, list the database service's variables to get the actual connection info:

```bash
npx zeabur@latest variable list --id <database-service-id> -i=false
```

Common variables exposed by database templates:

| Database | Key Variables | Example Values |
|----------|--------------|----------------|
| PostgreSQL | `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_CONNECTION_STRING` | `postgresql://postgres:xxx@postgresql.zeabur.internal:5432/mydb` |
| MySQL | `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_CONNECTION_STRING` | `mysql://root:xxx@mysql.zeabur.internal:3306/mydb` |
| MongoDB | `MONGO_HOST`, `MONGO_PORT`, `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD`, `MONGO_CONNECTION_STRING` | `mongodb://root:xxx@mongodb.zeabur.internal:27017` |
| Redis | `REDIS_HOST`, `REDIS_PORT`, `REDIS_URI` | `redis://redis.zeabur.internal:6379` |

> **Variable names depend on the template.** Always run `variable list` to confirm the actual keys.

---

## Integrate with Application

### Cross-service variable references

In Zeabur, services can reference other services' exposed variables using the `${SERVICE_NAME.VAR_NAME}` syntax. For example, if the database service is named `postgresql`:

```
${POSTGRESQL.POSTGRES_CONNECTION_STRING}
```

> **CLI limitation:** The CLI has a known bug with `${}` expansion — cross-service references should be set via the **Zeabur Dashboard** or GraphQL API. See the `zeabur-variables` skill for details.

### Common framework env var mapping

| Framework / App | Env Var to Set | Value |
|-----------------|---------------|-------|
| Django, Rails, Prisma, Next.js | `DATABASE_URL` | `${POSTGRESQL.POSTGRES_CONNECTION_STRING}` or `${MYSQL.MYSQL_CONNECTION_STRING}` |
| Laravel | `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Individual vars from database service |
| Spring Boot (PostgreSQL) | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://${POSTGRESQL.POSTGRES_HOST}:${POSTGRESQL.POSTGRES_PORT}/${POSTGRESQL.POSTGRES_DB}` |
| Spring Boot (MySQL) | `SPRING_DATASOURCE_URL` | `jdbc:mysql://${MYSQL.MYSQL_HOST}:${MYSQL.MYSQL_PORT}/${MYSQL.MYSQL_DATABASE}` |
| Mongoose / Node.js | `MONGODB_URI` | `${MONGODB.MONGO_CONNECTION_STRING}` |
| Redis clients (ioredis, redis-py, etc.) | `REDIS_URL` | `${REDIS.REDIS_URI}` |

---

## Local Connection (Port Forwarding)

Database ports are TCP with port forwarding auto-enabled. To get the external host:port for local tools:

```bash
npx zeabur@latest service network --id <database-service-id>
```

This returns `PORT_FORWARDED_HOSTNAME` and the forwarded port. Use them to connect from local tools:

```bash
# PostgreSQL (psql)
psql "postgresql://postgres:PASSWORD@FORWARDED_HOST:FORWARDED_PORT/mydb"

# MySQL (mysql)
mysql -h FORWARDED_HOST -P FORWARDED_PORT -u root -p mydb

# MongoDB (mongosh)
mongosh "mongodb://root:PASSWORD@FORWARDED_HOST:FORWARDED_PORT"

# Redis (redis-cli)
redis-cli -h FORWARDED_HOST -p FORWARDED_PORT
```

You can also connect from GUI tools (DBeaver, TablePlus, pgAdmin, MongoDB Compass, RedisInsight, etc.) using the same forwarded host:port.

---

## Run Queries Inside the Container

Use the `zeabur-service-exec` skill to run database clients directly:

```bash
# PostgreSQL
npx zeabur@latest service exec --id <db-service-id> -- psql -U postgres -d mydb

# MySQL
npx zeabur@latest service exec --id <db-service-id> -- mysql -u root -p

# MongoDB
npx zeabur@latest service exec --id <db-service-id> -- mongosh -u root -p

# Redis
npx zeabur@latest service exec --id <db-service-id> -- redis-cli
```

---

## Caveats

1. **Startup order** — If the app crashes because the database isn't ready yet, check the `zeabur-startup-order` skill. Add `healthCheck` and `dependencies` in the template to enforce ordering.
2. **Data persistence** — Database templates include volumes. Data survives restarts and redeployments. If a user reports data loss, verify the template has a `volumes` section.
3. **Connection refused from app** — The internal hostname follows the pattern `<service-name>.zeabur.internal`. If the service was renamed or uses a non-default name, the hostname changes accordingly. Use `variable list` to check `*_HOST`.
4. **Password contains special characters** — The auto-generated `${PASSWORD}` may contain characters that break connection string parsing (e.g., `@`, `/`, `%`). If the app fails to parse the URL, URL-encode the password or pass host/port/user/password as separate env vars instead of a single connection string.
