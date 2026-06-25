---
name: zeabur-server-ssh
description: Use when debugging services on a user's dedicated server via SSH. Use when needing to inspect pods, check container logs, view k8s resources, or run kubectl commands on the server. Use when "service exec" is insufficient and you need server-level access. Use when user says "check my server", "debug pod", "kubectl", "SSH into server", "check k8s", or "inspect cluster".
---

# Zeabur Server SSH + kubectl

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method.

SSH into a user's dedicated server and use kubectl to debug Kubernetes workloads. Zeabur dedicated servers run k3s with kubectl pre-installed.

## Step 1: Get SSH Credentials

```bash
npx zeabur@latest server ssh-info --id <server-id> -i=false
```

Output is JSON:
```json
{"ip":"1.2.3.4","port":22,"username":"root","password":"xxx"}
```

If you don't know the server ID, list servers first:
```bash
npx zeabur@latest server list -i=false
```

## Step 2: Run Commands via SSH

Use the Node.js `ssh2` method by default. Use `sshpass` only when its availability is already known.

### Option A: sshpass (only if already known to be available)

```bash
# Single command
sshpass -p '<password>' ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> sudo kubectl get pods -A

# Multiple commands in one SSH call
sshpass -p '<password>' ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> '
  echo "=== PODS ===" && sudo kubectl get pods -A &&
  echo "=== SERVICES ===" && sudo kubectl get svc -A &&
  echo "=== EVENTS ===" && sudo kubectl get events -A --sort-by=.lastTimestamp | tail -20
'
```

### Option B: Node.js ssh2 (default)

The Zeabur agent sandbox has `ssh2` pre-installed. Use this approach by default:

```bash
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

For multiple commands, join them with `&&` in the command string:

```bash
NODE_PATH=$([ -d /root/.global/node_modules ] && echo /root/.global/node_modules || echo /home/vercel-sandbox/.global/node_modules) node -e "
const {Client} = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('echo \"=== PODS ===\" && sudo kubectl get pods -A && echo \"=== SERVICES ===\" && sudo kubectl get svc -A && echo \"=== EVENTS ===\" && sudo kubectl get events -A --sort-by=.lastTimestamp | tail -20', (err, stream) => {
    if (err) { console.error(err); process.exit(1); }
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => { console.log(out); c.end(); });
  });
}).connect({host:'<ip>', port:<port>, username:'<username>', password:'<password>'});
"
```

## Common kubectl Commands

**Always use `sudo kubectl`** — the SSH user may not have direct access to the k3s kubeconfig.

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

## Tips

- **Use Node.js ssh2 by default (Option B)**: Only use `sshpass` (Option A) if you already know it's available. Do NOT run `which sshpass` to check — it wastes a step in environments where it's never installed.
- **Combine commands**: Batch related checks with `&&` in a single SSH call to reduce round trips.
- **Do NOT use `bash -c '...'` over SSH**: Pass commands directly in SSH quotes. Using `bash -c` causes quoting conflicts.
- **Use `-o wide`**: Adds node name and IP to pod listings, useful for debugging scheduling issues.
- **Namespace matters**: Zeabur services typically run in non-default namespaces. Use `-A` (all namespaces) first to locate the right namespace, then scope subsequent commands with `-n <namespace>`.
- **Read project docs first**: If a fix attempt fails, exec into the container and check README or config files before blindly checking metrics: `sudo kubectl exec <pod> -n <ns> -- cat /app/README.md`
- To find server IDs, use the `zeabur-server-list` skill. For simpler container commands that don't need server-level access, use the `zeabur-service-exec` skill instead.
