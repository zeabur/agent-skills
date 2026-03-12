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

## Choosing a Deploy Method

Zeabur supports two ways to deploy a project:

| Method | When to use |
|--------|-------------|
| **Direct deploy** (default) | User says "deploy this project/website/app". No Git repo required. Fast and simple. |
| **Git deploy** | User explicitly asks to deploy via Git/GitHub, or wants CI/CD with automatic redeploy on push. |

**Default to direct deploy** unless the user specifically requests Git-based deployment.

## Direct Deploy (Default)

Deploy the current local directory to Zeabur with one command. Only `--project-id` is required — a new service is created automatically when `--service-id` is omitted.

```bash
# Deploy current directory (creates a new service automatically)
npx zeabur@latest deploy --project-id <project-id> --json

# Deploy with a custom service name
npx zeabur@latest deploy --project-id <project-id> --name my-app --json

# Redeploy to an existing service
npx zeabur@latest deploy --project-id <project-id> --service-id <service-id> --json
```

### Flags

| Flag | Required | Description |
|------|----------|-------------|
| `--project-id` | Yes (non-interactive) | Project ID to deploy on |
| `--json` | Recommended | Output in JSON format |
| `--name` | No | Service name (defaults to directory name) |
| `--service-id` | No | Service ID to redeploy on (omit to create new service) |
| `--environment-id` | No | Environment ID (defaults to first environment) |
| `--domain` | No | Bind a domain (e.g. `myapp.zeabur.app`) |

> **Note:** Do NOT use `--create`, `-r`, or `--region` flags with deploy commands. If the user needs to create a new project or select a region, use the `zeabur-project-create` skill first.

### Example Workflow

```bash
# 1. Navigate to the project directory
cd /path/to/project

# 2. Deploy directly (new service created automatically)
npx zeabur@latest deploy --project-id <project-id> --json
```

No Git repository, no GitHub, no extra steps needed. If no project exists yet, **invoke the `zeabur-project-create` skill** (do not run CLI commands directly).

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
- When binding a domain with `--domain`, if the user did not specify an exact domain name, you MUST append a random suffix (e.g. `myapp-a3x7.zeabur.app` instead of `myapp.zeabur.app`) to avoid conflicts with existing domains. Only use the exact name when the user explicitly provides it.
- After a successful deployment, offer to save the Project ID and Service ID to the current project's `CLAUDE.md` (preferred) or `README.md`. This way future conversations can skip the "which project?" step and deploy directly.
## See Also

- `zeabur-project-create` — create a project if none exists
- `zeabur-deployment-logs` — check logs after deployment
