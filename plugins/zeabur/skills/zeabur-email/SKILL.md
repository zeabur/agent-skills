---
name: zeabur-email
description: Use when managing Zeabur Email (ZSend) service or sending emails. Use when user says "email", "send email", "send mail", "email domain", "email API key", "email webhook", or "ZSend".
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

# 3. Configure the required DNS records using the `zeabur-domain-dns` skill, then verify
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

## Send an Email

Use the REST API directly with `curl`. The endpoint is `https://api.zeabur.com/api/v1/zsend/emails`.

```bash
curl -X POST https://api.zeabur.com/api/v1/zsend/emails \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <api-key>" \
  -d '{
    "from": "sender@example.com",
    "to": ["recipient@example.com"],
    "subject": "Hello from Zeabur Email",
    "html": "<h1>Hello!</h1><p>This is a test email.</p>",
    "text": "Hello! This is a test email."
  }'
```

- `from`: Must use a verified domain (e.g., `noreply@example.com`)
- `to`: Array of recipient email addresses
- `subject`: Email subject line
- `html`: HTML body (optional if `text` is provided)
- `text`: Plain text body (optional if `html` is provided)

The API key must have `send_only` or `all` permission. If no key exists, create one first (see API Key Management above).
