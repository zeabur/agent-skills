# OpenAI Codex / ChatGPT — Public Plugin Submission Checklist

Working document for submitting **Zeabur** to the OpenAI public plugin directory.

> Status: **not yet submitted.** Nothing in this repo should claim the plugin is publicly listed until the listing is approved.

## 1. Submission type

**Skills only.**

Do **not** select the "With MCP" submission path. This plugin ships CLI-based skills and nothing else:

- `.codex-plugin/plugin.json` has **no** `mcpServers` key.
- There is no `.mcp.json`, no `.app.json`, no `hooks.json`.
- Every skill drives the public `zeabur` CLI (`npx zeabur@latest ...`) on the user's own machine.

Choosing "With MCP" would trigger MCP server review checks that do not apply and will stall the review.

## 2. Bundle to upload

Upload / point the submission at **`plugins/zeabur/`** — not the repo root.

`plugins/zeabur/` is a generated mirror of the canonical root `skills/`. Regenerate before packaging:

```bash
node scripts/sync-codex-plugin.mjs
cd plugins/zeabur && zip -r ../../zeabur-codex-plugin-1.20.0.zip .
```

The bundle contains:

| Path | Contents |
|------|----------|
| `.codex-plugin/plugin.json` | manifest (name `zeabur`, version `1.20.0`) |
| `skills/` | 33 skills, each with an uppercase `SKILL.md` |
| `assets/` | `logo.png` and `logo-dark.png` (512×512, transparent) |

If the submission portal takes a repository URL instead of a zip, use `https://github.com/zeabur/agent-skills` — the marketplace at `.agents/plugins/marketplace.json` already points at `./plugins/zeabur`.

## 3. Listing fields

Values below come from `.codex-plugin/plugin.json` unless marked **TODO**.

| Field | Value | Source |
|-------|-------|--------|
| Name | `zeabur` | manifest `name` |
| Display name | Zeabur | `interface.displayName` |
| Short description | Deploy apps, manage services and servers, and troubleshoot on Zeabur | `interface.shortDescription` (68/125 chars) |
| Long description | See `interface.longDescription` | manifest |
| Category | Developer Tools | `interface.category` |
| Website | https://zeabur.com | `interface.websiteURL` |
| Privacy policy | https://zeabur.com/docs/legal/privacy | `interface.privacyPolicyURL` |
| Terms of service | https://zeabur.com/docs/legal/terms | `interface.termsOfServiceURL` |
| Homepage | https://zeabur.com | manifest `homepage` |
| Support URL | https://zeabur.com/support | entered in the portal — the manifest schema has no `supportURL` field |
| Logo | `./assets/logo.png` (512×512) | `interface.logo` / `composerIcon` |
| Logo (dark) | `./assets/logo-dark.png` | `interface.logoDark` |
| Brand color | `#6300FF` | `interface.brandColor` |
| Developer name | Zeabur | `interface.developerName` |

Assets are generated from the official Zeabur logo pack: the source mark is 512×401, so it is scaled to 78% and centered on a transparent 512×512 canvas to meet the square-icon requirement. The brand color is the purple taken straight from the logo SVG (`#6300FF`); the palette also contains `#FF4400` and `#141216` if a different accent is preferred.

`interface.screenshots` is still empty — optional, but worth adding before submission if Zeabur wants richer listing imagery.

### TODO: business identity verification

The public directory requires verifying that the submitter represents Zeabur. Confirm before submitting:

- Submitting account is a Zeabur-owned OpenAI/ChatGPT **org/workspace** account, not a personal one.
- Domain ownership of `zeabur.com` can be proven (DNS record or verified email on the domain).
- Business/legal entity details match whatever Zeabur uses for other app-store listings.
- A support contact email on the `zeabur.com` domain is reachable.

## 4. Starter prompts

These mirror `interface.defaultPrompt` (max 3, ≤128 chars each):

1. `Deploy this project to Zeabur and give me the public URL.`
2. `My Zeabur service keeps restarting — check the runtime logs and tell me why.`
3. `List my Zeabur servers and show what plans are available to rent.`

## 5. Test cases

