# AGENTS.md

This file provides guidance to OpenAI Codex when working with this repository.

## Project Overview

Zeabur Agent Skills — a plugin providing CLI-based skills for managing Zeabur deployments, templates, and troubleshooting. Compatible with both Claude Code and OpenAI Codex. There is no build system, no compiled code, and no dependencies. The entire plugin is declarative markdown-based skill files.

## Architecture

- `.codex-plugin/plugin.json` — Codex plugin manifest
- `.claude-plugin/plugin.json` — Claude Code plugin manifest
- `skills/<skill-name>/SKILL.md` — Each skill is a standalone markdown file with YAML frontmatter (`name`, `description`) followed by structured documentation

### Skill Categories

| Category | Skills |
|----------|--------|
| Deployment & Logs | `zeabur-deploy`, `zeabur-dockerfile`, `zeabur-deployment-logs`, `zeabur-template-deploy`, `zeabur-template-backup` |
| Service Management | `zeabur-service-list`, `zeabur-service-delete`, `zeabur-service-exec`, `zeabur-service-metric`, `zeabur-restart`, `zeabur-update-service`, `zeabur-variables` |
| Server Management | `zeabur-server-list`, `zeabur-server-catalog`, `zeabur-server-rent` |
| Project Management | `zeabur-project-create`, `zeabur-project-delete` |
| Domain & Email | `zeabur-domain-register`, `zeabur-domain-dns`, `zeabur-domain-url`, `zeabur-email` |
| AI Hub | `zeabur-ai-hub` |
| Auth | `zeabur-auth` |
| Troubleshooting | `zeabur-migration`, `zeabur-port-mismatch`, `zeabur-startup-order` |

### Skill Structure Patterns

Skills follow two main patterns:

- **Troubleshooting skills**: symptom/problem → root cause → solution with bash commands → examples/tips
- **Management/action skills**: prerequisites → workflow steps → CLI commands → error handling

## Conventions

- **Skill file naming**: `SKILL.md` inside a kebab-case directory prefixed with `zeabur-`
- **CLI commands**: All skills use `npx zeabur@latest` as the CLI entry point
