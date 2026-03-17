---
name: zeabur-email
description: Use when managing Zeabur Email (ZSend) service. Use when user says "email", "send email", "email domain", "email API key", "email webhook", or "ZSend".
---

# Zeabur Email (ZSend) Management

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Check Email Service Status

```bash
npx zeabur@latest email status -i=false
npx zeabur@latest email status -i=false --json
```

Shows onboarding status and account info.

## Domain Management

```bash
# List all domains
npx zeabur@latest email domains list -i=false
npx zeabur@latest email domains ls -i=false --json

# Add a domain
npx zeabur@latest email domains add --domain example.com --region us-east-1 -i=false

# Get domain details and DNS records
npx zeabur@latest email domains get --id <domain-id> -i=false

# Verify domain DNS records
npx zeabur@latest email domains verify --id <domain-id> -i=false

# Delete a domain
npx zeabur@latest email domains delete --id <domain-id> -i=false
```

**Supported regions:** `us-east-1`, `us-west-1`, `eu-central-1`, `ap-northeast-1`, `ap-northeast-3`, `ap-southeast-1`

### Domain Setup Workflow

```bash
# 1. Add the domain
npx zeabur@latest email domains add --domain example.com --region us-east-1 -i=false --json

# 2. Get DNS records to configure (note the domain ID from step 1)
npx zeabur@latest email domains get --id <domain-id> -i=false

# 3. After configuring DNS records at your DNS provider, verify
npx zeabur@latest email domains verify --id <domain-id> -i=false
```

## API Key Management

```bash
# List all keys
npx zeabur@latest email keys list -i=false
npx zeabur@latest email keys ls -i=false --json

# Create a key
npx zeabur@latest email keys create --name "production" --permission send_only -i=false

# Delete a key
npx zeabur@latest email keys delete --id <key-id> -i=false
```

**Permissions:** `all`, `send_only`, `read_only`

**The token is only shown once at creation time.** Make sure the user saves it immediately.

## Webhook Management

```bash
# List all webhooks
npx zeabur@latest email webhooks list -i=false
npx zeabur@latest email webhooks ls -i=false --json

# Create a webhook
npx zeabur@latest email webhooks create \
  --name "delivery-tracker" \
  --endpoint "https://example.com/webhook" \
  --events "delivery,bounce" \
  -i=false

# Verify a webhook
npx zeabur@latest email webhooks verify --id <webhook-id> -i=false

# Delete a webhook
npx zeabur@latest email webhooks delete --id <webhook-id> -i=false
```

**Supported events:** `send`, `delivery`, `bounce`, `complaint`, `reject`, `open`, `click`

**The webhook secret is only shown once at creation time.** Make sure the user saves it immediately.

## See Also

- `zeabur-domain-url` — configure public domains and URLs for services
- `zeabur-variables` — set environment variables (e.g., email API keys as env vars)
