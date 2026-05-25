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

Use `sshpass` to run commands non-interactively. Always combine multiple checks into a single SSH call to minimize overhead.

```bash
# Single command
sshpass -p '<password>' ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> kubectl get pods -A

# Multiple commands in one SSH call (preferred)
sshpass -p '<password>' ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> '
  echo "=== PODS ===" && kubectl get pods -A &&
  echo "=== SERVICES ===" && kubectl get svc -A &&
  echo "=== EVENTS ===" && kubectl get events -A --sort-by=.lastTimestamp | tail -20
'
```

## Common kubectl Patterns

### Check pod status and recent events
```bash
sshpass -p '<password>' ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> '
  echo "=== PODS ===" && kubectl get pods -A -o wide &&
  echo "=== PROBLEM PODS ===" && kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded &&
  echo "=== RECENT EVENTS ===" && kubectl get events -A --sort-by=.lastTimestamp | tail -30
'
```

### View logs for a specific pod
```bash
sshpass -p '<password>' ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> kubectl logs <pod-name> -n <namespace> --tail=100
```

### Exec into a container via kubectl
```bash
sshpass -p '<password>' ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> kubectl exec <pod-name> -n <namespace> -- <command>
```

### Check resource usage
```bash
sshpass -p '<password>' ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> '
  echo "=== NODE RESOURCES ===" && kubectl top nodes &&
  echo "=== POD RESOURCES ===" && kubectl top pods -A --sort-by=memory | head -20
'
```

### Describe a failing pod
```bash
sshpass -p '<password>' ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> kubectl describe pod <pod-name> -n <namespace>
```

### Restart a deployment
```bash
sshpass -p '<password>' ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> kubectl rollout restart deployment/<deployment-name> -n <namespace>
```

## Tips

- **Combine commands**: Always batch related checks into a single SSH call using single quotes with `&&` to reduce round trips.
- **Do NOT use `bash -c '...'`**: Pass commands directly in SSH quotes. Using `bash -c` causes quoting conflicts over SSH.
- **Use `-o wide`**: Adds node name and IP to pod listings, useful for debugging scheduling issues.
- **Namespace matters**: Zeabur services typically run in non-default namespaces. Use `-A` (all namespaces) first to locate the right namespace, then scope subsequent commands with `-n <namespace>`.
- **Read project docs first**: If a fix attempt fails, SSH into the container and check README or config files before blindly checking metrics: `kubectl exec <pod> -n <ns> -- cat /app/README.md`
- **sshpass availability**: If `sshpass` is not installed in the sandbox, install it first: `apt-get update && apt-get install -y sshpass`
- To find server IDs, use the `zeabur-server-list` skill. For simpler container commands that don't need server-level access, use the `zeabur-service-exec` skill instead.
