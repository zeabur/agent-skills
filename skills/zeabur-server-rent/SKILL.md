---
name: zeabur-server-rent
description: Use when renting a new dedicated server. Use when user wants to buy or provision a server. Supports discounted VPS from Linode, DigitalOcean, Hetzner, AWS Lightsail, GCP, Tencent Cloud (騰訊雲), Alibaba Cloud (阿里雲), and Volcano Engine (火山引擎).
---

# Zeabur Server Rent

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Rent a Server

```bash
npx zeabur@latest server rent --provider <code> --region <id> --plan <name> -y -i=false
```

> **Run foreground and wait for output before retrying.** `server rent` is a billable action with no built-in idempotency — if the first call appears to hang and you re-issue it, you can end up with two servers (and two monthly charges). If the foreground command produces no output for a while, **do not retry**: instead poll `npx zeabur@latest server list -i=false --json` to see whether a new server has appeared. Only retry if `server list` confirms no new server was created. The CLI has no `server delete` subcommand — duplicates have to be removed via the dashboard at <https://zeabur.com/account/server>, so the cost of a wrongful retry is non-trivial.

## Workflow

### 1. Browse available options (use the `zeabur-server-catalog` skill for filtering)

```bash
npx zeabur@latest server catalog -i=false
```

### 2. Pick provider, region, plan from the JSON output

### 3. Rent

```bash
npx zeabur@latest server rent --provider hetzner --region fsn1 --plan CAX11 -y -i=false
```

## Payment Errors

If the user has no credit card bound or insufficient balance, the CLI returns:

```
ERROR  Rent server failed: please bind a credit card or recharge credits first
INFO   Please bind a credit card or top up your balance at: https://zeabur.com/account/billing
```

**Action:** Direct the user to https://zeabur.com/account/billing to add a payment method or top up balance, then retry.

## After Renting

The server takes a few minutes to provision. Check status with:

```bash
npx zeabur@latest server get <server-id> -i=false
```

Look for `provisioningStatus` to change to `READY` and `VM STATUS` to `RUNNING`. Once ready, use the `zeabur-project-create` skill to create a project on the new server.

