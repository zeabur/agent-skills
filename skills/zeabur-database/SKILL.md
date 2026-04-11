---
name: zeabur-database
description: Use when deploying a database to Zeabur. Use when user needs MySQL, PostgreSQL, MongoDB, or Redis. Use when user says "I need a database", "add database", "deploy postgres", "set up MySQL", "add Redis", "add MongoDB", or "connect to database". Also use when user mentions data persistence issues like "data lost after restart", "data not saved", "data disappears", "need persistent storage for data", or "how to persist data". Also use when integrating a database with an existing service.
---

# Zeabur Database Deployment

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

Deploy a database (PostgreSQL, MySQL, MongoDB, or Redis) to the user's Zeabur project via an existing template, then help them integrate it with their application.

## Step 1 — Identify What the User Needs

| User Need | Search Keyword |
|-----------|---------------|
| Relational DB, SQL, ORM | `postgresql` |
| MySQL-compatible, WordPress, legacy apps | `mysql` |
| Document store, JSON, NoSQL | `mongodb` |
| Cache, session store, queue, pub/sub | `redis` |

If the user doesn't specify, **ask which database they need** rather than guessing.

## Step 2 — Find the Template

Search for existing database templates on Zeabur:

```bash
npx zeabur@latest template search postgresql -i=false --json
```

This returns a JSON array of matching templates. Pick the one with the highest deployment count (more battle-tested). Note the `code` field — you'll need it to deploy.

To inspect a template's full YAML (service definitions, env vars, volumes, etc.):

```bash
npx zeabur@latest template get -c <TEMPLATE_CODE> --raw
```

> For advanced customization or creating a template from scratch, use the `zeabur-template` skill.

## Step 3 — Identify the Target Project

The database must be deployed into a project. Use the `zeabur-service-list` skill or ask the user for their project ID.

```bash
npx zeabur@latest service list --project-id <project-id>
```

## Step 4 — Deploy the Template

Deploy the database template into the user's project:

```bash
npx zeabur@latest template deploy -c <TEMPLATE_CODE> -i=false --project-id <project-id>
```

## Step 5 — Integrate with Application

After deploying, the database exposes connection variables that other services can reference. Use the `zeabur-variables` skill to set env vars on the application service.

### Connection Variables by Database

| Database | Variable | Example Value |
|----------|----------|---------------|
| PostgreSQL | `POSTGRES_CONNECTION_STRING` | `postgresql://postgres:xxx@postgresql.zeabur.internal:5432/mydb` |
| MySQL | `MYSQL_CONNECTION_STRING` | `mysql://root:xxx@mysql.zeabur.internal:3306/mydb` |
| MongoDB | `MONGO_CONNECTION_STRING` | `mongodb://root:xxx@mongodb.zeabur.internal:27017` |
| Redis | `REDIS_URI` | `redis://redis.zeabur.internal:6379` |

> **Note:** The actual variable names depend on the template. Use `npx zeabur@latest template get -c <TEMPLATE_CODE> --raw` to check the exact env var names exposed by the template.

### Common Application Env Var Names

Map the database connection string to whatever env var your app framework expects:

| Framework / App | Env Var Name | Value to Set |
|-----------------|-------------|--------------|
| Django | `DATABASE_URL` | `${POSTGRESQL.POSTGRES_CONNECTION_STRING}` |
| Rails | `DATABASE_URL` | `${POSTGRESQL.POSTGRES_CONNECTION_STRING}` |
| Laravel | `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Individual vars from the database service |
| Prisma | `DATABASE_URL` | `${POSTGRESQL.POSTGRES_CONNECTION_STRING}` or `${MYSQL.MYSQL_CONNECTION_STRING}` |
| Next.js / Node | `DATABASE_URL` | Connection string from chosen database |
| Spring Boot | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://${POSTGRESQL.POSTGRES_HOST}:${POSTGRESQL.POSTGRES_PORT}/${POSTGRESQL.POSTGRES_DB}` |
| Redis clients | `REDIS_URL` or `REDIS_URI` | `${REDIS.REDIS_URI}` |
| Mongoose | `MONGODB_URI` | `${MONGODB.MONGO_CONNECTION_STRING}` |

> **Cross-service variable references** (e.g., `${POSTGRESQL.POSTGRES_CONNECTION_STRING}`) should be set via the Zeabur Dashboard or GraphQL API — the CLI has a known issue with `${}` expansion. See the `zeabur-variables` skill for details.

## Step 6 — Verify

1. Check that the database service is running:
   ```bash
   npx zeabur@latest deployment log --service-id <database-service-id>
   ```

2. Test connectivity from the application container:
   ```bash
   # PostgreSQL
   npx zeabur@latest service exec --id <app-service-id> -- nc -z postgresql.zeabur.internal 5432

   # MySQL
   npx zeabur@latest service exec --id <app-service-id> -- nc -z mysql.zeabur.internal 3306

   # MongoDB
   npx zeabur@latest service exec --id <app-service-id> -- nc -z mongodb.zeabur.internal 27017

   # Redis
   npx zeabur@latest service exec --id <app-service-id> -- nc -z redis.zeabur.internal 6379
   ```

3. If the app fails to connect, check the `zeabur-startup-order` skill — the database may not be ready when the app starts.

## Tips

- **External access:** Databases use TCP ports. Port forwarding is auto-enabled. Get the external host:port with `npx zeabur@latest service network --id <service-id>`.
- **Data persistence:** Database templates include volumes. Data survives restarts and redeployments.
- **Run queries:** Use the `zeabur-service-exec` skill to run database clients inside the container:
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
