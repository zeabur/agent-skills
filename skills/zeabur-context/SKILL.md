---
name: zeabur-context
description: Use when setting up Zeabur CLI context for a project. Use when commands return wrong project's services or context errors. Use when env-id is required.
---

# Zeabur Context Setup

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method.

## The Pattern

```bash
# 1. Find project ID
npx zeabur@latest project list

# 2. Set project (NOTE: "project" is subcommand, not flag)
npx zeabur@latest context set project --id <project-id> -i=false -y

# 3. Set environment (interactive, auto-selects if only one env)
npx zeabur@latest context set env

# 4. Verify (shows project, environment, and service IDs)
npx zeabur@latest context get -i=false
```

## Why Set Environment Context

Many commands require `--env-id` (e.g. `service suspend`, `deployment log`, `service restart`). Once environment context is set, these commands auto-read env-id — no need to pass `--env-id` manually.

```bash
# Without context: must pass --env-id every time
npx zeabur@latest service suspend -i=false --id <id> --env-id <env-id>

# With context: env-id is read automatically
npx zeabur@latest service suspend -i=false --id <id>
```

## Common Mistakes

```bash
# ❌ WRONG - treats project-id as flag
npx zeabur@latest context set --project-id xxx

# ✅ CORRECT - "project" is subcommand
npx zeabur@latest context set project --id xxx -i=false -y
```

## Check Current Context

```bash
npx zeabur@latest context get -i=false
```

Output shows project, environment, and service IDs:

```
  CONTEXT       NAME                  ID
  Project       my-project            698b63146b07a3677cc4fc78
  Environment   production            698b63142579f38ed02c7b18
  Service       <not set>             <not set>
```
