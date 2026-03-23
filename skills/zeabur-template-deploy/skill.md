---
name: zeabur-template-deploy
description: Use when deploying Zeabur templates or common services/databases via CLI. Use when user says "deploy template", "install template", or asks to deploy any well-known service, database, or self-hosted app. Common triggers include MongoDB, PostgreSQL, MySQL, Redis, MinIO, SurrealDB, PocketBase, WordPress, Ghost, Halo, n8n, Logto, Umami, Uptime Kuma, Vaultwarden, Prometheus, RSSHub, Miniflux, TTRSS, Memos, AFFiNE, Linkding, Slash, Bytebase, SQL Chat, ApiCat, OpenClaw, and any other open-source service the user wants to deploy to Zeabur.
---

# Zeabur Template Deploy

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

Deploy Zeabur templates and marketplace prebuilt services via CLI. **Always use non-interactive mode (`-i=false`) in CLI automation.**

## Marketplace Prebuilt Services

For common databases and services (MongoDB, PostgreSQL, MySQL, Redis, etc.), use `--marketplace-code` instead of writing a template YAML file. This is the **preferred method** for deploying well-known services.

```bash
npx zeabur@latest service deploy --json -i=false \
  --project-id <project-id> \
  --marketplace-code <code>
```

### Common Marketplace Codes

| Service | Code |
|---------|------|
| MongoDB | `mongodb` |
| PostgreSQL | `postgresql` |
| MySQL | `mysql` |
| Redis | `redis` |
| MinIO | `minio` |

### Example

```bash
# Deploy MongoDB to a project
npx zeabur@latest service deploy --json -i=false \
  --project-id abc123 \
  --marketplace-code mongodb
```

**Do NOT write custom template YAML files for services that have a marketplace code.** Use `--marketplace-code` directly.

## Custom Template Deploy

For custom or multi-service templates, use a template YAML file:

```bash
npx zeabur@latest template deploy -i=false \
  -f template.yaml \
  --project-id <project-id> \
  --var KEY1=value1 \
  --var KEY2=value2
```

## Flags

| Flag | Description |
|------|-------------|
| `-f, --file` | Template file (local path or URL) |
| `--project-id` | Project ID to deploy on |
| `--var` | Template variables (repeatable, e.g. `--var KEY=value`) |
| `--skip-validation` | Skip template validation |
| `-i=false` | Non-interactive mode (always use this) |

## Non-Interactive Mode

When using `-i=false`, all required template variables must be provided via `--var` flags.

If variables are missing, CLI shows helpful error:

```
Error: missing required variables in non-interactive mode:
  --var PUBLIC_DOMAIN=<value>  (Enter your domain prefix)
  --var DB_NAME=<value>  (Database name)
```

## Examples

### Deploy with Variables

```bash
npx zeabur@latest template deploy -i=false \
  -f https://example.com/template.yaml \
  --project-id abc123 \
  --var PUBLIC_DOMAIN=myapp \
  --var ADMIN_EMAIL=admin@example.com
```

### Deploy Local File

```bash
npx zeabur@latest template deploy -i=false \
  -f zeabur-template-myapp.yaml \
  --project-id abc123 \
  --var PUBLIC_DOMAIN=myapp
```

## Finding Required Variables

Template variables are defined in `spec.variables` section of the YAML:

```yaml
spec:
  variables:
    - key: PUBLIC_DOMAIN
      type: DOMAIN
      name: Domain
      description: Enter your domain prefix
    - key: DB_NAME
      type: STRING
      name: Database Name
      description: Database name
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Interactive prompt hangs | Always use `-i=false` with `--project-id` and `--var` flags |
| Missing variables error | Add all required `--var` flags |
| Variable with `${REF}` | Use literal value or set in Dashboard after deploy |
| DOMAIN type validation | Domain availability checked automatically |

## See Also

- `zeabur-template` — create and edit template YAML files
- `zeabur-project-create` — create a project before deploying a template
