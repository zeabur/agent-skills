---
name: zeabur-domain-registrant
description: Use when managing domain registrant profiles (contact info for domain registration) or ICANN registrant verification. Use when user says "create registrant", "update registrant", "registrant profile", "verification email", "resend verification", or when purchasing a domain requires a registrant profile.
---

# Zeabur Domain Registrant Profiles & Verification

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

## ICANN Registrant Verification

After purchasing a domain, ICANN requires the registrant to verify their email address. If not verified, the domain may be suspended.

### Resend Verification Email

If the registrant hasn't received or has lost the verification email:

```bash
npx zeabur@latest domain verification resend --id <registered-domain-id> -i=false
```

In interactive mode, omit `--id` to select from a list:

```bash
npx zeabur@latest domain verification resend
```

### Update Registrant Contact

If the registrant email was entered incorrectly and cannot receive verification emails, the domain owner can update the contact info via the GraphQL API:

```graphql
mutation {
  updateRegistrantContact(
    registeredDomainID: "<id>"
    input: {
      firstName: "John"
      lastName: "Doe"
      email: "correct@example.com"
      phone: "+1.5551234567"
      address1: "123 Main St"
      city: "San Francisco"
      state: "CA"
      country: "US"
      postalCode: "94105"
    }
  )
}
```

**Note:** Changing the registrant email triggers a new ICANN verification flow and may impose a 60-day transfer lock.

### Check Verification Status

The verification status can be queried via GraphQL:

```graphql
{
  registeredDomain(id: "<id>") {
    domain
    registrantVerificationStatus
  }
}
```

Possible values: `verified`, `pending`, `suspended`, `unknown`.

## See Also

- `zeabur-domain-register` — search, purchase, and renew domains (requires a registrant profile)
- `zeabur-domain-dns` — manage DNS records
