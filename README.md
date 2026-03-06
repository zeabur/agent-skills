# Zeabur Claude Plugin

Claude Code plugin for Zeabur CLI operations, deployment, and troubleshooting.

**Current version: 1.2.0**

## Installation

In Claude Code, run:

```
/plugin marketplace add zeabur/zeabur-claude-plugin
/plugin install zeabur@zeabur
```

Update to latest version:

```
claude plugin update zeabur@zeabur
```

Or test locally:

```bash
claude --plugin-dir /path/to/zeabur-claude-plugin
```

## Skills

| Skill | Description | Use When |
|-------|-------------|----------|
| `zeabur-context` | Configure Zeabur CLI project context | Commands return wrong project's services or context errors |
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
| `zeabur-variables` | Manage environment variables via CLI | Managing env vars or handling empty variable issues |

## Changelog

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
