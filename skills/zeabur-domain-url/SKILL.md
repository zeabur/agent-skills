---
name: zeabur-domain-url
description: Use when services need public URL for redirects or CORS. Use when WEB_URL or similar has trailing slash issues. Use when user reports "redirect goes to wrong URL", "CORS error", or "trailing slash problem". Also use when user says "add domain", "set up domain", "bind domain", "create domain", or "manage domains" for a Zeabur service. Also use when domain creation fails with "WONDER_MESH_SERVER_REQUIRES_GATEWAY" or a domain is stuck in PROVISIONING on a Wonder Mesh server.
---

# Zeabur Domain URL Configuration

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Symptom

- Redirects go to wrong URL (missing domain suffix, or has trailing slash)
- CORS errors due to URL mismatch
- `${ZEABUR_WEB_URL}` has trailing slash causing path issues

## System Variables

| Variable | Example | Note |
|----------|---------|------|
| `ZEABUR_WEB_URL` | `https://app.zeabur.app/` | Has trailing slash |
| `ZEABUR_WEB_DOMAIN` | `app.zeabur.app` | Domain only, no protocol |

## Solution

Expose URL from entry service to others:

```yaml
- name: entry-service
  domainKey: PUBLIC_DOMAIN
  spec:
    env:
      APP_URL:
        default: https://${ZEABUR_WEB_DOMAIN}
        expose: true

- name: backend
  spec:
    env:
      WEB_URL:
        default: ${APP_URL}
```

**Use `https://${ZEABUR_WEB_DOMAIN}` not `${ZEABUR_WEB_URL}` to avoid trailing slash.**

## CLI Domain Management

### List domains

```bash
npx zeabur@latest domain list --id <service-id> -i=false
```

### Create a generated domain (*.zeabur.app)

Use `-g` to create a Zeabur-managed subdomain. With `-g`, `--domain` takes only the **prefix** (not the full domain):

```bash
npx zeabur@latest domain create --id <service-id> -g --domain myapp -y -i=false
# Suffix is auto-appended by backend based on region:
#   Default:           myapp.zeabur.app
#   Aliyun (China):    myapp.preview.aliyun-zeabur.cn
#   Tencent (China):   myapp.preview.tencent-zeabur.cn
#   Huawei (China):    myapp.preview.huawei-zeabur.cn
# China suffixes require completed identity verification on Zeabur.
```

Validation rules for generated domain prefix:
- At least 3 characters
- No dots allowed — only alphanumeric and hyphens
- Error `DOMAIN_NAME_TOO_SHORT` if less than 3 chars
- Error `UNSUPPORTED_DOMAIN_NAME` if prefix contains dots

### Create a custom domain

Without `-g`, `--domain` takes a **full domain name**:

```bash
npx zeabur@latest domain create --id <service-id> --domain example.com -y -i=false
```

After creating a custom domain, use the `zeabur-domain-dns` skill to configure the required DNS records. For dedicated servers, find the IP with:

```bash
npx zeabur@latest server list -i=false
# Note the IP address of the server running your service
```

Then at your DNS provider:
```
Type: A
Name: <your subdomain or @>
Value: <server IP from above>
```

> **Do not guess DNS values.** Always retrieve the actual server IP from `server list` output before configuring DNS.

### Delete domain

```bash
npx zeabur@latest domain delete --id <service-id> --domain <domain> -y -i=false
```

### Wonder Mesh servers: `WONDER_MESH_SERVER_REQUIRES_GATEWAY`

Domains cannot be bound directly to a service running on a Wonder Mesh provider server. Any flow that creates a domain — `domain create`, automatic domain binding during deploy, template deploy, or PR preview — can be rejected with:

```
Error: WONDER_MESH_SERVER_REQUIRES_GATEWAY
```

This is **not** a port or networking misconfiguration on the service, and no CLI retry can succeed. The backend rejects the request because a domain bound directly to the app service would be stuck in `PROVISIONING` forever. Domains for these services must be attached through the Wonder Mesh gateway, and that flow only exists in the Zeabur Dashboard.

When you receive this error:

1. **Stop.** Do not retry `domain create` — not with the same arguments, different flags, a changed port config, or a different service ID.
2. **Send the user to the Dashboard.** Tell them to open the service in the Zeabur Dashboard and set up the domain from its **Domains** tab.
3. **Explain what the Dashboard does.** The Domains tab runs the Wonder Mesh gateway attach flow: it binds the domain to the `app-gateway` service in the `wonder-mesh-gateway-{wonderNetID}` project on the user's behalf. This is the only supported path.

Do **not**:

- Bind the domain directly to the Wonder Mesh app service via CLI or API
- Bind the domain to the gateway service yourself with `domain create`
- Use any CLI / MCP "gateway attach" command — none exists

Services on all other servers are unaffected: the generated domain and custom domain flows above work unchanged.

### Caution

- `--domain` is always required in non-interactive mode. Without it the CLI returns `INVALID_DOMAIN_NAME`.
- With `-g`, provide only the prefix (e.g., `myapp`), **not** the full `myapp.zeabur.app`.
- Without `-g`, provide the complete domain (e.g., `example.com`).
