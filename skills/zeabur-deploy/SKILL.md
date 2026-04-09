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

## Post-Deploy Verification (MANDATORY)

**A green CLI exit code is NOT proof of a working deploy.** `zeabur deploy` can return `"status": "success"` while the build picked the wrong buildpack, the container crashes on boot, or the proxy returns 502 on every request. **Every deploy MUST end with the checks below before you report "deployed" to the user.** If any check fails, jump straight to the triage table in the next section — do not retry the same deploy and do not bail out to the user with "it failed, not sure why".

1. **Build log — confirm the correct builder ran**
   ```bash
   npx zeabur@latest deployment log --service-id <svc> -t build -i=false 2>&1 | tail -40
   ```
   Look for the builder you expect (e.g. `zbpack: detected Next.js`, `Dockerfile: …`). Seeing `detected static` for a Node/Python/Go app means the wrong directory was uploaded — re-run the deploy from inside the correct subdirectory.

2. **Runtime log — confirm the process booted**
   ```bash
   npx zeabur@latest deployment log --service-id <svc> -t runtime -i=false 2>&1 | tail -40
   ```
   Look for `listening`, `Ready`, `started on port N`, or your app's own ready marker. A stack trace here means a runtime failure, not a deploy failure — still route via the triage table.

3. **HTTP smoke-test — hit the public URL**
   ```bash
   curl -s -o /dev/null -w "HTTP %{http_code}\n" https://<service>.zeabur.app/
   ```
   2xx/3xx = good. 502 = port mismatch or nothing listening. 404 on every route while CLI says success = wrong directory uploaded.

4. **Process sanity — only if steps 1–3 look suspicious**
   ```bash
   npx zeabur@latest service exec --id <svc> -- ps aux
   ```
   If PID 1 is `caddy run --config /etc/caddy/Caddyfile` and you expected Node/Python/Go/your own Dockerfile, the wrong buildpack was selected — re-deploy from the correct directory.

