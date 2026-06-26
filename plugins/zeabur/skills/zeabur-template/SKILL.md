---
name: zeabur-template
description: Use when creating, editing, validating, or troubleshooting a Zeabur template YAML. Use when converting docker-compose to Zeabur template. Do NOT use for deploying templates (use zeabur-template-deploy instead).
---

# Zeabur Template Knowledge Base

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

This skill provides comprehensive knowledge for creating, debugging, and publishing Zeabur templates. It combines reference documentation with battle-tested patterns from real template development.

## External Documentation

For the latest schema and detailed docs, fetch from `https://raw.githubusercontent.com/zeabur/zeabur-template-doc/main/`:

| User Need | Document to Fetch | Path |
|-----------|-------------------|------|
| Create a template from scratch | Step-by-step guide | `docs/GUIDE.md` |
| Convert docker-compose.yml | Migration guide | `docs/DOCKER_COMPOSE_MIGRATION.md` |
| Look up YAML fields or built-in variables | Technical reference | `docs/REFERENCE.md` |
| Naming, design patterns, best practices | Best practices | `docs/BEST_PRACTICES.md` |
| Debug template errors | Troubleshooting | `docs/TROUBLESHOOTING.md` |
| Pre-deployment checklist | Checklist | `docs/CHECKLIST.md` |
| Quick all-in-one overview | Comprehensive prompt | `prompt.md` |

The template YAML schema is also available at https://schema.zeabur.app/template.json and the prebuilt service schema at https://schema.zeabur.app/prebuilt.json.

---

## Core Principles

### 0. All services MUST use PREBUILT_V2 with Docker images

**Every service in a template MUST be `template: PREBUILT_V2` with a Docker image as the source.** Never use `template: GIT`, `ARBITRARY_GIT`, or `GITHUB` source — these are NOT supported in templates.

If the project does not have a published Docker image (on Docker Hub, GHCR, etc.), **tell the user they need to build and publish a Docker image first** before a template can be created. Do not attempt to work around this.

If the user asks you to build the image, follow this workflow:
1. Clone the project repo and find its `Dockerfile` (usually at repo root)
2. Study the Dockerfile to understand build stages — use the **production stage** (often named `runner` or `production`)
3. Study `docker-compose.yml` or `docker-compose.fullapp.yml` for the correct startup command, env vars, and volumes — this is the battle-tested production config
4. Build for **amd64** (Zeabur servers are amd64, local Macs are arm64):
   ```bash
   docker buildx build --platform linux/amd64 --target runner -t org/image:tag --push .
   ```
5. After pushing, **verify the Docker Hub repo is public**:
   ```bash
   curl -s "https://hub.docker.com/v2/repositories/ORG/IMAGE/" | grep is_private
   ```
   New repos under org accounts often default to private. If `is_private: true`, the user must make it public on Docker Hub.

### 1. Never start from scratch

When asked to create a template, **always** look for existing configuration first:
- **First check if a Docker image exists** — search Docker Hub, GHCR (`ghcr.io/org/repo`), or the project's CI/CD for published images. If none exists, stop and inform the user.
- Search for the project's `docker-compose.yml`, `docker-compose.yaml`, or `compose.yml`
- Look for Helm charts (`Chart.yaml`, `values.yaml`)
- Check the project's GitHub repo for any deployment YAML files
- Use these as the foundation to build the Zeabur template, not as a loose reference — they contain battle-tested environment variables, port mappings, volume mounts, and service dependencies

### 2. Iterate via runtime logs — never expect one-shot success

Even experienced humans cannot create a working template in one shot. The workflow is an **iterative loop**:

1. Write/update the template YAML
2. Deploy the template
3. It will likely fail — check runtime logs to find the cause
4. Fix the issue in the template
5. Delete the project and redeploy from scratch
6. Repeat until the template achieves **one-click deployment success**

This is the normal process, not a sign of failure. Do not try to get everything perfect before deploying — deploy early, read logs, and iterate.

### 3. Reuse from existing templates — never write common services from scratch

When your template needs a common service (PostgreSQL, Redis, MySQL, MongoDB, etc.), **do not write the service definition yourself**. Instead:

1. Search for existing templates that already use that service:
   ```bash
   npx zeabur@latest template search postgres
   ```
2. Find a template that includes the service you need
3. Get the raw template YAML to see the exact service definition:
   ```bash
   npx zeabur@latest template get -c TEMPLATE_CODE --raw
   ```
4. Copy the service definition directly from that template into yours

