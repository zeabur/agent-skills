# Zeabur Agent Skills

Agent skills for Zeabur CLI operations, deployment, and troubleshooting. Works with **Claude Code**, **OpenAI Codex**, and other agents supporting the SKILL.md format.

**Current version: 1.17.0**

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

In the Codex app, search for "Zeabur" in the plugin directory and click **Add to Codex**.

In the Codex CLI, run `/plugins` and select "Install plugin" to browse and install.

### Local testing

```bash
# Claude Code
claude --plugin-dir /path/to/agent-skills

# Codex
codex --plugin-dir /path/to/agent-skills
```

## Skills

| Skill | Description | Use When |
|-------|-------------|----------|
| `zeabur-deployment-logs` | View and filter service logs | Checking logs or seeing env-id required errors |
| `zeabur-domain-url` | Handle service domain and URL configuration | Services need public URLs or trailing slash issues |
| `zeabur-migration` | Resolve database migration blocking issues | Service stuck "Waiting for migrations" |
| `zeabur-port-mismatch` | Fix proxy connection issues from port mismatches | Proxy shows dial tcp timeout or connection refused |
| `zeabur-project-create` | Create new Zeabur projects | Creating a new project or deploying templates |
| `zeabur-restart` | Restart individual services | Restarting services or --env-id required error |
| `zeabur-server-list` | List, get, reboot, and SSH into dedicated servers | Checking server status, IP, rebooting, or SSH access |
| `zeabur-server-catalog` | Browse available server providers/regions/plans | User asks what servers are available to rent |
| `zeabur-server-rent` | Rent a new dedicated server | User wants to buy or provision a server |
| `zeabur-service-list` | List all services and get service IDs | Needing service IDs or checking existing services |
| `zeabur-startup-order` | Fix connection errors from startup order | Service fails with connection refused to database/redis |
| `zeabur-template` | Template knowledge base for creating, validating, and troubleshooting | Creating or editing Zeabur template YAML, converting docker-compose |
| `zeabur-template-backup` | Backup templates to git repository | Saving a template locally with standardized format |
| `zeabur-template-deploy` | Deploy templates via CLI | Automating template deployments |
| `zeabur-update-service` | Update service config without full redeploy | Modifying env vars or updating single service |
| `zeabur-deploy` | Deploy local projects or from GitHub | User says "deploy this" or wants Git-based CI/CD deployment |
| `zeabur-variables` | Manage environment variables via CLI | Managing env vars or handling empty variable issues |
| `zeabur-ai-hub` | Manage AI Hub account, keys, balance, and usage | AI Hub status, API keys, add balance, usage, auto-recharge |
| `zeabur-email` | Manage Zeabur Email (ZSend) service | Email domains, API keys, webhooks, ZSend |
| `zeabur-domain-register` | Search, purchase, renew, and manage registered domains | Buying domains, checking availability, renewal |
| `zeabur-domain-dns` | Manage DNS records for registered domains | Adding/updating/deleting DNS records |
| `zeabur-auth` | Login, logout, and check auth status | User says "login", "登入", "logout", "登出" |
| `zeabur-domain-registrant` | Manage registrant profiles for domain registration | Creating/updating contact info for domains |

## Changelog

### 1.17.0

- Improved `zeabur-deploy` — added mandatory Post-Deploy Verification (now 5 checks: **stderr sanity** / build log / runtime log / HTTP smoke-test / process sanity) and a Verify-and-Fix Loop so agents don't treat `"status": "success"` as proof of a working deploy. Validated end-to-end against a real broken Rust deploy; the real test surfaced six previously-undocumented footguns that are now baked in:
  - **CLI exits 0 on hard API failure** — errors like `SHARED_CLUSTER_SERVICE_CREATION_DISABLED`, `FailedPrecondition`, and other GraphQL `ERROR`s are printed to stderr only; the process still returns 0. New "Check 0 — stderr sanity" step greps the captured stderr before trusting the JSON success response.
  - **`SHARED_CLUSTER_SERVICE_CREATION_DISABLED`** — new triage row routes users to `zeabur-project-create` / `zeabur-server-rent` for a dedicated server when the shared cluster refuses new services.
  - **Empty runtime log ≠ failure** — observed in practice on `rust:1-slim` and other minimal runtimes; the check now falls through to the HTTP smoke-test as the authoritative signal rather than misreading silence as a crash.
  - **`ps aux` doesn't work on minimal runtimes** — `rust:1-slim`, distroless, Alpine, etc. don't ship `procps` and `service exec -- ps aux` fails with an OCI exec error. Replaced with `cat /proc/1/cmdline | tr '\000' ' '` which works on any Linux container.
  - **`PORT=${WEB_PORT}` auto-inject** — Zeabur auto-sets `PORT` on HTTP services; apps that hardcode a port get 502 even with `0.0.0.0` bind. New triage row specifically covers Rust / Go / Python-stdlib servers that commonly hardcode.
  - **`domain create -g -n <name>` is a silent no-op** — returns EXIT=0 with empty stdout, does nothing. The `--domain` flag is the one that works. New "Creating a Generated Domain" section documents the working invocation.
- The Verify-and-Fix Loop enforces max 3 fix attempts per round; on budget exhaustion the loop pauses with a structured continue-or-skip prompt (symptom + attempts log + hypothesis + blocker) instead of silently retrying or giving up. Triage table also covers the `CannotConnectNowError` / "database system is starting up" readiness case and the "internal hostname `Name or service not known` because the sibling service doesn't exist" case — both previously unrouted.

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
