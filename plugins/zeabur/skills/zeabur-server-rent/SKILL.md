---
name: zeabur-server-rent
description: Use when renting a new dedicated server. Use when user wants to buy or provision a server. Supports discounted VPS from Linode, DigitalOcean, Hetzner, AWS Lightsail, GCP, Tencent Cloud (騰訊雲), Alibaba Cloud (阿里雲), and Volcano Engine (火山引擎).
---

# Zeabur Server Rent

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## ⚠️ Renting charges real money — explicit confirmation is REQUIRED

`server rent` immediately charges the user's payment method (or Zeabur balance). The `-y` flag skips the CLI's own confirmation prompt, so **you are the last line of defense**: never run `server rent` until the user has explicitly confirmed the exact priced option.

Before renting, you MUST present all of the following to the user in one message:

- **Provider** (e.g. DigitalOcean)
- **Region** (e.g. New York / `nyc3`)
- **Plan/spec** (e.g. `s-2vcpu-4gb` — 2 vCPU / 4 GB RAM)
- **Monthly price** (e.g. **US$27/month**)
- That the charge happens **immediately** upon rental

Then ask a direct yes/no question, for example:

> You are about to rent DigitalOcean New York `s-2vcpu-4gb` for **US$27/month**. This will charge your payment method now. Confirm purchase?

Only proceed after the user clearly and affirmatively confirms **this specific priced option**.

**Never infer purchase consent** from an ambiguous reply — a bare number like "2", an "ok", or a selection the user made before seeing concrete prices does NOT count. A numeric reply is only valid consent if it maps to a numbered option the user already saw with provider, region, spec, and price spelled out. When in doubt, re-confirm instead of renting.

## Rent a Server

```bash
npx zeabur@latest server rent --provider <code> --region <id> --plan <name> -y -i=false
```

## Workflow

### 1. Browse available options (use the `zeabur-server-catalog` skill for filtering)

```bash
npx zeabur@latest server catalog -i=false
```

### 2. Pick provider, region, plan from the JSON output

### 3. Present the exact option (provider, region, spec, monthly price, immediate charge) and get the user's explicit confirmation

See the confirmation requirements above. Do not skip this step even if the user previously asked you to rent a server in general terms.

### 4. Rent (only after confirmation)

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

