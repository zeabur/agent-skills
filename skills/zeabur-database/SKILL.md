---
name: zeabur-database
description: Use when deploying a database to Zeabur. Use when user needs MySQL, PostgreSQL, MongoDB, or Redis. Use when user says "I need a database", "add database", "deploy postgres", "set up MySQL", "add Redis", "add MongoDB", or "connect to database". Also use when user mentions data persistence issues like "data lost after restart", "data not saved", "data disappears", "need persistent storage for data", or "how to persist data". Also use when integrating a database with an existing service.
---

# Zeabur Database Deployment

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

Deploy a database (PostgreSQL, MySQL, MongoDB, or Redis) to the user's Zeabur project via a template YAML, then help them integrate it with their application.

## Step 1 — Identify What the User Needs

| User Need | Database | Default Image |
|-----------|----------|---------------|
| Relational DB, SQL, ORM | PostgreSQL | `postgres:16-alpine` |
| MySQL-compatible, WordPress, legacy apps | MySQL (MariaDB) | `mariadb:10.6` |
| Document store, JSON, NoSQL | MongoDB | `mongo:8.0` |
| Cache, session store, queue, pub/sub | Redis | `redis:7-alpine` |

If the user doesn't specify, **ask which database they need** rather than guessing.

## Step 2 — Identify the Target Project

The database must be deployed into a project. Use the `zeabur-service-list` skill or ask the user for their project ID.

```bash
npx zeabur@latest service list --project-id <project-id>
```

## Step 3 — Write and Deploy the Template

Create a template YAML file and deploy it to the user's project. Pick the matching template below, save it to a `.yaml` file, then deploy:

```bash
npx zeabur@latest template deploy -f database.yaml -i=false --project-id <project-id>
```

### PostgreSQL

```yaml
# yaml-language-server: $schema=https://schema.zeabur.app/template.json
apiVersion: zeabur.com/v1
kind: Template
metadata:
  name: PostgreSQL
spec:
  description: PostgreSQL relational database
  icon: https://raw.githubusercontent.com/zeabur/service-icons/main/marketplace/postgresql.svg
  tags:
    - Database
  variables: []
  readme: ""
  services:
    - name: postgresql
      icon: https://raw.githubusercontent.com/zeabur/service-icons/main/marketplace/postgresql.svg
      template: PREBUILT_V2
      spec:
        source:
          image: postgres:16-alpine
        ports:
          - id: database
            port: 5432
            type: TCP
        volumes:
          - id: data
            dir: /var/lib/postgresql/data
        env:
          POSTGRES_USER:
            default: postgres
            expose: true
          POSTGRES_PASSWORD:
            default: ${PASSWORD}
            expose: true
          POSTGRES_DB:
            default: mydb
            expose: true
          POSTGRES_HOST:
            default: ${CONTAINER_HOSTNAME}
            expose: true
            readonly: true
          POSTGRES_PORT:
            default: ${DATABASE_PORT}
            expose: true
            readonly: true
          POSTGRES_CONNECTION_STRING:
            default: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
            expose: true
            readonly: true
```

### MySQL (MariaDB)

```yaml
# yaml-language-server: $schema=https://schema.zeabur.app/template.json
apiVersion: zeabur.com/v1
kind: Template
metadata:
  name: MySQL
spec:
  description: MySQL-compatible database (MariaDB)
  icon: https://raw.githubusercontent.com/zeabur/service-icons/main/marketplace/mariadb.svg
  tags:
    - Database
  variables: []
  readme: ""
  services:
    - name: mysql
      icon: https://raw.githubusercontent.com/zeabur/service-icons/main/marketplace/mariadb.svg
      template: PREBUILT_V2
      spec:
        source:
          image: mariadb:10.6
        ports:
          - id: database
            port: 3306
            type: TCP
        volumes:
          - id: data
            dir: /var/lib/mysql
        env:
          MYSQL_ROOT_PASSWORD:
            default: ${PASSWORD}
            expose: true
          MYSQL_DATABASE:
            default: mydb
            expose: true
          MYSQL_HOST:
            default: ${CONTAINER_HOSTNAME}
            expose: true
            readonly: true
          MYSQL_PORT:
            default: ${DATABASE_PORT}
            expose: true
            readonly: true
          MYSQL_CONNECTION_STRING:
            default: mysql://root:${MYSQL_ROOT_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}
            expose: true
            readonly: true
```

