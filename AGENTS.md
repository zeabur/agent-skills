# AGENTS.md

This file provides guidance to OpenAI Codex when working with this repository.

## Project Overview

Zeabur Agent Skills — a plugin providing CLI-based skills for managing Zeabur deployments, templates, and troubleshooting. Compatible with both Claude Code and OpenAI Codex. There is no build system, no compiled code, and no dependencies. The entire plugin is declarative markdown-based skill files.

## Architecture

- `.codex-plugin/plugin.json` — Codex plugin manifest
- `.claude-plugin/plugin.json` — Claude Code plugin manifest
- `skills/<skill-name>/SKILL.md` — Each skill is a standalone markdown file with YAML frontmatter (`name`, `description`) followed by structured documentation

## Conventions

- **Skill file naming**: `SKILL.md` inside a kebab-case directory prefixed with `zeabur-`
- **CLI commands**: All skills use `npx zeabur@latest` as the CLI entry point
- **Skill structure**: YAML frontmatter → symptom/problem → root cause → solution with bash commands → examples/tips
