---
name: zeabur-server-rent
description: Use when renting a new dedicated server. Use when user wants to buy or provision a server. Use when the user wants a rented server to run ZeaburOS so it can host Zeabur projects. Supports discounted VPS from Linode, DigitalOcean, Hetzner, AWS Lightsail, GCP, Tencent Cloud (騰訊雲), Alibaba Cloud (阿里雲), and Volcano Engine (火山引擎).
---

# Zeabur Server Rent

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Renting provisions the base OS — ZeaburOS is a second step

`server rent` gives you **Ubuntu and SSH, nothing else**. Zeabur services are not installed, so a freshly rented server **cannot host Zeabur projects yet**.

That is intentional, not a failure. The machine is the user's to do as they please: docker compose, 1Panel, 寶塔, or anything else. **ZeaburOS** — Zeabur's managed environment, built on k3s — is installed afterwards, as a separate step this skill also covers.

## Ask which OS the user wants — before renting

There are two outcomes, and they are not interchangeable. **Ask explicitly**; do not infer from context and do not pick a default:

| Option | What it is | When |
|--------|-----------|------|
| **Ubuntu** | A plain, self-managed VPS. Renting finishes and you are done. | The user wants their own machine to set up however they like. |
| **ZeaburOS** | Ubuntu plus Zeabur services. Required to deploy Zeabur projects onto this server. | The user wants to deploy projects on it. Adds a few minutes after renting. |

Phrase it as a question, e.g.:

> Do you want this server set up as **ZeaburOS** (so you can deploy Zeabur projects on it), or left as a plain **Ubuntu** VPS you manage yourself?

"They said they want to deploy an app" is **not** an answer to this question — plenty of users deploy with docker compose on their own box. Ask anyway.

## ⚠️ Renting charges real money — explicit confirmation is REQUIRED

`server rent` immediately charges the user's payment method (or Zeabur balance). The `-y` flag skips the CLI's own confirmation prompt, so **you are the last line of defense**: never run `server rent` until the user has explicitly confirmed the exact priced option.

Before renting, you MUST present all of the following to the user in one message:

- **Provider** (e.g. DigitalOcean)
- **Region** (e.g. New York / `nyc3`)
- **Plan/spec** (e.g. `s-2vcpu-4gb` — 2 vCPU / 4 GB RAM)
- **Monthly price** (e.g. **US$27/month**)
- **Which OS** they chose (from the step above)
- That the charge happens **immediately** upon rental

Then ask a direct yes/no question, for example:

> You are about to rent DigitalOcean New York `s-2vcpu-4gb` for **US$27/month**, set up as **ZeaburOS**. This will charge your payment method now. Confirm purchase?

Only proceed after the user clearly and affirmatively confirms **this specific priced option**.

**Never infer purchase consent** from an ambiguous reply — a bare number like "2", an "ok", or a selection the user made before seeing concrete prices does NOT count. A numeric reply is only valid consent if it maps to a numbered option the user already saw with provider, region, spec, and price spelled out. When in doubt, re-confirm instead of renting.

## Workflow

### 1. Browse available options (use the `zeabur-server-catalog` skill for filtering)

```bash
npx zeabur@latest server catalog -i=false
```

### 2. Pick provider, region, plan from the JSON output

### 3. Ask which OS the user wants

See the section above. This determines whether step 6 runs.

### 4. Present the exact option and get the user's explicit confirmation

Provider, region, spec, monthly price, OS, immediate charge. Do not skip this step even if the user previously asked you to rent a server in general terms.

### 5. Rent (only after confirmation)

```bash
npx zeabur@latest server rent --provider hetzner --region fsn1 --plan CAX11 -y -i=false
```

Provisioning takes a few minutes. Poll until the machine is up:

```bash
npx zeabur@latest server get <server-id> -i=false
```

Wait for `provisioningStatus` to become `READY` and `VM STATUS` to become `RUNNING`.

### 6. If the user chose ZeaburOS: install Zeabur services

Follow "Install ZeaburOS on a server" below. If they chose Ubuntu, you are done — see "Using a plain Ubuntu VPS".

## Install ZeaburOS on a server

Works on any server that has no Zeabur services yet: one just rented, one reinstalled back to base OS, or a WonderMesh device that stopped at joining the mesh.

> **Not in the Zeabur CLI yet** — call the Zeabur GraphQL API directly at `https://api.zeabur.com/graphql`.

### Authentication

Keep the token out of the process list — write it into a `0600` curl config and pass that with `-K`, instead of putting `-H "Authorization: ..."` on the command line:

