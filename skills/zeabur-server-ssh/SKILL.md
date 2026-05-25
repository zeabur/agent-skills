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

The sandbox has `ssh2` pre-installed. Use this Node.js one-liner to run commands via SSH:

```bash
node -e "
const {Client} = require('/home/vercel-sandbox/.global/node_modules/ssh2');
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

Replace `<ip>`, `<port>`, `<username>`, `<password>`, and `<command>` with actual values from Step 1.

### Combine multiple commands (preferred)

Batch related checks into a single SSH call to minimize overhead:

```bash
node -e "
const {Client} = require('/home/vercel-sandbox/.global/node_modules/ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('echo \"=== PODS ===\" && kubectl get pods -A && echo \"=== SERVICES ===\" && kubectl get svc -A && echo \"=== EVENTS ===\" && kubectl get events -A --sort-by=.lastTimestamp | tail -20', (err, stream) => {
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

Use the SSH pattern above with these commands. **Always use `sudo kubectl`** — the SSH user may not have direct access to the k3s kubeconfig.

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

- **Do NOT use `sshpass` or `SSH_ASKPASS`**: They are not available in the sandbox. Always use the `ssh2` Node.js approach shown above.
- **Combine commands**: Batch related checks with `&&` in a single SSH call to reduce round trips.
- **Use `-o wide`**: Adds node name and IP to pod listings, useful for debugging scheduling issues.
- **Namespace matters**: Zeabur services typically run in non-default namespaces. Use `-A` (all namespaces) first to locate the right namespace, then scope subsequent commands with `-n <namespace>`.
- **Read project docs first**: If a fix attempt fails, exec into the container and check README or config files before blindly checking metrics: `kubectl exec <pod> -n <ns> -- cat /app/README.md`
- To find server IDs, use the `zeabur-server-list` skill. For simpler container commands that don't need server-level access, use the `zeabur-service-exec` skill instead.
