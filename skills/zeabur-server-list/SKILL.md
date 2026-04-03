---
name: zeabur-server-list
description: Use when listing dedicated servers. Use when checking server status, IP, or provider info. Use when user says "show my servers", "SSH into server", or "check server status". Do NOT use for browsing purchasable servers (use zeabur-server-catalog instead).
---

# Zeabur Server List & Get

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## List All Servers

```bash
npx zeabur@latest server list -i=false
```

## Output Example

```
     ID              NAME        IP              PROVIDER   LOCATION         STATUS   VM STATUS
-----------------+-------------+---------------+----------+----------------+--------+----------
 6989b00fd42b...   my-server    103.45.67.89    Hetzner    Singapore, SG    Online   RUNNING
 6989b00fd42b...   dev-box      45.67.89.12     Vultr      Tokyo, JP        Online   RUNNING
```

## Get Server Details

```bash
# By server ID
npx zeabur@latest server get <server-id> -i=false
```

Shows detailed info: CPU/memory/disk usage, provider, location, managed status, creation time.

## Reboot a Server

```bash
npx zeabur@latest server reboot <server-id> -y
```

**`-y` skips confirmation prompt** — required for non-interactive use.

## Servers and Projects

Each dedicated server can have Zeabur projects bound to it. A project's `Region.ID` will be `server-<server-id>` when it is deployed on a dedicated server.

- **To deploy a service to a server**, use the `zeabur-deploy` skill with the project bound to that server — do NOT SSH in and manually set up web servers or copy files.
- **SSH is for low-level debugging only** (e.g. checking kubectl, inspecting disk, network diagnostics). It is not needed for deploying or managing services.

## SSH into a Server (Debugging Only)

```bash
npx zeabur@latest server ssh <server-id>
```

For managed servers, the password is fetched automatically. If `sshpass` is installed, login is fully automatic; otherwise the password is printed for manual entry.

### Non-Interactive SSH (Running Remote Commands)

In non-interactive environments (e.g. Claude Code, CI/CD), you cannot use an interactive SSH session. Instead, **pipe commands via stdin** with `-i=false`:

```bash
echo 'kubectl get pods -A' | npx zeabur@latest server ssh <server-id> -i=false
```

For multiple commands, separate them with `;` or `&&`:

```bash
echo 'kubectl get pods -A; kubectl get svc -A' | npx zeabur@latest server ssh <server-id> -i=false
```

**Important notes:**

- The output includes the server's MOTD (Message of the Day) banner. Filter it out when parsing results:
  ```bash
  echo 'kubectl get pods -A' | npx zeabur@latest server ssh <server-id> -i=false 2>&1 \
    | grep -v "Welcome\|Documentation\|Management\|Support\|System load\|Usage of /\|Memory usage\|Swap usage\|Strictly\|just raised\|https://ubuntu\|Expanded\|updates can\|To see these\|Enable ESM\|See https://ubuntu\|New release\|Run 'do-release\|restart required\|INFO.*Connecting\|Pseudo-terminal\|^ \*"
  ```
- If the remote command has a non-zero exit code (e.g. `grep` with no matches), the CLI will print `ERROR exit status 1`. This does not necessarily mean the SSH connection failed.
- Heredoc syntax (`<<'EOF'`) does **not** work reliably with this command. Always use `echo '...' |` instead.

