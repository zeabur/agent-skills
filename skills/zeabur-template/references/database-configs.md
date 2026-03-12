# Common Database Configs

### PostgreSQL

```yaml
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

### MySQL/MariaDB

```yaml
- name: mariadb
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
```

### Redis

```yaml
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
```

### Standard Volume Paths

| Service | Path |
|---------|------|
| PostgreSQL | `/var/lib/postgresql/data` |
| MySQL/MariaDB | `/var/lib/mysql` |
| MongoDB | `/data/db` |
| Redis | `/data` |
| MinIO | `/data` |