**Do not mark the deploy complete until all four checks pass (or until you've handed off to a specific sibling skill with a concrete next command).**

## Verify-and-Fix Loop (Fix Until It Succeeds)

A deploy is **not done until the verification checks above all pass**. When any check fails, you MUST enter the loop below. Do NOT bail out to the user after one failed attempt, and do NOT loop forever.

### The loop

```
1. DEPLOY      →  npx zeabur@latest deploy --project-id <p> --service-id <svc> --json
2. VERIFY      →  run all four Post-Deploy Verification checks above
3. IF all four pass:
      report "deployed and verified" + public URL, STOP.
4. IF any check fails:
      a. DIAGNOSE  — match the failing symptom in the triage table below,
                     invoke the named sibling skill
      b. FIX       — apply the fix (edit Dockerfile / env var / port / cd
                     into correct subdir / etc.)
      c. REDEPLOY  — same command as step 1, ALWAYS with --service-id
                     (never omit, or you'll create a duplicate service)
      d. GOTO 2.
5. BUDGET: max 3 fix attempts per round. After the 3rd failed verification,
   PAUSE the loop and ASK the user: continue or skip?
     - "continue" → reset the counter and run up to 3 more attempts
     - "skip"     → stop the loop, report current state, leave the service as-is
   Do not resume the loop on your own after the budget is hit — the user
   must explicitly say "continue".
```

The first deploy does not count against the budget — only the fix→redeploy cycles do. So one round of the loop is: 1 initial deploy + up to 3 fix+redeploy cycles = 4 total deploys, then pause for user input.

### Budget-exhausted pause (what to ask the user)

When you hit the 3-attempt budget, do NOT keep trying silently and do NOT just report failure and stop. Instead, pause and present the user with the exact structured message below so they can make an informed continue-or-skip decision:

```
Deploy loop paused — 3 fix attempts used, still failing.

Current symptom: <one-line description, e.g. "HTTP 502, proxy expects port 8080, container listening on 3000">

Attempts so far:
  1. <fix applied> → <what happened on re-verify>
  2. <fix applied> → <what happened on re-verify>
  3. <fix applied> → <what happened on re-verify>

Hypothesis for next attempt: <what you'd try next and why>
Blocker / uncertainty: <what makes you unsure — missing info, ambiguous symptom, etc.>

Continue (3 more attempts) or skip (stop here and leave the service as-is)?
```

- If the user says **continue** → reset the attempt counter to 0, resume the loop from step 1 with the hypothesis above as attempt 1 of the new round.
- If the user says **skip** → stop the loop immediately, print the final state (public URL, last curl status, last runtime log line), and do NOT mark the deploy as successful.
- If the user provides a specific fix instead of choosing → apply it as attempt 1 of a new round; the counter resets.

### Triage table (lookup used in step 4a)

| Failing check / symptom | Next skill to invoke | First diagnostic command |
|---|---|---|
| CLI exited non-zero, or build log ends in compile/install error | `zeabur-deployment-logs` | `deployment log --service-id <svc> -t build -i=false \| tail -80` |
| Build log shows zbpack detected the wrong project type (e.g. `static` for a Node app) | **Fix immediately:** `cd` into the correct subdir, then redeploy | `deployment log --service-id <svc> -t build -i=false \| head -40` |
| Runtime crashes on boot with a stack trace | `zeabur-deployment-logs` | `deployment log --service-id <svc> -t runtime -i=false \| tail -80` |
| `dial tcp …: i/o timeout`, `connection refused` from proxy, or **502 Bad Gateway** | `zeabur-port-mismatch` | `service network --id <svc>` |
| Stuck on `Waiting for database migrations to complete` | `zeabur-migration` | `deployment log --service-id <svc> -t runtime -i=false \| tail -40` |
| `Connection refused` / `CannotConnectNowError` / `database system is starting up` to Postgres/Redis/MySQL on boot (`:5432`, `:6379`, `:3306`) — including the "DB is up but still recovering" case, not just TCP refused | `zeabur-startup-order` | `deployment log --service-id <svc> -t runtime -i=false \| tail -40` |
| `Name or service not known` / DNS resolution fails for an internal hostname (e.g. `redis:6379`, `postgres:5432`) because the sibling service does not exist in the project at all | `zeabur-service-list` → then `zeabur-template` if you need to provision it | `service list --project-id <proj> -i=false` |
| Env var empty at runtime, `SERVICE_NOT_FOUND`, or `${VAR}` not expanding | `zeabur-variables` | `variable list --id <svc> -i=false` |
| CLI exit 0 + `"status": "success"` + public URL 404s on every route | **Fix immediately:** `cd` into the correct subdir, then redeploy | `service exec --id <svc> -- ps aux` |
| Redirects to wrong URL, CORS error, or trailing-slash issue from `${ZEABUR_WEB_URL}` | `zeabur-domain-url` | `domain list --id <svc> -i=false` |
| None of the above but the container is clearly wrong | `zeabur-service-exec` | `service exec --id <svc> -- sh` |

### Stop conditions (when to break out of the loop)

| Condition | Action |
|---|---|
| All four verification checks pass | Report **"deployed and verified"** with the public URL and stop |
| 3 fix attempts exhausted (budget hit) | **Pause and ask the user: continue (3 more attempts) or skip?** — use the exact structured message shown above |
| Fix requires a secret / credential / API key you don't have | Escalate — ask the user for the specific value, name the env var |
| Fix requires a product or business decision (which value? which region? which branch?) | Escalate — ask the specific question, do not guess |
| The same symptom recurs after a fix that should have addressed it | Escalate — your diagnosis is wrong; do not burn more attempts guessing |
| Fix would touch code outside the current working tree (e.g. a dependency repo) | Escalate — out of scope for this loop |

### Hard rules

- **Never report "deployed" on a failing verification.** The CLI's `"status": "success"` is not your source of truth — the four Post-Deploy Verification checks are.
- **Never silently give up, and never silently keep trying past the budget.** After 3 attempts you MUST pause and ask the user continue-or-skip. Do not start a 4th attempt on your own initiative.
- **Always reuse `--service-id` on every redeploy inside the loop.** Omitting it creates a duplicate service and makes the loop useless — your next verification will check the wrong service.
- **Do not retry the same fix twice.** If attempt 1 and attempt 2 applied the same change, your diagnosis is wrong — pause early and ask the user instead of wasting attempt 3.
