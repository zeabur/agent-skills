---
name: zeabur-deploy
description: Use when deploying a local project or codebase to Zeabur. Use when the user says "deploy this", "deploy to Zeabur", "deploy from GitHub", "search my repos", or "find my repository". Default to direct deploy unless the user explicitly asks for Git-based deployment.
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

If the user asks to deploy to a specific **server** (e.g. "deploy to my AWS Tokyo server"), do **NOT** SSH into the server. Servers running ZeaburOS are managed via the platform — you deploy services through the Zeabur CLI, not by manually placing files on the machine.

> **Only ZeaburOS servers can host projects.** A rented server starts as plain
> Ubuntu (base OS and SSH, no Zeabur services); ZeaburOS has to be installed on
> it first — see the `zeabur-server-rent` skill. If deploying to a server fails
> because it has no Zeabur services, that is why; tell the user instead of
> trying to set the machine up over SSH.

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

> **Run from the workspace root.** `zeabur deploy` tars the current working directory; if you are in a subdirectory the tarball will be missing files the build needs. For monorepos, this means `cd` to the repo root before deploying — even when deploying a single service. The tarball respects `.dockerignore` for excluding files like `.venv`, `node_modules`, nested git repos.

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

> **Do NOT use this flow for version upgrades / downgrades of prebuilt or marketplace services** (e.g. "upgrade PostgreSQL to 16", "downgrade n8n to 1.2"). That is a version switch, not a code redeploy — use the **`zeabur-update-service`** skill's tag update instead. Redeploying in place of a tag change can orphan or wipe the service's mounted disk.

If no project exists yet, **invoke the `zeabur-project-create` skill** (do not run CLI commands directly).

### Monorepo with multiple Dockerfiles

If the project has more than one app to deploy (e.g. `apps/api` + `apps/jobs` each with its own Dockerfile in `infra/zeabur/`), do NOT keep swapping a root `zbpack.json` between deploys. Instead, set the per-service env var **`ZBPACK_DOCKERFILE_PATH`** which zbpack reads ahead of `zbpack.json`:

```bash
# After first deploy of each service, set the dockerfile path on that service
npx zeabur@latest variable update --id <api-service-id> \
  -k 'ZBPACK_DOCKERFILE_PATH=infra/zeabur/api.Dockerfile' -y -i=false

npx zeabur@latest variable update --id <jobs-service-id> \
  -k 'ZBPACK_DOCKERFILE_PATH=infra/zeabur/jobs.Dockerfile' -y -i=false
```

Subsequent `deploy --service-id <id>` redeploys then build with the right Dockerfile without any root config swap. The build context remains the workspace root, so the Dockerfile can `COPY infra/db/`, `COPY apps/<svc>/`, `COPY packages/` from the same context.

If you do use `zbpack.json`, the schema is **nested**, not flat:

```json
{ "dockerfile": { "path": "infra/zeabur/api.Dockerfile" } }
```

`{"dockerfile": "..."}` (flat string) is silently ignored — zbpack falls back to language autodetection (e.g. `planType=python`) and the build won't use your Dockerfile.

## Git Deploy (On User Request)

> **Caveat (observed 2026-04):** `service deploy --template GIT --repo-id ... --branch-name ...` accepts the flags and returns success, but the resulting service is created as `Template=PREBUILT_V2` with `Status=SUSPENDED` and `GitTrigger=null` — the Git source is NOT actually wired and `service redeploy` errors with `Internal Server Error`. Direct deploy is the working path. Only use Git deploy after you've confirmed the Zeabur GitHub App is installed on the org and the dashboard reflects a real Git binding for the service. If unsure, default to direct deploy.

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

**Git deploy workflow:**

```bash
# 1. Search for the user's GitHub repo
npx zeabur@latest service search-repo <keyword> --json -i=false
# Returns: [{"Name":"my-app","Owner":"user","URL":"...","ID":12345}, ...]
# If multiple results are returned, ask the user which repo to deploy.
# The agent (not the CLI) is responsible for disambiguation.

# 2. Deploy from GitHub using the repo ID from search results
npx zeabur@latest service deploy --json -i=false \
  --project-id $PROJECT_ID \
  --template GIT \
  --repo-id <repo-id> \
  --branch-name main
```

After deployment, Zeabur will auto-redeploy on every push to the selected branch.

Only guide the user through this flow when they specifically ask for Git-based deployment.

## Tips

- Direct deploy only requires `--project-id` — a new service is created automatically. No Git history or GitHub account required.
- For static sites, Zeabur auto-detects and serves them correctly.
- **Always save both Project ID and Service ID** after first deploy. This prevents duplicate services on redeploy.
- After deployment, use the `zeabur-deployment-logs` skill to check build and runtime logs.
- **Don't retry a hung deploy without checking first.** If `zeabur deploy` looks stuck (no output for a while), the upload may already be in flight on Zeabur's side. Re-running creates a duplicate service. Check `service list` before retrying — the named service may already exist with a numeric or letter suffix appended (e.g. `api-toops` when you asked for `api`).
- **Verify `planType=docker`** in the resulting deployment. Run `npx zeabur@latest deployment list --service-id <id> -i=false --json` after deploy and check the latest entry's `planType`. If it shows `python` / `nodejs` / etc. when you have a Dockerfile, zbpack didn't find your Dockerfile — most likely cause is the wrong cwd, the wrong `zbpack.json` schema, or the Dockerfile sitting outside the upload tarball.
