---
name: zeabur-server-list
description: Use when listing dedicated servers. Use when checking server status, IP, or provider info. Use when SSH into a server.
---

# Zeabur Server List & Get

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method.

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

## SSH into a Server

```bash
npx zeabur@latest server ssh <server-id>
```

For managed servers, the password is fetched automatically. If `sshpass` is installed, login is fully automatic; otherwise the password is printed for manual entry.
