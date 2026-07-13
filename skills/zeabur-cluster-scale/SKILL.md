---
name: zeabur-cluster-scale
description: Use when scaling a dedicated Kubernetes cluster (Linode LKE or AWS EKS) on Zeabur — listing node pools, changing node counts, or adding/removing node pools. Use when user says "scale my cluster", "add nodes", "remove nodes", "resize node pool", "加節點", "擴容", "縮容". Do NOT use for renting new servers (use zeabur-server-rent) or for single-VM dedicated servers (they have no node pools).
---

# Zeabur Cluster Scaling (LKE / EKS Node Pools)

> Node pool operations are **not in the Zeabur CLI yet** — call the Zeabur GraphQL API directly at `https://api.zeabur.com/graphql`. The API maps 1:1 onto provider primitives: a node pool is an EKS managed node group or a Linode LKE node pool.

## ⚠️ Scaling changes real billing — explicit confirmation is REQUIRED

Adding nodes or node pools increases the cluster's monthly subscription price; the price is recalculated automatically from the underlying provider resources after every change. **You are the last line of defense**: never run a mutation until the user has explicitly confirmed the exact change.

Before any mutation, present all of the following in one message:

- **Cluster** (name + server ID)
- **Node pool** (instance type + current node count)
- **The exact change** (e.g. `3 → 5 nodes`, or "add pool `g6-standard-4` × 2")
- **Current monthly price** (from `Server.price`) and that it **will increase/decrease automatically** after the change

Then ask a direct yes/no question, for example:

> You are about to scale node pool `g6-standard-4` on cluster `my-cluster` from **3 to 5 nodes**. Your current price is **US$180/month** and will increase roughly proportionally. Confirm?

**Never infer consent** from an ambiguous reply. A bare "ok" before seeing concrete numbers does NOT count. When in doubt, re-confirm instead of mutating.

## Authentication

All requests need a Bearer token. Keep the token out of the process list — write it into a `0600` curl config and pass that with `-K`, instead of putting `-H "Authorization: ..."` on the command line:

```bash
TOKEN="${ZEABUR_API_KEY:-$(grep '^token:' ~/.config/zeabur/cli.yaml | awk '{print $2}')}"
ZAPI_CFG=$(mktemp)
chmod 600 "$ZAPI_CFG"
printf 'header = "Authorization: Bearer %s"\n' "$TOKEN" > "$ZAPI_CFG"
unset TOKEN
```

- Prefer the `ZEABUR_API_KEY` environment variable if set
- Otherwise reuse the CLI token from `~/.config/zeabur/cli.yaml` (present after `npx zeabur@latest auth login` — use the `zeabur-auth` skill if the user is not logged in)
- Each tool/Bash invocation is a fresh shell — run this setup in the same shell block as the requests that use `$ZAPI_CFG`, and `rm -f "$ZAPI_CFG"` when done

All node pool mutations require **manage access** to the cluster (owner or admin). Collaborators with view-only access can list pools but not change them.

## 1. Find the cluster's server ID

```bash
npx zeabur@latest server list -i=false
```

Only dedicated Kubernetes clusters (LKE / EKS) have node pools. If unsure whether a server is a cluster, check `clusterType` in the query below — clusters return `"dedicated_cluster"` and a non-empty `nodePools`.

## 2. List node pools

```bash
curl -sS --max-time 30 -K "$ZAPI_CFG" https://api.zeabur.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query($id: ObjectID!) { server(_id: $id) { name clusterType price nodePools { id instanceType nodeCount minNodes maxNodes readyNodes status } } }","variables":{"id":"<server-id>"}}'
```

Field notes:

- `id` — the provider-side identifier (EKS node group name, or LKE node pool ID). Pass it as `nodePoolID` in the mutations below.
- `instanceType` — provider machine type backing the pool (e.g. `t3.2xlarge` for EKS, `g6-standard-4` for LKE)
- `nodeCount` vs `readyNodes` — desired vs currently-in-service. They differ while a scale operation is in progress.
- `minNodes` / `maxNodes` — autoscaling floor/ceiling; both `0` when autoscaling is not configured
- `price` — the cluster's current monthly subscription price; quote it in the confirmation message

## 3. Scale an existing node pool

