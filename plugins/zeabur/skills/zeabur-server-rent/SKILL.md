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

### Run this

One block: authenticate, start the install, wait for it. Substitute the server ID and run it as-is — every part of it is load-bearing, and the notes below say why.

```bash
SERVER_ID="<server-id>"

# Keep the token out of the process list: write it into a 0600 curl config
# passed with -K, never as -H "Authorization: ..." on the command line.
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

zapi() {
  curl -sS --max-time 30 -K "$ZAPI_CFG" https://api.zeabur.com/graphql \
    -H "Content-Type: application/json" -d "$1"
}

# Start the install. This returns immediately — the work runs in the background.
zapi "{\"query\":\"mutation(\$id: ObjectID!) { installK3s(serverID: \$id) }\",\"variables\":{\"id\":\"$SERVER_ID\"}}"

# Wait for it: up to 15 minutes, checking every 30 seconds.
for _ in $(seq 1 30); do
  sleep 30
  RESP=$(zapi "{\"query\":\"query(\$id: ObjectID!) { server(_id: \$id) { hasK3s provisioningStatus } }\",\"variables\":{\"id\":\"$SERVER_ID\"}}")
  HAS_K3S=$(printf '%s' "$RESP" | jq -r '.data.server.hasK3s')
  STATUS=$(printf '%s' "$RESP" | jq -r '.data.server.provisioningStatus')
  echo "hasK3s=$HAS_K3S provisioningStatus=$STATUS"
  if [ "$HAS_K3S" = "true" ]; then echo "ZeaburOS is installed"; exit 0; fi
  if [ "$STATUS" = "FAILED" ]; then echo "Install failed: $RESP" >&2; exit 1; fi
done
echo "Still installing after 15 minutes — check the server's page in the dashboard" >&2
exit 2
```

Why each part is the way it is:

- **The mutation returning does not mean the install finished.** The work runs in the background — SSH into the machine, install k3s, wait for the node to come up — and takes several minutes. A `true` response only means it was accepted and started. Never report success off the mutation alone.
- **Success is `hasK3s: true`, not `provisioningStatus: "READY"`.** The status goes `READY` → `INITIALIZING` → `READY`, so `READY` is also the state *before* the install starts. Polling for it reports success the moment you look too early — and it will look right, because the machine really is `READY`.
- **`FAILED` is checked separately**, so a broken install ends the wait instead of running out the clock.
- **Parse with `jq`, not by grepping the raw JSON.** `grep '"hasK3s":true'` breaks the moment the response is formatted with a space after the colon, and it fails *open* — a missed match looks like "still installing".
- **The wait is bounded.** After 15 minutes, stop and report the current state rather than polling forever; the server's page in the dashboard shows progress detail.
- **Stop if no token was found.** Continuing sends an unauthenticated request, and the resulting `401` reads as "the server is broken" rather than "you are not logged in".
- **The `trap` removes the curl config** even if a command in between fails. Each tool/Bash invocation is a fresh shell, so keep the whole block together — `$ZAPI_CFG` does not survive into the next one.

Prefer `ZEABUR_API_KEY` if it is set; otherwise the token comes from `~/.config/zeabur/cli.yaml`, written by `npx zeabur@latest auth login` (use the `zeabur-auth` skill if the user is not logged in).

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