**How to judge template trustworthiness:**
- Many templates are created by regular users and may not work correctly
- **Prefer templates with more deployments** — higher deployment count = more battle-tested
- **Prefer official templates over user-submitted ones** — official templates are vetted by Zeabur team

---

## CLI Commands for the Iteration Loop

**Deploy a template:**
```bash
npx zeabur@latest template deploy -f YOUR_TEMPLATE.yaml
```
For non-interactive mode (automation):
```bash
npx zeabur@latest template deploy -i=false \
  -f YOUR_TEMPLATE.yaml \
  --project-id PROJECT_ID \
  --var PUBLIC_DOMAIN=myapp
```

**List services (to get SERVICE_ID):**
```bash
npx zeabur@latest service list --project-id PROJECT_ID
```

**Check runtime logs:**
```bash
npx zeabur@latest deployment log --service-id SERVICE_ID
```

**Execute a command inside a running service** (like `docker exec`):
```bash
npx zeabur@latest service exec --id SERVICE_ID -- SHELL_COMMAND
```
This is extremely useful for debugging — check file paths, env vars, test connectivity, inspect the filesystem, etc. Examples:
```bash
npx zeabur@latest service exec --id SERVICE_ID -- ls /app
npx zeabur@latest service exec --id SERVICE_ID -- env | grep DATABASE
npx zeabur@latest service exec --id SERVICE_ID -- nc -z localhost 5432
```

**Restart a service** (useful to clear ImagePullBackOff or force re-pull):
```bash
npx zeabur@latest service restart --id SERVICE_ID -i=false -y
```

**Delete the project and start over:**
```bash
npx zeabur@latest project delete --id PROJECT_ID
```
> **DANGEROUS OPERATION** — Before deleting a project, you MUST ask the user for explicit confirmation, clearly stating the Project ID, Name, and createdAt timestamp. Never delete without confirmation.

**Publish a new template:**
```bash
npx zeabur@latest template create -f YOUR_TEMPLATE.yaml
```
This returns a template URL like `https://zeabur.com/templates/XXXXXX` with a template code.

**Update an existing template:**
```bash
npx zeabur@latest template update -c TEMPLATE_CODE -f YOUR_TEMPLATE.yaml
```

---

## Quick Reference: Template Skeleton

```yaml
# yaml-language-server: $schema=https://schema.zeabur.app/template.json
apiVersion: zeabur.com/v1
kind: Template
metadata:
  name: ServiceName
spec:
  description: |
    English description (1-3 sentences)
  icon: https://raw.githubusercontent.com/zeabur/service-icons/main/marketplace/service.svg
  coverImage: https://example.com/cover.webp
  tags:
    - Category
  variables: []
  readme: |
    # Service Name
    English documentation...
  services:
    - name: service-name
      icon: https://raw.githubusercontent.com/zeabur/service-icons/main/marketplace/service.svg
      template: PREBUILT_V2
      spec:
        source:
          image: image:tag
          command:              # MUST be inside source, alongside image
            - /bin/sh
            - -c
            - /opt/app/startup.sh
        ports:
          - id: web
            port: 8080
            type: HTTP
        portForwarding:
          enabled: true        # Auto-expose TCP/UDP ports externally (default: true)
        healthCheck:              # ensures port is ready before dependents start
          type: TCP
          port: web               # references the port ID above
        volumes:
          - id: data
            dir: /path/to/data
        configs:
          - path: /opt/app/startup.sh
            permission: 493     # 0755
            envsubst: false
            template: |
              #!/bin/sh
              exec node server.js
        env:
          VAR_NAME:
            default: value
            expose: true
localization:
  zh-TW:
    description: ...
    variables: []
    readme: |
      # ...
  zh-CN:
    description: ...
    variables: []
    readme: |
      # ...
  ja-JP:
    description: ...
    variables: []
    readme: |
      # ...
  es-ES:
    description: ...
    variables: []
    readme: |
      # ...
  id-ID:
    description: ...
    variables: []
    readme: |
      # ...
```

## Quick Reference: Built-in Variables