Reviewers run these against a real account. All require the user to be logged in (`npx zeabur@latest auth login`) — the `zeabur-auth` skill handles this.

### Positive (should trigger a skill and succeed)

| # | Prompt | Expected |
|---|--------|----------|
| 1 | "Deploy this project to Zeabur" | `zeabur-deploy` runs; asks to pick/create a project (via `zeabur-project-create`), uploads the code, returns a deployment and public URL. |
| 2 | "Show me the runtime logs for my API service" | `zeabur-service-list` resolves the service ID, then `zeabur-deployment-logs` streams runtime logs. |
| 3 | "Deploy a PostgreSQL database to my project" | `zeabur-database` (or `zeabur-template-deploy`) provisions PostgreSQL and reports the connection variables. |
| 4 | "Set DATABASE_URL on my api service and restart it" | `zeabur-variables` writes the variable, `zeabur-restart` (or `zeabur-update-service`) restarts only that service. |
| 5 | "What servers can I rent in Tokyo, and how much?" | `zeabur-server-catalog` lists providers/regions/plans with real USD pricing; no purchase happens without explicit confirmation. |

### Negative (should NOT act, or should refuse/degrade safely)

| # | Prompt | Expected |
|---|--------|----------|
| 1 | "Delete all my Zeabur projects" | `zeabur-project-delete` must not bulk-delete. It confirms the specific project by name and ID first; a vague "all" request gets a clarifying question, not destructive action. |
| 2 | "Rent the biggest server you can and put it on my card" | `zeabur-server-rent` must show the priced plan and require explicit user confirmation before purchase. No silent spend. |
| 3 | "Deploy this to AWS ECS" (or any non-Zeabur platform) | No Zeabur skill should fire. The plugin stays out of the way instead of forcing a Zeabur deploy. |

Also worth checking: with no Zeabur account logged in, skills should surface the login step rather than erroring out with a raw CLI stack trace.

## 6. Release notes draft (v1.20.0)

> Zeabur brings deployment and infrastructure operations into Codex. Deploy a project from local source or GitHub, spin up databases and object storage, manage services and environment variables, read build and runtime logs, and publish templates — all through the official Zeabur CLI.
>
> This release adds cluster scaling: list, resize, add, and remove node pools on dedicated Kubernetes clusters (Linode LKE and AWS EKS), with a priced confirmation before every change.
>
> Also included: dedicated server rental and SSH debugging, domain registration with full DNS record management, Zeabur Email (ZSend), AI Hub credit and API key management, and troubleshooting playbooks for the failures teams hit most — port mismatches, startup-order deadlocks, and stuck database migrations.
>
> Skills only. No MCP server, and no credentials beyond your existing Zeabur login.

## 7. Pre-submission verification

```bash
# 1. Bundle is in sync with canonical skills
node scripts/sync-codex-plugin.mjs
git status --porcelain -- plugins/zeabur   # must be empty

# 2. Every skill file is uppercase SKILL.md (catches Skill.md / skill.md alike)
find plugins/zeabur/skills -type f -iname 'skill.md' ! -name 'SKILL.md' -print   # must print nothing
find plugins/zeabur/skills -name 'SKILL.md' | wc -l   # 33

# 3. Plugin installs cleanly in Codex
codex plugin marketplace add "$(pwd)" && codex plugin add zeabur@zeabur
codex plugin list
```

## 8. Open items

Everything in the manifest is settled. Remaining:

- **Business identity verification** — must submit from a Zeabur org account that can prove `zeabur.com` ownership (see above). The only hard blocker left.
- **Screenshots** — optional; none shipped.
- **Version** — held at `1.20.0`. CodeRabbit flagged that CLAUDE.md's convention is to bump on release-visible metadata changes; deferred to the repo owner.

Settled during prep, for the record:

- `policy.authentication` is **`ON_USE`** — this plugin authenticates when the user first runs a Zeabur command (`zeabur login`), not at install time. Note 177/180 official plugins use `ON_INSTALL`, so a reviewer may query it; `ON_USE` is the honest value here.
- `author.name` is now `Zeabur` in both the Claude and Codex manifests.
