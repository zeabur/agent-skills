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

```text
     ID              NAME        IP              PROVIDER   LOCATION         STATUS   VM STATUS   OS
-----------------+-------------+---------------+----------+----------------+--------+-----------+----------
 6989b00fd42b...   my-server    103.45.67.89    Hetzner    Singapore, SG    Online   RUNNING     ZeaburOS
 6989b00fd42b...   dev-box      45.67.89.12     Vultr      Tokyo, JP        Online   RUNNING     Ubuntu
```

## Which servers can host Zeabur projects: read the OS column

**`ZeaburOS` means the machine can host Zeabur projects; `Ubuntu` means it cannot** (not until ZeaburOS is installed on it). This is the authoritative answer — **do not SSH into a machine to work out which kind it is.**

For machine-readable output, `--json` carries the same value as `os` on every server:

```bash
npx zeabur@latest server list -i=false --json | jq -r '.[] | "\(.Name)\t\(.os)"'
```

> Requires CLI **0.21.0 or newer**. If the `OS` column and the `os` field are both absent, the CLI is older; either let `npx zeabur@latest` fetch the current version, or fall back to querying `hasK3s` through the API (see the `zeabur-server-ssh` skill, which documents that field's three-state trap).

## Get Server Details

```bash
# By server ID
npx zeabur@latest server get <server-id> -i=false
```

Shows detailed info: OS, CPU/memory/disk usage, provider, location, managed status, creation time.

Resource columns read `used/total` — CPU in millicores (`148/4000 m` is 0.15 of 4 cores), memory and disk in MB. A column showing `—` means the value was not measured, **not** that the machine has none.

## Reboot a Server

```bash
npx zeabur@latest server reboot <server-id> -y
```

**`-y` skips confirmation prompt** — required for non-interactive use.

## Servers and Projects

A server can host Zeabur projects **only once it runs ZeaburOS**. A project's `Region.ID` will be `server-<server-id>` when it is deployed on such a server.

Renting provisions **Ubuntu** — base OS and SSH, no Zeabur services — so a newly rented server cannot host projects until ZeaburOS is installed on it. The `zeabur-server-rent` skill covers that step. Which kind a given server is, is answered by the **OS** column above.

**On a ZeaburOS server:**

- **To deploy a service**, use the `zeabur-deploy` skill with the project bound to that server — do NOT SSH in and manually set up web servers or copy files.
- **SSH is for low-level debugging only** (e.g. checking kubectl, inspecting disk, network diagnostics). It is not needed for deploying or managing services.

**On a plain Ubuntu VPS:** SSH is not a debugging side-channel, it is the whole point — the machine is the user's to set up as they like (docker compose, 1Panel, 寶塔, …). There are no Zeabur services to manage, and `kubectl` does not exist.

## SSH into a Server

```bash
npx zeabur@latest server ssh <server-id>
```

> The `kubectl` examples below assume a **ZeaburOS** server. On a plain Ubuntu VPS
> they fail with `command not found` — see the `zeabur-server-ssh` skill for how to
> tell the two apart.

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

