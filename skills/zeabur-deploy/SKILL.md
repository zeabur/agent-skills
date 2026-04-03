---
name: zeabur-deploy
description: Use when deploying a local project or codebase to Zeabur. Use when the user says "deploy this" or "deploy to Zeabur". Default to direct deploy unless the user explicitly asks for Git-based deployment.
---

# Zeabur Deploy

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Prerequisites — Identify the Target Project

Before using this skill, you must first determine which Zeabur project to deploy to. If neither the conversation history nor project files mention a project, run:

```bash
npx zeabur@latest project list -i=false --json
```

- When projects exist, ask the user which one to use.
- If the list is empty, or the user wants to create a new project, **you MUST invoke the `zeabur-project-create` skill**. Do NOT run `project create` CLI commands directly — the skill handles region selection via server list, which is required.

**Do not proceed with deployment until the target project is confirmed.**

### Deploying to a Specific Dedicated Server

If the user asks to deploy to a specific **server** (e.g. "deploy to my AWS Tokyo server"), do **NOT** SSH into the server. Zeabur dedicated servers are managed via the platform — you deploy services through the Zeabur CLI, not by manually placing files on the machine.

To find the project bound to a server:

1. Get the server ID from `npx zeabur@latest server list -i=false` (or from conversation context).
2. In the `project list --json` output, look for a project whose `Region.ID` matches `server-<server-id>`.
3. If a matching project exists, use its project ID to deploy.
4. If no matching project exists, **invoke the `zeabur-project-create` skill** to create one on that server.

## Choosing a Deploy Method

Zeabur supports two ways to deploy a project:

| Method | When to use |
|--------|-------------|
| **Direct deploy** (default) | User says "deploy this project/website/app". No Git repo required. Fast and simple. |
| **Git deploy** | User explicitly asks to deploy via Git/GitHub, or wants CI/CD with automatic redeploy on push. |

**Default to direct deploy** unless the user specifically requests Git-based deployment.

## Direct Deploy (Default)

Deploy the current local directory to Zeabur with one command.

### Flags

| Flag | Required | Description |
|------|----------|-------------|
| `--project-id` | Yes (non-interactive) | Project ID to deploy on |
| `--json` | Recommended | Output in JSON format |
| `--name` | No | Service name (defaults to directory name) |
| `--service-id` | No | Service ID to redeploy on (omit to create new service) |
| `--environment-id` | No | Environment ID (defaults to first environment) |

> **Note:** Do NOT use `--create`, `-r`, or `--region` flags with deploy commands. If the user needs to create a new project or select a region, use the `zeabur-project-create` skill first.

### First Deploy

When deploying for the first time, omit `--service-id` — a new service is created automatically:

```bash
npx zeabur@latest deploy --project-id <project-id> --json
```

The response includes a `service_id`. **You MUST save this `service_id` for all subsequent deploys.** Write it to the current project's `CLAUDE.md` immediately:

```markdown
## Zeabur Deployment
- Project ID: <project-id>
- Service ID: <service-id>
```

### Redeploy (Update Existing Service)

**IMPORTANT: When redeploying code changes, you MUST pass `--service-id` to update the existing service. Omitting `--service-id` creates a NEW duplicate service every time.**

```bash
npx zeabur@latest deploy --project-id <project-id> --service-id <service-id> --json
```

If no project exists yet, **invoke the `zeabur-project-create` skill** (do not run CLI commands directly).

## Git Deploy (On User Request)

If the user explicitly wants Git-based deployment (e.g. for CI/CD, auto-redeploy on push):

1. First, ensure the code is pushed to a GitHub repository.
2. Deploy via CLI:

```bash
# Non-interactive mode — required parameters only
npx zeabur@latest service deploy --json -i=false \
  --project-id <project-id> \
  --template GIT \
  --repo-id <repo-id> \
  --branch-name <branch>

# With optional service name
npx zeabur@latest service deploy --json -i=false \
  --project-id <project-id> \
  --template GIT \
  --repo-id <repo-id> \
  --branch-name <branch> \
  --name "<service-name>"
```

### Git Deploy Flags

| Flag | Required | Description |
|------|----------|-------------|
| `--template GIT` | Yes | Specifies Git-based deployment |
| `--project-id` | Non-interactive | Project ID (interactive mode will prompt) |
| `--repo-id` | Non-interactive | GitHub repository ID |
| `--branch-name` | Non-interactive | Git branch to deploy from |
| `--name` | No | Service name (defaults to repo name) |
| `--keyword` | No | Keyword to search GitHub repos (interactive mode) |

### Git Deploy Workflow

**Non-interactive (fully automated):**

```bash
# 1. Push code to GitHub
git init && git add . && git commit -m "Initial commit"
gh repo create my-app --public --source=. --push

# 2. Get GitHub repo ID (Zeabur uses GitHub's numeric repo ID)
REPO_ID=$(gh api repos/OWNER/my-app --jq .id)

# 3. Deploy from GitHub (PROJECT_ID must be known beforehand — see Prerequisites)
npx zeabur@latest service deploy --json -i=false \
  --project-id $PROJECT_ID \
  --template GIT \
  --repo-id $REPO_ID \
  --branch-name main
```

After deployment, Zeabur will auto-redeploy on every push to the selected branch.

Only guide the user through this flow when they specifically ask for Git-based deployment.

## Tips

- Direct deploy only requires `--project-id` — a new service is created automatically. No Git history or GitHub account required.
- For static sites, Zeabur auto-detects and serves them correctly.
- **Always save both Project ID and Service ID** after first deploy. This prevents duplicate services on redeploy.
- After deployment, use the `zeabur-deployment-logs` skill to check build and runtime logs.