| Variable | Purpose |
|----------|---------|
| `${PASSWORD}` | Auto-generated secure password |
| `${ZEABUR_WEB_URL}` | Full public URL (e.g. `https://app.zeabur.app`) |
| `${ZEABUR_WEB_DOMAIN}` | Domain only (e.g. `app.zeabur.app`) |
| `${CONTAINER_HOSTNAME}` | Internal hostname for inter-service communication |
| `${[PORTID]_PORT}` | Port value by port ID (e.g. `${DATABASE_PORT}`) |
| `${PORT_FORWARDED_HOSTNAME}` | External hostname for port forwarding (auto-set when enabled, usable in env vars and `instructions`) |
| `${[PORTID]_PORT_FORWARDED_PORT}` | External forwarded port number (auto-set when enabled, usable in env vars and `instructions`) |

The `ZEABUR_<PORT_ID>_URL` pattern: for a port named `web`, it becomes `${ZEABUR_WEB_URL}`; for `console`, it becomes `${ZEABUR_CONSOLE_URL}`.

## Quick Reference: command Placement

**IMPORTANT: `command` MUST be inside `source`, alongside `image`. NOT at `spec` level.**

```yaml
# WRONG -- command at spec level (will be IGNORED, container uses default CMD)
spec:
  source:
    image: python:3.12-slim
  command:
    - /bin/sh
    - -c
    - /opt/app/start.sh

# CORRECT -- command inside source
spec:
  source:
    image: python:3.12-slim
    command:
      - /bin/sh
      - -c
      - /opt/app/start.sh
```

> **Note:** The external docs may show `command` at `spec` level. This is incorrect. Always place `command` inside `source` as confirmed by the JSON schema at `schema.zeabur.app/prebuilt.json`.

## Quick Reference: YAML Gotchas

```yaml
# RISKY -- @ at start of value is a YAML reserved indicator (may cause parse errors)
description: @BotFather token

# SAFE -- quote the value or avoid @ at start
description: "Token from @BotFather for Telegram bot"
description: Telegram bot token from BotFather
```

## Quick Reference: Docker Image ENTRYPOINT

**Some base images have ENTRYPOINT set, which conflicts with `command`.**

| Image | ENTRYPOINT | Problem |
|-------|-----------|---------|
| `ghcr.io/astral-sh/uv:python3.12-*` | `uv` | `command` becomes args to `uv`, container shows `uv help` and exits |
| `node:*` | none | Safe to use |
| `python:*` | none | Safe to use |

If using an image with ENTRYPOINT, switch to a plain base image (e.g. `python:3.12-slim-bookworm`) or one without ENTRYPOINT.

## Quick Reference: TCP Services (proxy, database, game server, etc.)

Services that are NOT web apps — such as HTTP proxies (Tinyproxy, Squid), databases, game servers, VPN servers, or any service that clients connect to directly via TCP/UDP — should **NOT** use HTTP port type or `domainKey`. Instead:

1. **Use `type: TCP` (or `UDP`)** — this prevents Zeabur's reverse proxy (Ingress) from intercepting traffic
2. **Set `portForwarding: enabled: true`** — this auto-exposes the port externally so clients can connect directly
3. **Do NOT use `domainKey`** — TCP services don't need a domain; users connect via the forwarded hostname:port

```yaml
# CORRECT -- TCP service (e.g. HTTP proxy, database, game server)
spec:
  source:
    image: some/tcp-service:latest
  ports:
    - id: proxy
      port: 8888
      type: TCP          # NOT HTTP — clients connect directly
  portForwarding:
    enabled: true        # Auto-expose this port externally
  env:
    # ...

# WRONG -- using HTTP type for a TCP proxy
spec:
  ports:
    - id: proxy
      port: 8888
      type: HTTP         # Zeabur's Ingress will intercept CONNECT requests
  # Missing portForwarding — users must manually enable in Dashboard
```

**Why not HTTP?** Zeabur's HTTP port type routes traffic through a reverse proxy (Ingress/Envoy) that terminates TLS and performs Host-based routing. This breaks protocols like HTTP CONNECT (used by proxies), raw TCP streams (databases), and custom binary protocols (game servers).

**Port Forwarding variables** (for use in `instructions` or readme):
- `${PORT_FORWARDED_HOSTNAME}` — the external hostname
- `${PROXY_PORT_FORWARDED_PORT}` — the external port (pattern: `${[PORTID]_PORT_FORWARDED_PORT}`)

**Post-deployment testing for TCP services:**

After deploying a TCP service, verify port forwarding is working:

1. Check internal connectivity first (from inside the container):
   ```bash
   npx zeabur@latest service exec --id SERVICE_ID -- curl -x http://127.0.0.1:8888 https://ifconfig.co
   ```

2. Get the forwarded host:port from the Dashboard's **Networking** tab, or use:
   ```bash
   npx zeabur@latest service network --id SERVICE_ID
   ```

