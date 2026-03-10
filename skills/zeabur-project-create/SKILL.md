---
name: zeabur-project-create
description: Use when creating a new Zeabur project. Use when deploying templates to a new project. Use when user says "create project", "new project", or "set up a new environment".
---

# Zeabur Project Create

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Create Project

```bash
# Create project with name and region
npx zeabur@latest project create -n "<project-name>" -r "<region>" -i=false

# Example
npx zeabur@latest project create -n "my-app" -r "hnd1" -i=false
```

## Get Project ID

```bash
# List projects and find ID
npx zeabur@latest project list -i=false 2>/dev/null | grep "<project-name>"

# Extract ID (first column, strip ANSI codes)
PROJECT_ID=$(npx zeabur@latest project list -i=false 2>/dev/null | grep "<project-name>" | awk '{print $1}' | sed 's/\x1b\[[0-9;]*m//g')
```

## Choosing a Region (Dedicated Server)

**Do NOT hardcode or guess region options.** Always check the user's available servers first:

```bash
# 1. List the user's existing dedicated servers
npx zeabur@latest server list -i=false
```

- If the user has servers, let them pick one and use `server-<server-id>` as the region:

```bash
npx zeabur@latest project create -n "my-app" -r "server-<server-id>" -i=false
```

- If the user has **no servers**, guide them to rent one first:

```bash
# Browse available server options
npx zeabur@latest server catalog -i=false

# Rent a server (user picks provider/region/plan from catalog)
npx zeabur@latest server rent --provider <code> --region <id> --plan <name> -y -i=false
```

Then use the new server's ID to create the project.

> Some templates (e.g. with `REQUIRE_DEDICATED_SERVER`) can only be deployed on dedicated servers. If you get `Unsupported template (code: REQUIRE_DEDICATED_SERVER)`, rent a dedicated server and recreate the project with its region.

## Deploy Template to Project

```bash
# Deploy template file to specific project (non-interactive)
npx zeabur@latest template deploy -i=false \
  -f <template-file> \
  --project-id <project-id> \
  --var PUBLIC_DOMAIN=myapp \
  --var KEY=value
```

## Workflow

```bash
# 1. Create project
npx zeabur@latest project create -n "wrenai-prod" -r "hnd1" -i=false

# 2. Get project ID
PROJECT_ID=$(npx zeabur@latest project list -i=false 2>/dev/null | grep "wrenai-prod" | awk '{print $1}' | sed 's/\x1b\[[0-9;]*m//g')
echo "Project ID: $PROJECT_ID"
echo "Dashboard: https://zeabur.com/projects/$PROJECT_ID"

# 3. Deploy template (non-interactive)
npx zeabur@latest template deploy -i=false -f template.yml --project-id $PROJECT_ID --var PUBLIC_DOMAIN=myapp
```

## See Also

- `zeabur-template-deploy` — detailed template deployment flags and troubleshooting
- `zeabur-server-rent` — rent a dedicated server before creating a project on it
