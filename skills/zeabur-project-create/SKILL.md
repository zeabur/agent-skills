---
name: zeabur-project-create
description: Use when creating a new Zeabur project. Use when deploying templates to a new project. Use when user says "create project", "new project", or "set up a new environment".
---

# Zeabur Project Create

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Choosing a Region

**Do NOT hardcode or guess region codes.** Old region codes like `hnd1`, `tpe1` are deprecated. The region must always be derived from the user's server list.

**Step 1 — List the user's servers:**

```bash
npx zeabur@latest server list -i=false
```

**Step 2 — Use the server ID with `server-` prefix as the region:**

The region code format is `server-<server-id>`, where `<server-id>` comes from the server list output.

- If the user has **no servers**, guide them to rent one first using the `zeabur-server-rent` skill (or `zeabur-server-catalog` to browse options).

> Some templates (e.g. with `REQUIRE_DEDICATED_SERVER`) can only be deployed on dedicated servers. If you get `Unsupported template (code: REQUIRE_DEDICATED_SERVER)`, rent a dedicated server and recreate the project with its region.

## Create Project

```bash
# Create project with name and region (region must be server-<server-id>)
npx zeabur@latest project create -n "<project-name>" -r "server-<server-id>" -i=false
```

## Get Project ID

```bash
# List projects and find ID
npx zeabur@latest project list -i=false 2>/dev/null | grep "<project-name>"

# Extract ID (first column, strip ANSI codes)
PROJECT_ID=$(npx zeabur@latest project list -i=false 2>/dev/null | grep "<project-name>" | awk '{print $1}' | sed 's/\x1b\[[0-9;]*m//g')
```

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
# 1. Find server ID
npx zeabur@latest server list -i=false

# 2. Create project (use server-<id> from step 1)
npx zeabur@latest project create -n "wrenai-prod" -r "server-<server-id>" -i=false

# 3. Get project ID
PROJECT_ID=$(npx zeabur@latest project list -i=false 2>/dev/null | grep "wrenai-prod" | awk '{print $1}' | sed 's/\x1b\[[0-9;]*m//g')
echo "Project ID: $PROJECT_ID"
echo "Dashboard: https://zeabur.com/projects/$PROJECT_ID"

# 4. Deploy template (non-interactive)
npx zeabur@latest template deploy -i=false -f template.yml --project-id $PROJECT_ID --var PUBLIC_DOMAIN=myapp
```

## See Also

- `zeabur-template-deploy` — detailed template deployment flags and troubleshooting
- `zeabur-server-rent` — rent a dedicated server before creating a project on it
