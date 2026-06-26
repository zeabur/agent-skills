#!/usr/bin/env node
// Generates plugins/zeabur/ (the Codex plugin) from the canonical root skills/.
//
// Why this exists: Codex's plugin marketplace requires the plugin to live in a
// SUBDIRECTORY with its skills physically inside it — it cannot point at the repo
// root, and it does not follow symlinks or "../" paths when copying to its cache.
// Meanwhile the root skills/ must stay put because Claude's plugin is the repo root
// and zeabur.com reads zeabur-claude-plugin/skills via a submodule. So plugins/zeabur/
// is a GENERATED mirror of root skills/ — edit skills in root only, then re-run this.
//
// Usage: node scripts/sync-codex-plugin.mjs
// CI verifies the committed output matches (see .github/workflows/codex-plugin-sync.yml).

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'plugins', 'zeabur');

await rm(out, { recursive: true, force: true });
await mkdir(path.join(out, '.codex-plugin'), { recursive: true });

// Mirror the canonical skills into the Codex plugin directory.
await cp(path.join(root, 'skills'), path.join(out, 'skills'), { recursive: true });

// Reuse the root Codex plugin manifest; its skills path ("./skills/") already
// resolves correctly relative to the plugin directory.
const manifest = JSON.parse(
  await readFile(path.join(root, '.codex-plugin', 'plugin.json'), 'utf8'),
);
manifest.skills = './skills/';
await writeFile(
  path.join(out, '.codex-plugin', 'plugin.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);

console.log('Synced plugins/zeabur/ from root skills/ and .codex-plugin/plugin.json');
