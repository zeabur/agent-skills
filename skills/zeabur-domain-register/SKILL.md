---
name: zeabur-domain-register
description: Use when searching, purchasing, renewing, or managing registered domains. Use when user says "buy domain", "register domain", "search domain", "renew domain", "auto-renew", or "list my domains". Supports .com, .net, .org, .io, .dev, .app, .co, .me, .xyz TLDs.
---

# Zeabur Domain Registration

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Search Domain Availability

```bash
npx zeabur@latest domain search example.com -i=false
```

Returns availability and price (in USD). Only checks one domain at a time.

## Purchase a Domain

### 1. Ensure a registrant profile exists

```bash
npx zeabur@latest domain registrant list -i=false --json
```

If no profiles exist, create one first (see `zeabur-domain-registrant` skill).

### 2. Purchase

```bash
npx zeabur@latest domain purchase example.com --registrant-id <profile-id> -y -i=false
```

- Purchase may take up to 60 seconds (backend registers with OpenSRS + creates Cloudflare zone)
- Prices are shown in USD

### Payment Errors

If the user has no credit card or insufficient balance:

```
ERROR  Purchase failed: please bind a credit card or recharge credits first
INFO   Please bind a credit card or top up your balance at: https://zeabur.com/account/billing
```

**Action:** Direct the user to https://zeabur.com/account/billing

## List Purchased Domains

```bash
npx zeabur@latest domain list-registered -i=false
```

## Get Domain Details

```bash
npx zeabur@latest domain get-registered --id <domain-id> -i=false
```

## Renew a Domain

```bash
npx zeabur@latest domain renew --id <domain-id> -y -i=false
```

## Toggle Auto-Renew

```bash
# Enable
npx zeabur@latest domain auto-renew --id <domain-id> --enable -i=false

# Disable
npx zeabur@latest domain auto-renew --id <domain-id> --disable -i=false
```

## Supported TLDs

.com, .net, .org, .io, .dev, .app, .co, .me, .xyz

## See Also

- `zeabur-domain-dns` — manage DNS records for registered domains
- `zeabur-domain-registrant` — manage registrant profiles
- `zeabur-domain-url` — bind domains to Zeabur services
