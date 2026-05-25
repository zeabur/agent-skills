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

## Step 2: Set Up SSH_ASKPASS

The sandbox does not have `sshpass`. Use `SSH_ASKPASS` instead — it is built into SSH and requires no extra packages.

```bash
# Create the askpass script (do this once per session)
echo '#!/bin/sh
echo "<password>"' > /tmp/askpass.sh && chmod +x /tmp/askpass.sh
```

Replace `<password>` with the actual password from Step 1.

## Step 3: Run Commands via SSH

Always combine multiple checks into a single SSH call to minimize overhead.

```bash
# Single command
SSH_ASKPASS=/tmp/askpass.sh SSH_ASKPASS_REQUIRE=force ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> kubectl get pods -A

# Multiple commands in one SSH call (preferred)
SSH_ASKPASS=/tmp/askpass.sh SSH_ASKPASS_REQUIRE=force ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> '
  echo "=== PODS ===" && kubectl get pods -A &&
  echo "=== SERVICES ===" && kubectl get svc -A &&
  echo "=== EVENTS ===" && kubectl get events -A --sort-by=.lastTimestamp | tail -20
'
```

## Common kubectl Patterns

### Check pod status and recent events
```bash
SSH_ASKPASS=/tmp/askpass.sh SSH_ASKPASS_REQUIRE=force ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> '
  echo "=== PODS ===" && kubectl get pods -A -o wide &&
  echo "=== PROBLEM PODS ===" && kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded &&
  echo "=== RECENT EVENTS ===" && kubectl get events -A --sort-by=.lastTimestamp | tail -30
'
```

### View logs for a specific pod
```bash
SSH_ASKPASS=/tmp/askpass.sh SSH_ASKPASS_REQUIRE=force ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> kubectl logs <pod-name> -n <namespace> --tail=100
```

### Exec into a container via kubectl
```bash
SSH_ASKPASS=/tmp/askpass.sh SSH_ASKPASS_REQUIRE=force ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> kubectl exec <pod-name> -n <namespace> -- <command>
```

### Check resource usage
```bash
SSH_ASKPASS=/tmp/askpass.sh SSH_ASKPASS_REQUIRE=force ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> '
  echo "=== NODE RESOURCES ===" && kubectl top nodes &&
  echo "=== POD RESOURCES ===" && kubectl top pods -A --sort-by=memory | head -20
'
```

### Describe a failing pod
```bash
SSH_ASKPASS=/tmp/askpass.sh SSH_ASKPASS_REQUIRE=force ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> kubectl describe pod <pod-name> -n <namespace>
```

### Restart a deployment
```bash
SSH_ASKPASS=/tmp/askpass.sh SSH_ASKPASS_REQUIRE=force ssh -o StrictHostKeyChecking=no -p <port> <username>@<ip> kubectl rollout restart deployment/<deployment-name> -n <namespace>
```

## Tips

- **Do NOT use `sshpass`**: It is not available in the sandbox. Use `SSH_ASKPASS` as shown above.
- **Create askpass script once**: Run the `echo ... > /tmp/askpass.sh` command once, then reuse it for all subsequent SSH calls in the same session.
- **Combine commands**: Always batch related checks into a single SSH call using single quotes with `&&` to reduce round trips.
- **Do NOT use `bash -c '...'`**: Pass commands directly in SSH quotes. Using `bash -c` causes quoting conflicts over SSH.
- **Use `-o wide`**: Adds node name and IP to pod listings, useful for debugging scheduling issues.
- **Namespace matters**: Zeabur services typically run in non-default namespaces. Use `-A` (all namespaces) first to locate the right namespace, then scope subsequent commands with `-n <namespace>`.
- **Read project docs first**: If a fix attempt fails, SSH into the container and check README or config files before blindly checking metrics: `kubectl exec <pod> -n <ns> -- cat /app/README.md`
- To find server IDs, use the `zeabur-server-list` skill. For simpler container commands that don't need server-level access, use the `zeabur-service-exec` skill instead.
