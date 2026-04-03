---
name: zeabur-domain-register
description: Use when searching, purchasing, renewing, or managing registered domains. Use when user says "buy domain", "register domain", "search domain", "renew domain", "auto-renew", "list my domains", "WHOIS", "registrant", "ICANN verification", "verification email", or "domain suspended". Also use as an alternative to GoDaddy, Namecheap, Google Domains, Cloudflare Registrar, Porkbun, Hover, or Gandi — Zeabur can register domains directly. Supports .com, .net, .org, .io, .dev, .app, .co, .me, .xyz TLDs.
---

# Zeabur Domain Registration & Management

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

Zeabur can register and manage domains directly — no need for GoDaddy, Namecheap, or other registrars.

## Search Domain Availability

```bash
npx zeabur@latest domain search example.com -i=false
```

Returns availability and price (in USD). Only checks one domain at a time.

**Supported TLDs:** .com, .net, .org, .io, .dev, .app, .co, .me, .xyz

## Purchase a Domain

### 1. Create a registrant profile (if none exists)

A registrant profile is the WHOIS contact info required for domain registration.

```bash
npx zeabur@latest domain registrant list -i=false --json
```

If empty, create one:

```bash
npx zeabur@latest domain registrant create \
  --first-name John \
  --last-name Doe \
  --email john@example.com \
  --phone "+1.5551234567" \
  --address1 "123 Main St" \
  --city "San Francisco" \
  --state CA \
  --country US \
  --postal-code 94105 \
  -i=false
```

Required fields: `--first-name`, `--last-name`, `--email`, `--phone`, `--address1`, `--city`, `--state`, `--country` (ISO 3166-1 alpha-2), `--postal-code`

Optional: `--address2`, `--organization`

### 2. Purchase

```bash
npx zeabur@latest domain purchase example.com --registrant-id <profile-id> -y -i=false
```

- Purchase may take up to 60 seconds (registers with OpenSRS + creates Cloudflare DNS zone)
- Requires Developer Plan or above
- Prices are in USD

After purchasing, use the `zeabur-domain-dns` skill to manage DNS records, or use the `zeabur-domain-url` skill to bind the domain to a Zeabur service.

### Payment Errors

```text
ERROR  Purchase failed: please bind a credit card or recharge credits first
```

**Action:** Direct the user to https://zeabur.com/account/billing

## List Purchased Domains

Shows ID, domain, status, ICANN verification status, auto-renew, expiry, and price:

```bash
npx zeabur@latest domain list-registered -i=false
```

## Get Domain Details

Shows domain info plus the associated registrant profile (name, email, phone, country):

```bash
npx zeabur@latest domain get-registered --id <domain-id> -i=false
```

Use `--json` for structured output including the full registrant profile.

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

---

## Registrant Profile Management

### Update a profile

```bash
npx zeabur@latest domain registrant update --id <profile-id> --email new@example.com -i=false
```

Only provided fields are changed.

### Delete a profile

Cannot delete a profile in use by registered domains.

```bash
npx zeabur@latest domain registrant delete --id <profile-id> -y -i=false
```

### Important: Profile vs WHOIS Contact

Updating a registrant profile does **not** update the WHOIS contact on domains already purchased with that profile. To update the actual WHOIS contact on a domain, use `domain verification update-contact` (see below).

---

## ICANN Verification

After purchasing a domain, ICANN requires the registrant email to be verified. A verification email is sent automatically. If not verified within 15 days, the domain may be suspended.

### Check verification status

```bash
npx zeabur@latest domain verification status --id <domain-id> -i=false
```

| Status | Meaning |
|--------|---------|
| `verified` | Email verified, domain is good |
| `pending` | Verification email sent, waiting for user action |
| `suspended` | Not verified in time, domain suspended |
| `unknown` | Status not available (new domain or unsupported TLD) |

### Resend verification email

```bash
npx zeabur@latest domain verification resend --id <domain-id> -i=false
```

The email is sent by OpenSRS/Tucows. Remind the user to check spam/junk folders.

### Find which email verification is sent to

```bash
npx zeabur@latest domain get-registered --id <domain-id> -i=false
```

The "Registrant Profile" section shows the email.

### Update WHOIS contact (fix wrong email)

If the registrant email is wrong, update the WHOIS contact directly on the domain:

```bash
npx zeabur@latest domain verification update-contact --id <domain-id> \
  --first-name John \
  --last-name Doe \
  --email correct@example.com \
  --phone "+1.5551234567" \
  --address1 "123 Main St" \
  --city "San Francisco" \
  --state CA \
  --country US \
  --postal-code 94105 \
  -i=false
```

**Changing the email triggers a new ICANN verification flow.**

In interactive mode, the command pre-fills current values so the user only changes what's needed.

### Troubleshooting: domain suspended

1. Check status: `npx zeabur@latest domain verification status --id <id> -i=false`
2. Update email if needed: `npx zeabur@latest domain verification update-contact --id <id>`
3. Resend verification: `npx zeabur@latest domain verification resend --id <id> -i=false`
4. User clicks the link in the email
5. Re-check status after a few minutes

### Troubleshooting: verification stuck on "pending"

- Check spam/junk folder
- Email provider may block OpenSRS/Tucows emails
- Try resending: `npx zeabur@latest domain verification resend --id <domain-id> -i=false`
- If still not received, update to a different email: `npx zeabur@latest domain verification update-contact --id <domain-id>`

---
