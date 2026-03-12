# Zeabur Claude Plugin

Claude Code plugin for Zeabur CLI operations, deployment, and troubleshooting.

**Current version: 1.8.0**

## Installation

In Claude Code, run:

```
claude plugin marketplace add zeabur/zeabur-claude-plugin && claude plugin install zeabur@zeabur
```

Update to latest version:

```
claude plugin marketplace update zeabur && claude plugin update zeabur@zeabur
```

Or test locally:

```bash
claude --plugin-dir /path/to/zeabur-claude-plugin
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

## Changelog

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
