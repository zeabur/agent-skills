# Template Complexity Levels

**Level 1 -- Single prebuilt service** (e.g., Memos, Uptime-Kuma, LobeChat):
- Just one service with image, port, and optionally a volume
- Simplest pattern, no cross-service wiring needed

**Level 2 -- App + database** (e.g., Ghost+MySQL, Linkwarden+PostgreSQL):
- Database service exposes vars, app service references them
- App service uses `dependencies` to ensure DB starts first

**Level 3 -- App + database + init/migrator** (e.g., Teable, Open Mercato):
- First-run initialization or separate migrator service
- Requires wait-for-db pattern and init marker files

**Level 4 -- Multi-service with multiple domains** (e.g., Logto):
- Multiple ports on one service, each bound to a different domain variable

**Level 5 -- Large-scale multi-service platform** (e.g., Dify 12 services, Supabase 11 services):
- **Reverse proxy as entry point**: nginx (Dify) or Kong (Supabase) as the single domain-bound service
- **Same image, different MODE**: e.g., Dify runs `api`, `worker`, `worker-beat` from the same image
- **Internal-only services**: no public domain, communicate via `${CONTAINER_HOSTNAME}`
- **Heavy use of `configs`**: Nginx conf, SQL init scripts, Kong config — all injected via `configs` field
- **PostgreSQL init SQL via configs**: Mount to `/docker-entrypoint-initdb.d/` for auto execution
- **Shared secrets**: Use `${PASSWORD}` for all internal credentials
