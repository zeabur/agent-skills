---
name: zeabur-domain-dns
description: Use when managing DNS records for Zeabur-registered domains. Use when user says "add DNS record", "update DNS", "delete DNS record", "list DNS records", "set A record", "add CNAME", or "manage DNS". NOT for service domain binding (use zeabur-domain-url instead).
---

# Zeabur Domain DNS Management

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## List DNS Records

```bash
npx zeabur@latest domain dns list --domain example.com -i=false
```

## Create a DNS Record

```bash
npx zeabur@latest domain dns create --domain example.com --type A --name @ --content 1.2.3.4 -i=false
```

### Supported Record Types

A, AAAA, CNAME, MX, TXT, SRV, CAA, NS

### Optional Flags

| Flag | Description |
|------|-------------|
| `--ttl` | TTL in seconds (default 1 = auto) |
| `--priority` | Priority for MX/SRV records |
| `--proxied` | Proxy through Cloudflare |

### Examples

```bash
# A record
npx zeabur@latest domain dns create --domain example.com --type A --name @ --content 93.184.216.34 -i=false

# CNAME record
npx zeabur@latest domain dns create --domain example.com --type CNAME --name www --content example.com -i=false

# MX record
npx zeabur@latest domain dns create --domain example.com --type MX --name @ --content mail.example.com --priority 10 -i=false

# TXT record (SPF)
npx zeabur@latest domain dns create --domain example.com --type TXT --name @ --content "v=spf1 include:_spf.google.com ~all" -i=false
```

## Update a DNS Record

Identify the record by `--type` and `--name` (no need to look up record IDs):

```bash
npx zeabur@latest domain dns update --domain example.com --type A --name @ --content 5.6.7.8 -i=false
```

Optional: `--ttl`, `--priority`, `--proxied`

If multiple records match the same type+name, use `--record-id` to specify.

## Delete a DNS Record

```bash
npx zeabur@latest domain dns delete --domain example.com --type A --name test -y -i=false
```

## Verify DNS Propagation

After creating/updating records, verify with `dig`:

```bash
dig @<nameserver> <name>.<domain> <type> +short
```

## Important Notes

- This manages DNS for **Zeabur-registered domains** only. For domains registered elsewhere, configure DNS at your registrar.
- To bind a domain to a Zeabur service, use the `zeabur-domain-url` skill instead.
- `--domain` accepts the domain name (e.g. `example.com`). Use `--domain-id` only for advanced scripting.