### MongoDB

```yaml
# yaml-language-server: $schema=https://schema.zeabur.app/template.json
apiVersion: zeabur.com/v1
kind: Template
metadata:
  name: MongoDB
spec:
  description: MongoDB document database
  icon: https://raw.githubusercontent.com/zeabur/service-icons/main/marketplace/mongodb.svg
  tags:
    - Database
  variables: []
  readme: ""
  services:
    - name: mongodb
      icon: https://raw.githubusercontent.com/zeabur/service-icons/main/marketplace/mongodb.svg
      template: PREBUILT_V2
      spec:
        source:
          image: mongo:8.0
        ports:
          - id: database
            port: 27017
            type: TCP
        volumes:
          - id: data
            dir: /data/db
        env:
          MONGO_INITDB_ROOT_USERNAME:
            default: root
            expose: true
          MONGO_INITDB_ROOT_PASSWORD:
            default: ${PASSWORD}
            expose: true
          MONGO_HOST:
            default: ${CONTAINER_HOSTNAME}
            expose: true
            readonly: true
          MONGO_PORT:
            default: ${DATABASE_PORT}
            expose: true
            readonly: true
          MONGO_CONNECTION_STRING:
            default: mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}
            expose: true
            readonly: true
```

### Redis

```yaml
# yaml-language-server: $schema=https://schema.zeabur.app/template.json
apiVersion: zeabur.com/v1
kind: Template
metadata:
  name: Redis
spec:
  description: Redis in-memory data store
  icon: https://raw.githubusercontent.com/zeabur/service-icons/main/marketplace/redis.svg
  tags:
    - Database
  variables: []
  readme: ""
  services:
    - name: redis
      icon: https://raw.githubusercontent.com/zeabur/service-icons/main/marketplace/redis.svg
      template: PREBUILT_V2
      spec:
        source:
          image: redis:7-alpine
        ports:
          - id: database
            port: 6379
            type: TCP
        volumes:
          - id: data
            dir: /data
        env:
          REDIS_HOST:
            default: ${CONTAINER_HOSTNAME}
            expose: true
            readonly: true
          REDIS_PORT:
            default: ${DATABASE_PORT}
            expose: true
            readonly: true
          REDIS_URI:
            default: redis://${REDIS_HOST}:${REDIS_PORT}
            expose: true
            readonly: true
```

## Step 4 — Integrate with Application

After deploying, the database exposes connection variables that other services can reference. Use the `zeabur-variables` skill to set env vars on the application service.

### Connection Variables by Database

| Database | Variable | Example Value |
|----------|----------|---------------|
| PostgreSQL | `POSTGRES_CONNECTION_STRING` | `postgresql://postgres:xxx@postgresql.zeabur.internal:5432/mydb` |
| MySQL | `MYSQL_CONNECTION_STRING` | `mysql://root:xxx@mysql.zeabur.internal:3306/mydb` |
| MongoDB | `MONGO_CONNECTION_STRING` | `mongodb://root:xxx@mongodb.zeabur.internal:27017` |
| Redis | `REDIS_URI` | `redis://redis.zeabur.internal:6379` |

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

## Step 5 — Verify

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

- **Change the default database name:** Edit the `POSTGRES_DB` / `MYSQL_DATABASE` / `MONGO_INITDB_DATABASE` value in the template before deploying.
- **External access:** Databases use TCP ports. Port forwarding is auto-enabled. Get the external host:port with `npx zeabur@latest service network --id <service-id>`.
- **Data persistence:** All templates include volumes. Data survives restarts and redeployments.
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
