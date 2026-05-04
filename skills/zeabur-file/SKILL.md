---
name: zeabur-file
description: Use when the user uploads a project file and you see `<UploadedFile>` in the message. Use when user says "看看這個專案", "分析程式碼", "check this project", "what's in this upload", or asks about the structure of an uploaded file.
---

# Zeabur File

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Trigger

When the user's message contains `<UploadedFile>upload_id</UploadedFile>`, extract the `upload_id` from inside the tag.

## Workflow

```bash
# 1. Pull the uploaded project to a local directory
npx zeabur@latest file pull <upload_id> /tmp/project -i=false

# 2. Explore with standard bash tools
ls /tmp/project
cat /tmp/project/package.json
find /tmp/project -name "*.ts" -o -name "*.js" | head -20
```

## Command

```bash
# Download all files from an upload to a local directory
npx zeabur@latest file pull <upload_id> [target-dir] -i=false
```

- Default target directory is `.` (current directory)
- Binary files (images, fonts, archives, etc.) are skipped automatically
- Directory structure is preserved

## Recommended Analysis Order

1. Pull the project: `npx zeabur@latest file pull <upload_id> /tmp/project -i=false`
2. List structure: `ls -la /tmp/project` and `find /tmp/project -type f`
3. Read config: `cat /tmp/project/package.json` (or `go.mod`, `requirements.txt`, `Cargo.toml`)
4. Read `Dockerfile` if present
5. Read entry point files (`src/main.*`, `index.*`, `app.*`)
6. Summarize findings and suggest deployment with the `zeabur-deploy` skill

## Tips

| Tip | Details |
|-----|---------|
| Binary files are skipped | Images, fonts, archives won't be downloaded |
| Use a temp directory | Pull to `/tmp/project` to keep the workspace clean |
| Use standard tools | After pulling, `grep`, `find`, `wc`, `cat` all work normally |