The most common operation — changes the node count of a pool in place:

```bash
curl -sS --max-time 30 -K "$ZAPI_CFG" https://api.zeabur.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation($sid: ObjectID!, $pid: String!, $n: Int!) { scaleNodePool(serverID: $sid, nodePoolID: $pid, nodeCount: $n) }","variables":{"sid":"<server-id>","pid":"<node-pool-id>","n":5}}'
```

After mutating, poll the list query every ~30 seconds until `readyNodes` equals the new `nodeCount` **and** the pool `status` is healthy (`ACTIVE` for EKS, `ready` for LKE) — provisioning typically takes a few minutes. **Bound the wait**: if the pool reports a failed/degraded `status`, stop immediately and relay it; if it has not converged after ~15 minutes, stop polling and report the current state instead of waiting forever. On success, report the updated pool and price to the user.

**If a mutation request times out or fails at the transport layer, never blind-retry.** The change may have been applied server-side — re-fetch the node pool list first, and only retry if the state shows the change did not happen. Blind-retrying `addNodePool` can double-provision (and double-bill); blind-retrying `removeNodePool` can hit a second pool if IDs were reused from a stale list.

**Scaling down:** warn the user that removed nodes are drained and their workloads reschedule onto the remaining nodes — make sure remaining capacity fits the current workload (check with the `zeabur-service-metric` skill if needed). Never scale the cluster's only pool to 0.

## 4. Add a node pool

Use when the user needs a different machine type (e.g. adding bigger or GPU nodes) rather than more of the same:

```bash
curl -sS --max-time 30 -K "$ZAPI_CFG" https://api.zeabur.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation($sid: ObjectID!, $t: String!, $n: Int!) { addNodePool(serverID: $sid, instanceType: $t, nodeCount: $n) { id instanceType nodeCount status } }","variables":{"sid":"<server-id>","t":"g6-standard-4","n":2}}'
```

`instanceType` is passed through to the provider verbatim — you are expected to look up a valid type first:

- **LKE (Linode)**: `curl -s https://api.linode.com/v4/linode/types` — public, no auth. Use the type `id` (e.g. `g6-standard-4`, `g6-dedicated-8`).
- **EKS (AWS)**: any EC2 instance type available in the cluster's region (e.g. `t3.2xlarge`, `m6i.xlarge`). When unsure, ask the user or match the instance type of an existing pool.

An invalid or out-of-region instance type fails at the provider — the error message is passed through in the GraphQL `errors` array.

## 5. Remove a node pool

**Destructive.** All nodes in the pool are drained and deleted; workloads reschedule onto the remaining pools. Never remove the last node pool of a cluster. Requires the same explicit confirmation as above, plus naming the pool being removed.

```bash
curl -sS --max-time 30 -K "$ZAPI_CFG" https://api.zeabur.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation($sid: ObjectID!, $pid: String!) { removeNodePool(serverID: $sid, nodePoolID: $pid) }","variables":{"sid":"<server-id>","pid":"<node-pool-id>"}}'
```

Completion check for removal: poll the list query (same bounds as above) until the pool **no longer appears** in `nodePools`, then report the updated price.

## Recommended guidance flow

When the user asks to scale (or complains about capacity):

1. **Show current state first** — list node pools with ready counts and the current monthly price
2. **Propose a concrete change** — which pool, what count (or what new instance type), and the billing impact
3. **Get explicit confirmation** — see the confirmation requirements at the top
4. **Mutate, then watch** — poll with the bounds above until the operation-specific completion check passes (scale/add: `readyNodes` matches and `status` healthy; remove: pool gone from the list); report completion and the updated price

## Errors

- `401` / unauthenticated — token missing or expired: re-run `npx zeabur@latest auth login` or check `ZEABUR_API_KEY`
- "requires manage access" — the user is not the cluster's owner/admin; they must ask the owner to perform the change
- Empty `nodePools` — the server is not a dedicated Kubernetes cluster (single-VM dedicated servers cannot be scaled this way; suggest `zeabur-server-rent` for renting more capacity)
- Provider-side errors (invalid instance type, capacity unavailable in region) are surfaced verbatim in the GraphQL `errors` array — relay them to the user and suggest an alternative type/region
