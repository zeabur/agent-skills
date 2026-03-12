---
name: zeabur-domain-url
description: Use when services need public URL for redirects or CORS. Use when WEB_URL or similar has trailing slash issues.
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

You must configure DNS records manually after creating a custom domain.

### Delete domain

```bash
npx zeabur@latest domain delete --id <service-id> --domain <domain> -y -i=false
```

### Caution

- `--domain` is always required in non-interactive mode. Without it the CLI returns `INVALID_DOMAIN_NAME`.
- With `-g`, provide only the prefix (e.g., `myapp`), **not** the full `myapp.zeabur.app`.
- Without `-g`, provide the complete domain (e.g., `example.com`).
