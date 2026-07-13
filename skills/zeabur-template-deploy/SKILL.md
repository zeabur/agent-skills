---
name: zeabur-template-deploy
description: Use when deploying Zeabur templates or common services/databases via CLI. Use when user says "deploy template", "install template", or asks to deploy any well-known service, database, or self-hosted app. Common triggers include MongoDB, PostgreSQL, MySQL, Redis, MinIO, SurrealDB, PocketBase, WordPress, Ghost, Halo, n8n, Logto, Umami, Uptime Kuma, Vaultwarden, Prometheus, RSSHub, Miniflux, TTRSS, Memos, AFFiNE, Linkding, Slash, Bytebase, SQL Chat, ApiCat, OpenClaw, and any other open-source service the user wants to deploy to Zeabur.
---

# Zeabur Template Deploy

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

Deploy Zeabur templates and marketplace prebuilt services via CLI. **Always use non-interactive mode (`-i=false`) in CLI automation.**

If no project exists yet, use the `zeabur-project-create` skill to create one before deploying.

## Deploying Prebuilt Services (MongoDB, PostgreSQL, Redis, etc.)

For well-known services available in the Zeabur template marketplace, **do NOT write custom template YAML files**. Search for the template code and deploy it directly with `-c`:

```bash
# 1. Search for the template by keyword
npx zeabur@latest template search mongodb -i=false --json

# 2. Deploy by template code (from the "Code" field in search results)
npx zeabur@latest template deploy -i=false \
  -c <TEMPLATE_CODE> \
  --project-id <project-id>
```

### Example: Deploy MongoDB

```bash
# Search returns code "KXL04P" for MongoDB
npx zeabur@latest template search mongodb -i=false --json

# Deploy directly by code
npx zeabur@latest template deploy -i=false \
  -c KXL04P \
  --project-id abc123
```

## Advanced: Fetch and Customize Before Deploy

If you need to modify the template YAML before deploying (e.g. adjust env vars, change image tags, add services), fetch it first with `template get --raw`, edit it, then deploy with `-f`:

```bash
# 1. Fetch the raw YAML
npx zeabur@latest template get -c KXL04P --raw > template.yaml

# 2. Edit template.yaml as needed

# 3. Deploy the customized template
npx zeabur@latest template deploy -i=false \
  -f template.yaml \
  --project-id <project-id>
```

## Custom Template Deploy

For fully custom or multi-service templates, use a template YAML file:

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
| `-c, --code` | Template code (deploy marketplace template directly, mutually exclusive with `-f`) |
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

To create or edit template YAML files, use the `zeabur-template` skill.

## Known Limitations

### Custom PREBUILT template YAML: internal DNS may not register

Services deployed via custom template YAML files (`-f template.yaml`) with `template: PREBUILT` may not get registered in Zeabur's internal DNS (`*.zeabur.internal`). This means other services in the same project cannot connect to them by hostname. See [zeabur/cli#204](https://github.com/zeabur/cli/issues/204).

**Workaround**: For database services (PostgreSQL, MySQL, Redis), use the marketplace template code (`-c <CODE>`) instead of custom YAML files. Marketplace templates are properly registered in internal DNS.

```bash
# RECOMMENDED — deploy via marketplace code (has internal DNS)
npx zeabur@latest template search postgresql -i=false --json
npx zeabur@latest template deploy -i=false -c <CODE> --project-id <id>

# NOT RECOMMENDED — custom YAML may lack internal DNS
npx zeabur@latest template deploy -i=false -f my-pg.yaml --project-id <id>
```

### Custom template YAML schema: `spec` nesting

Template YAML requires `spec.services[].spec.source`, not `spec.services[].source`:

```yaml
# CORRECT
spec:
  services:
    - name: my-service
      template: PREBUILT
      spec:                    # <-- required nesting
        source:
          image: postgres:17

# WRONG — will fail with "missing property 'spec'"
spec:
  services:
    - name: my-service
      template: PREBUILT
      source:                  # <-- missing spec wrapper
        image: postgres:17
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Interactive prompt hangs | Always use `-i=false` with `--project-id` and `--var` flags |
| Missing variables error | Add all required `--var` flags |
| Variable with `${REF}` | Use literal value or set in Dashboard after deploy |
| DOMAIN type validation | Domain availability checked automatically |
| `missing property 'spec'` | Wrap `source`/`ports`/`env` under `spec:` (double-nested) |
| Other services can't connect to DB | Use marketplace code (`-c`) not custom YAML (`-f`) for databases |