```bash
TOKEN="${ZEABUR_API_KEY:-$(grep '^token:' ~/.config/zeabur/cli.yaml 2>/dev/null | awk '{print $2}')}"
if [ -z "$TOKEN" ]; then
  echo "No Zeabur token found — set ZEABUR_API_KEY or run: npx zeabur@latest auth login" >&2
  exit 1
fi
ZAPI_CFG=$(mktemp)
chmod 600 "$ZAPI_CFG"
trap 'rm -f "$ZAPI_CFG"' EXIT
printf 'header = "Authorization: Bearer %s"\n' "$TOKEN" > "$ZAPI_CFG"
unset TOKEN
```

- Prefer the `ZEABUR_API_KEY` environment variable if set
- Otherwise reuse the CLI token from `~/.config/zeabur/cli.yaml` (present after `npx zeabur@latest auth login` — use the `zeabur-auth` skill if the user is not logged in)
- **Stop if no token was found.** Continuing sends an unauthenticated request, and the resulting `401` reads as "the server is broken" rather than "you are not logged in"
- Each tool/Bash invocation is a fresh shell — run this setup in the same shell block as the requests that use `$ZAPI_CFG`. The `trap` removes the config even if a command in between fails

### Start the install

```bash
curl -sS --max-time 30 -K "$ZAPI_CFG" https://api.zeabur.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation($id: ObjectID!) { installK3s(serverID: $id) }","variables":{"id":"<server-id>"}}'
```

**Returning does not mean the install finished.** The work runs in the background — SSH into the machine, install k3s, wait for the node to come up — and takes several minutes. A `true` response only means the install was accepted and started.

### Poll until it finishes

```bash
curl -sS --max-time 30 -K "$ZAPI_CFG" https://api.zeabur.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query($id: ObjectID!) { server(_id: $id) { hasK3s provisioningStatus } }","variables":{"id":"<server-id>"}}'
```

Poll every ~30 seconds and stop on one of:

| Condition | Meaning |
|-----------|---------|
| `hasK3s: true` | **Done.** The server runs ZeaburOS and can host projects. |
| `provisioningStatus: "FAILED"` | The install failed. Report it; do not blind-retry. |

**Watch `hasK3s`, not `provisioningStatus: "READY"`.** The status goes `READY` → `INITIALIZING` → `READY`, so `READY` is also the state *before* the install starts — polling for it reports success the moment you look too early.

**Bound the wait.** If it has not converged after ~15 minutes, stop polling and report the current state instead of waiting forever; the server's page in the Zeabur dashboard shows progress detail.

### Errors

The mutation fails up front in these cases. Relay the meaning, not the raw GraphQL error:

| Code | What happened | What to tell the user |
|------|---------------|-----------------------|
| `K3S_ALREADY_INSTALLED` | The server already runs ZeaburOS | Nothing to do — it is ready for projects |
| `SERVER_NOT_READY` | Still provisioning | Wait for `provisioningStatus: READY`, then retry |
| `K3S_INSTALL_IN_PROGRESS` | An install is already running, or just finished | Do **not** send the mutation again — go straight to polling |
| `SERVER_NOT_FOUND` | Wrong ID, or the server was deleted | Re-check the ID with `server list` |

**If the mutation times out at the transport layer, never blind-retry.** The install may already be running server-side. Poll the query above first, and only resend the mutation when the server is back in the documented pre-install state — `hasK3s: false` **and** `provisioningStatus: "READY"`.

**Never auto-retry a `FAILED` install.** `FAILED` is terminal and means the install genuinely broke on the machine; retrying just repeats it. Report the failure and let the user decide.

## Payment Errors

If the user has no credit card bound or insufficient balance, the CLI returns:

```text
ERROR  Rent server failed: please bind a credit card or recharge credits first
INFO   Please bind a credit card or top up your balance at: https://zeabur.com/account/billing
```

**Action:** Direct the user to https://zeabur.com/account/billing to add a payment method or top up balance, then retry.

## Using a plain Ubuntu VPS

Nothing else is needed — SSH in and set the machine up however the user likes (docker compose, 1Panel, 寶塔, …). Use the `zeabur-server-ssh` skill:

```bash
npx zeabur@latest server exec --id <server-id> -- <command>
```

`kubectl` does not exist on such a machine, and there are no Zeabur services to manage.

> **Do not run `zeabur-project-create` against a server that is not running ZeaburOS.** It has no Zeabur services, so creating a project on it will fail — install ZeaburOS first.