3. Test external connectivity:
   ```bash
   curl -x http://FORWARDED_HOST:FORWARDED_PORT https://ifconfig.co
   ```

If port forwarding shows as DISABLED, enable it:
```bash
npx zeabur@latest service port-forward --id SERVICE_ID --enable
```

## Quick Reference: Headless Services (no HTTP)

If a service does NOT listen on any HTTP port (502 Bad Gateway), see `zeabur-port-mismatch` skill for the fix.

## Quick Reference: Critical Rules

```yaml
# WRONG -- using :latest tag (may serve cached/stale image)
image: rajnandan1/kener:latest

# CORRECT -- pin to specific version
image: rajnandan1/kener:4.0.16

# WRONG -- hardcoded password
POSTGRES_PASSWORD:
  default: mypassword123

# CORRECT -- use ${PASSWORD}
POSTGRES_PASSWORD:
  default: ${PASSWORD}
  expose: true

# WRONG -- PUBLIC_DOMAIN gives incomplete URL
APP_URL:
  default: https://${PUBLIC_DOMAIN}

# CORRECT -- ZEABUR_WEB_URL gives full URL
APP_URL:
  default: ${ZEABUR_WEB_URL}
  readonly: true

# WRONG -- other services can't reference without expose
POSTGRES_HOST:
  default: ${CONTAINER_HOSTNAME}

# CORRECT -- expose + readonly for connection info
POSTGRES_HOST:
  default: ${CONTAINER_HOSTNAME}
  expose: true
  readonly: true

# WRONG -- referencing variables without declaring dependency
- name: app
  spec:
    env:
      DB: ${POSTGRES_HOST}

# CORRECT -- declare dependency first
- name: app
  dependencies:
    - postgresql
  spec:
    env:
      DB: ${POSTGRES_HOST}

# WRONG -- HTTP type for a TCP proxy/database/game server
ports:
  - id: proxy
    port: 8888
    type: HTTP

# CORRECT -- TCP type + portForwarding for non-web services
ports:
  - id: proxy
    port: 8888
    type: TCP
portForwarding:
  enabled: true
```

---

## Domain Binding

Use `domainKey` on the service that needs a public domain. It maps to a variable defined in `spec.variables` with `type: DOMAIN`.

**Single domain:**
```yaml
domainKey: PUBLIC_DOMAIN
```

**Multiple domains (different ports):**
```yaml
domainKey:
    - port: web
      variable: ENDPOINT_DOMAIN
    - port: console
      variable: ADMIN_ENDPOINT_DOMAIN
```

---

## Common Database Configs

See `references/database-configs.md` for copy-paste PostgreSQL, MySQL/MariaDB, Redis configs and standard volume paths.

---

## Template Complexity Levels

See `references/complexity-levels.md` for the 5-level complexity guide (single service → large-scale multi-service platform).

---

## Writing name, description, readme, icon, and coverImage

**Where to collect information** (in priority order):
1. The project's **GitHub repo README**
2. The project's **official website**
3. Other **public sources** (blog posts, documentation sites, etc.)

**Key rules:**
1. **Do NOT copy-paste the original README.** Write the introduction for **this project's Zeabur template**, not for the project itself. The readme should:
   - Briefly introduce what the project is
   - Focus on how to use this template (deployment steps, configuration, domain binding)
   - Include important caveats and troubleshooting tips specific to Zeabur deployment
2. **Always include licensing and attribution.** If the original project has an MIT, Apache, or other license:
   - Mention the license in the readme
   - Link to the original repo
   - Link to the official website if available
   - This is **legally required** -- never skip it
3. **icon and coverImage**: Find the project's logo from their GitHub repo or official website. Use a direct URL to an image (SVG, PNG, or WebP). **Always verify the URL returns HTTP 200**:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" "URL"
   ```
   Common pitfall: wrong branch name in `raw.githubusercontent.com` URLs (`develop` vs `main` vs `master`).

## Localization Requirements

6 languages required: en-US (in `spec`), zh-TW, zh-CN, ja-JP, es-ES, id-ID.

**Translate:** `description`, `variables[].name`, `variables[].description`, `readme`

**Do NOT translate:** `key`, `type`, `${VARIABLE_NAMES}`, URLs

---

## Hard-Won Lessons

See `references/hard-won-lessons.md` for battle-tested patterns: wait-for-db, first-run init markers, OOM recovery, ImagePullBackOff, and more.
