# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zeabur Claude Plugin — a Claude Code plugin providing CLI-based skills for managing Zeabur deployments, templates, and troubleshooting. There is no build system, no compiled code, and no dependencies. The entire plugin is declarative markdown-based skill files.

## Architecture

- `.claude-plugin/plugin.json` — Plugin manifest (name, version, metadata)
- `skills/<skill-name>/SKILL.md` — Each skill is a standalone markdown file with YAML frontmatter (`name`, `description`) followed by structured documentation (problem → cause → solution → examples)

### Skill Categories

| Category | Skills |
|----------|--------|
| Deployment & Logs | `zeabur-deploy`, `zeabur-deployment-logs`, `zeabur-template-deploy`, `zeabur-template-backup` |
| Service Management | `zeabur-service-list`, `zeabur-restart`, `zeabur-update-service`, `zeabur-variables` |
| Server Management | `zeabur-server-list`, `zeabur-server-catalog`, `zeabur-server-rent` |
| Project Management | `zeabur-project-create` |
| Troubleshooting | `zeabur-domain-url`, `zeabur-migration`, `zeabur-port-mismatch`, `zeabur-startup-order` |

## Conventions

- **Commits**: Conventional Commits format in English (e.g., `feat:`, `fix:`, `docs:`)
- **Skill file naming**: `SKILL.md` inside a kebab-case directory prefixed with `zeabur-`
- **CLI commands**: All skills use `npx zeabur@latest` as the CLI entry point
- **Skill structure**: YAML frontmatter → symptom/problem → root cause → solution with bash commands → examples/tips

## Releasing

After making changes:

1. Bump `version` in `.claude-plugin/plugin.json` (semver)
2. Update the changelog in `README.md`
3. Push to `main` — users can then run `claude plugin update zeabur@zeabur` to get the latest
