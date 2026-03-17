# Hard-Won Lessons (from real template challenges)

##Wait for database readiness
Zeabur's `dependencies` field only ensures services are **deployed**, not that they're **ready to accept connections**. A database container can take 5-15 seconds to initialize.

**Preferred approach: `healthCheck`** — add a health check to the dependency service so Zeabur waits until the port is ready before starting dependent services:
```yaml
- name: postgresql
  spec:
    ports:
      - id: database
        port: 5432
        type: TCP
    healthCheck:
      type: TCP
      port: database    # references the port ID
```
This is cleaner than wait loops and requires no changes to the app's startup command.

**Fallback: wait loop** — if you can't modify the template, add a wait loop to the app's command:
```yaml
args:
    - -c
    - |
        echo "Waiting for PostgreSQL..."
        while ! nc -z ${POSTGRES_HOST} ${POSTGRES_PORT} 2>/dev/null; do sleep 2; done
        echo "PostgreSQL is ready!"
        # ... then run migrations/init
```
Note: `nc` (netcat) is available on most Alpine-based images. If not, use `wget --spider` or a node one-liner.

##Pin image tags — never use `latest`
Always pin Docker images to a specific version tag (e.g., `rajnandan1/kener:4.0.16`). Never use `:latest` in templates because:
- Zeabur's registry may cache an old version of `latest`, causing users to deploy stale or broken images
- Upstream breaking changes silently affect all new deployments
- Debugging becomes harder when you don't know which version is running

When the upstream releases a new version, update the template with the new pinned tag and test before publishing.

##Study the project's own Dockerfile and docker-compose
**Never guess startup commands.** Instead:
1. Read the project's `Dockerfile` to understand the build stages and the final `CMD`/`ENTRYPOINT`
2. Read `docker-compose.yml` and especially `docker-compose.fullapp.yml` (or `docker-compose.prod.yml`) for the production startup command -- these often override the Dockerfile's CMD with init/migrate logic
3. Check the app's `package.json` scripts to understand what `yarn start` or `npm start` actually runs
4. The startup command in docker-compose is battle-tested -- copy it, don't reinvent it

##Memory-heavy apps need lighter startup
Apps that spawn workers, schedulers, and the web server all in one process may OOM on Zeabur's default allocation. Signs of OOM:
- Container starts, runs for 1-2 minutes, then crashes with no error logs (just `BackOff: Back-off restarting failed container`)
- No application-level crash message -- the kernel kills the process silently

Solutions:
- Run the web server directly (e.g., `next start` or `node server.js`) instead of a CLI wrapper that spawns workers + scheduler + server
- Disable non-essential background processes via env vars (e.g., `AUTO_SPAWN_WORKERS=false`)
- If workers are needed, consider splitting them into a separate service

##First-run init with persistent marker
For apps that need first-time initialization (DB schema, seed data, admin users), use a marker file in a persistent volume:
```yaml
args:
    - -c
    - |
        if [ ! -f /app/storage/.initialized ]; then
          echo "First run: initializing..."
          run-init-command && touch /app/storage/.initialized
        else
          echo "Subsequent run: migrations only..."
          run-migrate-command
        fi
        exec start-server-command
```
Key points:
- The marker file MUST be in a **persistent volume**, not `/tmp/` (which is ephemeral)
- Use `&&` after init so the marker is only created if init succeeds
- Use `exec` for the final server process so it becomes PID 1 and receives signals properly
- Read init logs carefully for the **actual default credentials** -- don't assume from docs

##Working directory matters
When overriding `command`/`args`, be aware of the Dockerfile's `WORKDIR`. In monorepo apps, different commands need to run from different directories:
```yaml
args:
    - -c
    - |
        cd /app              # root workspace for yarn workspace commands
        yarn mercato init    # CLI from root package.json
        cd /app/apps/myapp   # app directory for next start
        exec next start -p 3000
```

##ImagePullBackOff recovery
When a pod is stuck in `ImagePullBackOff` (e.g., after making a Docker Hub repo public), the Kubernetes backoff timer prevents immediate retries. Fix by restarting the service:
```bash
npx zeabur@latest service restart --id SERVICE_ID -i=false -y
```

##Disable unused monitoring agents
Many production images ship with New Relic, Datadog, or similar APM agents. These require license keys and consume memory. Add `NEW_RELIC_ENABLED=false` or equivalent env vars to disable them cleanly. Check if the `start` script injects agents via `NODE_OPTIONS='-r newrelic'` -- these still run even if the agent errors out.

##Verify all URLs before publishing
Before publishing a template, verify that ALL URLs return HTTP 200:
- `icon` URL
- `coverImage` URL
- Links in `readme`

Common pitfall: `raw.githubusercontent.com` URLs with wrong branch name (`develop` vs `main` vs `master`). Always check:
```bash
curl -s -o /dev/null -w "%{http_code}" "https://raw.githubusercontent.com/..."
```
