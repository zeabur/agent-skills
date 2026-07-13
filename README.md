# Zeabur Agent Skills

Agent skills for Zeabur CLI operations, deployment, and troubleshooting. Works with **Claude Code**, **OpenAI Codex**, and other agents supporting the SKILL.md format.

**Current version: 1.20.0**

## Installation

### Claude Code

```
claude plugin marketplace add zeabur/agent-skills && claude plugin install zeabur@zeabur
```

Update to latest version:

```
claude plugin marketplace update zeabur && claude plugin update zeabur@zeabur
```

### OpenAI Codex

Install from this repository's marketplace:

```
codex plugin marketplace add zeabur/agent-skills && codex plugin add zeabur@zeabur
```

Update to latest version:

```
codex plugin marketplace upgrade && codex plugin add zeabur@zeabur
```

The Codex plugin bundle lives in [`plugins/zeabur/`](plugins/zeabur) and is generated from the canonical root `skills/` — see [Repository layout](#repository-layout).

> **Public plugin directory:** this plugin has not been submitted to the OpenAI public plugin directory yet, so it is not searchable in the Codex app or via `/plugins`. Use the marketplace command above. Submission is tracked in [`docs/openai-plugin-submission.md`](docs/openai-plugin-submission.md); once the listing is approved, "Zeabur" will also be installable directly from the directory.

### Local testing

```bash
# Claude Code
claude --plugin-dir /path/to/agent-skills

# Codex — add the local checkout as a marketplace
codex plugin marketplace add /path/to/agent-skills && codex plugin add zeabur@zeabur
```

## Skills

33 skills, all CLI-based. No MCP server, no extra credentials beyond your Zeabur login.

### Deployment & build

| Skill | Description | Use When |
|-------|-------------|----------|
| `zeabur-deploy` | Deploy local projects or from GitHub | User says "deploy this" or wants Git-based CI/CD deployment |
| `zeabur-dockerfile` | Generate a Dockerfile for a project | User needs a Dockerfile for Node.js, Python, Go, Rust, PHP, etc. |
| `zeabur-deployment-logs` | View and filter build and runtime logs | Checking logs or debugging a failed deploy |
| `zeabur-file` | Analyze an uploaded project archive | User uploads a project file and asks what it is or how to deploy it |

### Services

| Skill | Description | Use When |
|-------|-------------|----------|
| `zeabur-service-list` | List all services and get service IDs | Needing service IDs or checking existing services |
| `zeabur-service-delete` | Delete a service | Tearing down a service |
| `zeabur-service-exec` | Run commands inside a service container | One-off DB queries, data cleanup, or manual migrations |
| `zeabur-service-metric` | Inspect CPU/memory usage | Service is slow, high CPU, or OOM |
| `zeabur-restart` | Restart individual services | Service is stuck or frozen |
| `zeabur-update-service` | Update service config without full redeploy | Modifying env vars or updating a single service |
| `zeabur-variables` | Manage environment variables via CLI | Managing env vars or handling empty variable issues |

### Projects

| Skill | Description | Use When |
|-------|-------------|----------|
| `zeabur-project-create` | Create new Zeabur projects | Creating a new project or deploying templates |
| `zeabur-project-delete` | Delete a Zeabur project | Cleaning up test or temporary projects |
| `zeabur-auth` | Login, logout, and check auth status | User says "login", "登入", "logout", "登出" |

### Databases & storage

| Skill | Description | Use When |
|-------|-------------|----------|
| `zeabur-database` | Deploy MySQL, PostgreSQL, MongoDB, or Redis | User says "I need a database" |
| `zeabur-object-storage` | Deploy S3-compatible object storage (MinIO, RustFS) | User needs object storage or an S3 bucket |

### Templates

| Skill | Description | Use When |
|-------|-------------|----------|
| `zeabur-template` | Template knowledge base for authoring and validating | Creating or editing template YAML, converting docker-compose |
| `zeabur-template-deploy` | Deploy templates via CLI | Deploying a marketplace template or well-known service |
| `zeabur-template-publish` | Publish or update a template on the marketplace | Shipping a template publicly |
| `zeabur-template-backup` | Back up a template to a git repository | Saving a template locally in a standardized format |

### Servers & clusters

| Skill | Description | Use When |
|-------|-------------|----------|
| `zeabur-server-catalog` | Browse available server providers/regions/plans | User asks what servers are available to rent |
| `zeabur-server-rent` | Rent a new dedicated server | User wants to buy or provision a server |
| `zeabur-server-list` | List, get, and reboot dedicated servers | Checking server status, IP, or provider info |
| `zeabur-server-ssh` | Debug a dedicated server over SSH | Inspecting pods, container logs, or running server commands |
| `zeabur-cluster-scale` | Scale Kubernetes clusters (LKE/EKS) via node pools | Adding/removing nodes or resizing a cluster |

### Domains, DNS & email

| Skill | Description | Use When |
|-------|-------------|----------|
| `zeabur-domain-register` | Search, purchase, renew, and manage domains | Buying domains, checking availability, renewal |
| `zeabur-domain-dns` | Manage DNS records for registered domains | Adding/updating/deleting DNS records |
| `zeabur-domain-url` | Handle service domain and URL configuration | Services need public URLs or have trailing-slash issues |
| `zeabur-email` | Manage Zeabur Email (ZSend) and send email | Email domains, API keys, webhooks, sending mail |
| `zeabur-ai-hub` | Manage AI Hub account, keys, balance, and usage | AI Hub status, API keys, add balance, auto-recharge |

### Troubleshooting

| Skill | Description | Use When |
|-------|-------------|----------|
| `zeabur-port-mismatch` | Fix proxy connection issues from port mismatches | Proxy shows dial tcp timeout or connection refused |
| `zeabur-startup-order` | Fix connection errors caused by startup order | Service fails with connection refused to database/redis |
| `zeabur-migration` | Resolve database migration blocking issues | Service stuck on "Waiting for migrations" |

## Repository layout

The canonical skills live in root `skills/`. The Codex plugin bundle in `plugins/zeabur/` is a **generated mirror** — Codex requires a plugin to live in a subdirectory with its skills physically inside it.

```
skills/                          # canonical — edit skills here only
.claude-plugin/plugin.json       # Claude Code plugin manifest (repo root is the plugin)
.codex-plugin/plugin.json        # canonical Codex manifest
.agents/plugins/marketplace.json # Codex marketplace, points at ./plugins/zeabur
plugins/zeabur/                  # GENERATED Codex bundle — do not edit by hand
scripts/sync-codex-plugin.mjs    # regenerates plugins/zeabur/
```

After editing anything in `skills/` or `.codex-plugin/plugin.json`, regenerate the bundle and commit the result:

```bash
node scripts/sync-codex-plugin.mjs
```

CI (`.github/workflows/codex-plugin-sync.yml`) fails the build if `plugins/zeabur/` drifts from root `skills/`.

## Changelog

### 1.20.0

- Added `zeabur-cluster-scale` — list, scale, add, and remove node pools on dedicated Kubernetes clusters (LKE/EKS) via the GraphQL API, with explicit priced confirmation before every change

### 1.16.0

- Improved `zeabur-email` — added Send an Email section with REST API endpoint and usage examples
- Refactored all skills — inlined cross-skill references into relevant context, removed standalone "See Also" sections for better readability

### 1.15.0

- Added `zeabur-auth` — login, logout, and auth status check. Runs login directly so the CLI auto-opens the browser for the user

### 1.14.0

- Improved `zeabur-deploy` — emphasize saving service ID after first deploy to prevent duplicate services on redeploy
- Improved `zeabur-template-deploy` — added marketplace deploy via `-c` template code (no custom YAML needed)
- Fixed `zeabur-server-catalog` — corrected JSON example (uppercase provider codes, USD pricing, GB memory, egress field)

### 1.12.0

- Added `zeabur-domain-register` — search, purchase, renew, and manage registered domains (.com, .net, .org, .io, .dev, .app, .co, .me, .xyz)
- Added `zeabur-domain-dns` — full DNS record CRUD (list, create, update, delete) with domain-name-based lookup
- Added `zeabur-domain-registrant` — manage registrant profiles (contact info required for domain purchases)

### 1.11.2

- Updated `zeabur-port-mismatch` skill with CLI diagnostic commands (`service network`, `service port-forward`)

### 1.11.1

- Added post-deployment testing guide for TCP services in `zeabur-template` skill
- Clarified `PORT_FORWARDED_HOSTNAME` and `PORT_FORWARDED_PORT` variable descriptions

### 1.11.0

- Added `zeabur-ai-hub` — manage AI Hub tenant status, API keys, balance top-up, auto-recharge, and monthly usage
- Added `zeabur-email` — manage Zeabur Email (ZSend) domains, API keys, webhooks, and service status

### 1.10.0

- Add TCP service guide to `zeabur-template` skill: `portForwarding`, TCP port type, and when NOT to use HTTP/domainKey
- Add `portForwarding` field to template skeleton
- Add TCP vs HTTP rule to Critical Rules section

### 1.9.0

- Require asking user to pick server when creating project, not auto-selecting
- Removed `--domain` flag from deploy skill docs
- Strengthened project-create skill invocation: must invoke skill, not CLI directly

### 1.8.1

- Strengthen deploy skill to MUST invoke `zeabur-project-create` skill (not CLI directly) when creating a new project, whether or not projects already exist

### 1.8.0

- Deploy now only requires `--project-id` for non-interactive mode — `--service-id` is optional (omit to auto-create a new service)
- Removed `-i=false` from deploy examples — `--json` mode handles non-interactive automatically

### 1.7.0

- Removed `--create` and `--region` flags from deploy skill — redirect to `zeabur-project-create` instead
- Deprecated old region codes (`hnd1`, `tpe1`) — regions must now use `server-<server-id>` from server list
- Added `--json` flag to all CLI command examples across deploy and project-create skills

### 1.6.0

- Added CLI domain management guide (list, create, delete) with non-interactive flags
- Documented `-g` (generated) vs custom domain behavior and region-based suffixes
- Added deploy prerequisite: require project identification before deploy

### 1.5.0

- Added cross-references ("See also") to all 17 skills for better discoverability
- Refactored `zeabur-template` with progressive disclosure — moved database configs, complexity levels, and hard-won lessons to `references/`
- Standardized workflow section naming across all skills
- Fixed `zeabur-template-deploy` filename casing (`skill.md` → `SKILL.md`)

### 1.4.0

- Added `zeabur-deploy` — deploy local projects directly (`zeabur deploy`) or from GitHub (`service deploy --template GIT`)
- Supports both direct upload and Git-based deployment with auto-redeploy on push

### 1.3.0

- Removed `zeabur-context` skill — use direct `--project-id` instead
- Removed `--env-id` from all skills (now auto-resolved by CLI)
- Added Node.js install guidance to npx notice in all skills
- Dynamic server selection for project create & enforce `npx zeabur@latest`

### 1.2.0

- Updated `zeabur-server-list` — added SSH into servers with automatic password authentication

### 1.1.0

- Added `zeabur-server-list` — list, get, and reboot dedicated servers
- Added `zeabur-server-catalog` — browse available providers, regions, and plans with filters
- Added `zeabur-server-rent` — rent a new server with payment error guidance

### 1.0.0

- Initial release with service, project, template, and troubleshooting skills

## License

MIT
