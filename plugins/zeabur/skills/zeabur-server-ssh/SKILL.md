---
name: zeabur-server-ssh
description: Use when debugging services on a user's dedicated server via SSH. Use when needing to run a command on the server, inspect pods, check container logs, view k8s resources, or run kubectl commands. Use when "service exec" is insufficient and you need server-level access. Use when user says "check my server", "run X on my server", "debug pod", "kubectl", "SSH into server", "check k8s", or "inspect cluster".
---

# Zeabur Server SSH + kubectl

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method.

Run commands on a user's dedicated server, and use kubectl to debug Kubernetes
workloads on servers that run ZeaburOS.

## Check which kind of server you are on before using kubectl

- **ZeaburOS servers** run k3s with kubectl pre-installed. Everything in this
  skill applies.
- **Clean VPS** — a rented server that has not been converted to ZeaburOS. It has
  **no k3s and no kubectl**; every `kubectl` command below fails with
  `command not found`. `server exec` still works for ordinary shell commands.

**Renting now provisions a clean VPS**, so never assume kubectl exists. If a
`kubectl` command fails with `command not found`, the server is a clean VPS —
tell the user that (and that converting it to ZeaburOS in the dashboard is what
adds kubectl) instead of retrying the command.

> The CLI does not yet expose which kind a server is. Until it does, infer it
> from the failure above, or check the server's page in the Zeabur dashboard.

## Run a command: `server exec` (recommended)

Run a command on the server in one step. The CLI fetches the credentials and opens
the connection internally, so **you never handle the password** — passwords with
special characters just work, and no `ssh2`/`sshpass` is needed.

```bash
npx zeabur@latest server exec --id <server-id> -- <command>
```

Examples:

```bash
# Single command
npx zeabur@latest server exec --id <server-id> -- sudo kubectl get pods -A -o wide

# Compound command — quote it as ONE argument so && / | stay intact
npx zeabur@latest server exec --id <server-id> -- 'echo "=== PODS ===" && sudo kubectl get pods -A && echo "=== EVENTS ===" && sudo kubectl get events -A --sort-by=.lastTimestamp | tail -20'
```

Notes:

- Everything after `--` is the remote command, joined like `ssh host <command>`.
  Quote a compound command (with `&&` / `|` / redirects) as a **single argument**.
- stdout/stderr stream live; the remote command's **exit code is propagated**
  (a pipeline reports only its **last** stage's status — `… | tail` hides an
  upstream failure, so don't rely on the exit code across a pipe).
- If you don't know the server ID, list servers first:
  ```bash
  npx zeabur@latest server list -i=false
  ```
  (or use the `zeabur-server-list` skill).

## Common kubectl Commands

> **ZeaburOS servers only.** On a clean VPS these all fail with
> `kubectl: command not found` — see the section above.

Pass any of these as the command to `server exec`. **Always use `sudo kubectl`** —
the SSH user may not have direct access to the k3s kubeconfig. Any command with a
pipe (`|`) or `&&` must be **quoted as a single argument**, or the local shell
splits it and runs part locally — e.g.
`server exec --id <id> -- 'sudo kubectl top pods -A --sort-by=memory | head -20'`.

| Task | Command |
|------|---------|
| List all pods | `sudo kubectl get pods -A -o wide` |
| Problem pods only | `sudo kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded` |
| Pod logs | `sudo kubectl logs <pod-name> -n <namespace> --tail=100` |
| Exec into container | `sudo kubectl exec <pod-name> -n <namespace> -- <command>` |
| Node resources | `sudo kubectl top nodes` |
| Pod resources | `sudo kubectl top pods -A --sort-by=memory \| head -20` |
| Describe pod | `sudo kubectl describe pod <pod-name> -n <namespace>` |
| Recent events | `sudo kubectl get events -A --sort-by=.lastTimestamp \| tail -30` |
| Restart deployment | `sudo kubectl rollout restart deployment/<name> -n <namespace>` |

## Fallback: manual SSH (only if `server exec` is unavailable)

Use this **only** if `server exec` isn't available (e.g. an older CLI). Otherwise
prefer `server exec` above — this path is fragile with special-character passwords.

### Step 1: Get SSH credentials

```bash
npx zeabur@latest server ssh-info --id <server-id> -i=false
```

Output is JSON: `{"ip":"1.2.3.4","port":22,"username":"root","password":"xxx"}`

### Step 2: Connect

Use the Node.js `ssh2` method by default; use `sshpass` only when its availability
is already known. Do NOT run `which sshpass` to check — it wastes a step where it's
never installed.

```bash
# sshpass (only if already known to be available)
sshpass -p '<password>' ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> sudo kubectl get pods -A
```

```bash
# Node.js ssh2 (the Zeabur agent sandbox has it pre-installed)
NODE_PATH=$([ -d /root/.global/node_modules ] && echo /root/.global/node_modules || echo /home/vercel-sandbox/.global/node_modules) node -e "
const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('<command>', (err, stream) => {
    if (err) { console.error(err); process.exit(1); }
    let out = '', errOut = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => errOut += d);
    stream.on('close', code => {
      if (out) console.log(out);
      if (errOut) console.error(errOut);
      c.end();
      process.exit(code);
    });
  });
}).connect({host:'<ip>', port:<port>, username:'<username>', password:'<password>'});
"
```

## Tips

- **Combine commands**: batch related checks with `&&` in a single `server exec`
  call to reduce round trips.
- **Use `-o wide`**: adds node name and IP to pod listings, useful for scheduling issues.
- **Namespace matters**: Zeabur services usually run in non-default namespaces. Use
  `-A` (all namespaces) first to locate the right one, then scope with `-n <namespace>`.
- **Read project docs first**: if a fix attempt fails, exec into the container and
  check README/config before blindly checking metrics: `sudo kubectl exec <pod> -n <ns> -- cat /app/README.md`
- To find server IDs, use the `zeabur-server-list` skill. For simpler container
  commands that don't need server-level access, use the `zeabur-service-exec` skill.
