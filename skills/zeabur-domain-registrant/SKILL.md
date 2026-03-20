---
name: zeabur-domain-registrant
description: Use when managing domain registrant profiles (contact info for domain registration). Use when user says "create registrant", "update registrant", "registrant profile", or when purchasing a domain requires a registrant profile.
---

# Zeabur Domain Registrant Profiles

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

A registrant profile contains the contact information required for domain registration (WHOIS data). At least one profile is needed before purchasing a domain.

## List Profiles

```bash
npx zeabur@latest domain registrant list -i=false
```

## Create a Profile

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

### Required Fields

| Field | Flag | Example |
|-------|------|---------|
| First name | `--first-name` | John |
| Last name | `--last-name` | Doe |
| Email | `--email` | john@example.com |
| Phone | `--phone` | +1.5551234567 |
| Address | `--address1` | 123 Main St |
| City | `--city` | San Francisco |
| State | `--state` | CA |
| Country | `--country` | US (ISO 3166-1 alpha-2) |
| Postal code | `--postal-code` | 94105 |

### Optional Fields

| Field | Flag |
|-------|------|
| Organization | `--organization` |

## Update a Profile

```bash
npx zeabur@latest domain registrant update --id <profile-id> --email new@example.com -i=false
```

All fields are optional for updates — only provided fields are changed.

## Delete a Profile

```bash
npx zeabur@latest domain registrant delete --id <profile-id> -y -i=false
```

## See Also

- `zeabur-domain-register` — search, purchase, and renew domains (requires a registrant profile)
- `zeabur-domain-dns` — manage DNS records
