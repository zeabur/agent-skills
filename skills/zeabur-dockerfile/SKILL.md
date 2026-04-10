---
name: zeabur-dockerfile
description: Use when generating a Dockerfile for deploying a project to Zeabur. Use when the user needs help writing a Dockerfile for Node.js, Python, Go, Rust, PHP, Ruby, Java, .NET, or Elixir projects. Use when troubleshooting Dockerfile build failures on Zeabur.
---

# Zeabur Dockerfile Generation

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

When deploying source code to Zeabur, you must generate a Dockerfile. This skill covers how to analyze a project and produce a correct, deployable Dockerfile.

## Prerequisites

Before generating a Dockerfile, read the key project files:

| Language | Files to read |
|----------|---------------|
| Node.js | `package.json`, lockfile (`package-lock.json` / `yarn.lock` / `pnpm-lock.yaml`) |
| Python | `requirements.txt`, `Pipfile`, `pyproject.toml` |
| Go | `go.mod` |
| Rust | `Cargo.toml` |
| PHP | `composer.json` |
| Ruby | `Gemfile` |
| Java | `pom.xml`, `build.gradle` |
| .NET | `*.csproj`, `*.sln` |
| Elixir | `mix.exs` |

Also check for:
- Existing `Dockerfile` or `docker-compose.yml`
- Build config (`vite.config.js`, `webpack.config.js`, `next.config.js`, etc.)
- `.env.example` for required environment variables

**What NOT to read** — skip these to save tokens:
- HTML files — static assets, never affect deployment logic
- Lockfile contents — only check which lockfile *exists* (to determine package manager). Do NOT parse the contents.
- Markdown files — documentation only, never influences Dockerfile decisions

## Workflow

### 1. Analyze the Project

From the prerequisite files, determine:
1. Programming language and version
2. Framework (if any)
3. Package manager
4. Build command
5. Start command
6. Port the app listens on
7. Static site vs server-side app

### 2. Generate the Dockerfile

#### General Rules

- No comments in the Dockerfile
- No `ENV` or `ARG` instructions (unless required by the framework — see language-specific sections)
- Add `LABEL "language"="<lang>"` — possible values: `nodejs`, `python`, `go`, `static`, `ruby`, `java`, `php`, `rust`, `dotnet`, `elixir`, `swift`, `bun`
- Add `LABEL "framework"="<framework>"` only for **actual web frameworks** (see list below)
- Always `COPY . .` before running any install/build commands
- Set `WORKDIR /src` unless the user specifies otherwise
- Add `EXPOSE` for the port the app listens on
- Do not use multi-stage builds unless the build image differs from the runtime image (e.g., build with Node.js, serve with `zeabur/caddy-static`)

#### Framework vs Package — Only These Get a Framework Label

**Frameworks** (use `LABEL "framework"="..."`):
`vite`, `create-react-app`, `next.js`, `remix`, `nuxt.js`, `umi`, `nest.js`, `hexo`, `vitepress`, `astro`, `sli.dev`, `docusaurus`, `nitropack`, `hono`, `medusa`, `svelte`, `flask`, `django`, `fastapi`, `spring-boot`, `laravel`, `thinkphp`, `rails`, `aspnet`, `blazorwasm`, `elysia`, `baojs`

**Never label as framework** (these are packages/libraries):
- Python: gradio, pandas, numpy, requests, matplotlib, scikit-learn, tensorflow, pytorch, opencv, pillow, beautifulsoup4, selenium
- Node.js: express, koa, hapi, fastify, socket.io, moment, lodash, axios
- Other: bootstrap, jquery, chart.js, three.js, d3.js

> If unsure whether something is a framework or package, do NOT add the framework label.

#### Static Sites — `zeabur/caddy-static`

For **pure static websites** (Vite, Astro static, Docusaurus, plain HTML), use `zeabur/caddy-static`:

```dockerfile
FROM node:22-slim AS build
LABEL "language"="nodejs"
LABEL "framework"="vite"
WORKDIR /src
COPY . .
RUN npm install
RUN npm run build

FROM zeabur/caddy-static
COPY --from=build /src/dist /usr/share/caddy
```

Rules for `zeabur/caddy-static`:
- Copy build output to `/usr/share/caddy`
- Do NOT add `CMD` or `ENTRYPOINT` — the image handles it
- It listens on port `8080`
- Only use for truly static sites. Do NOT use for SSR frameworks (Next.js, Nuxt.js, SvelteKit, etc.)
- If building with Node.js then serving as static, set `LABEL "language"="nodejs"` (not `"static"`)

#### Node.js

- Default base image: `node:22-slim`
- Determine package manager by lockfile presence:

| Lockfile | Package manager | Install command |
|----------|-----------------|-----------------|
| `package-lock.json` | npm | `npm install` |
| `yarn.lock` | yarn | `yarn install` |
| `pnpm-lock.yaml` | pnpm | `RUN npm install -g pnpm && pnpm install` |

- When using `npm`, use `npm install`. Do NOT use `npm ci` or flags like `--only=production`, `--omit=dev`, `--frozen-lockfile`.
- For Vite static sites (React, Vue static builds), use `zeabur/caddy-static` to serve.
- For Vite with SSR frameworks (SvelteKit), use Node.js runtime.

**Next.js** — Zeabur injects `PORT=8080` into the container, so Next.js production mode listens on 8080 by default. No extra config needed.

```dockerfile
FROM node:22-slim
LABEL "language"="nodejs"
LABEL "framework"="next.js"
WORKDIR /src
COPY . .
RUN npm install
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

**Svelte / SvelteKit** — Use `node:22` (not alpine, not slim). Set `ENV PORT=8080`. Single-stage build — do NOT use `zeabur/caddy-static`. Do NOT use `cross-env ADAPTER=static` or adapter-specific build commands.

```dockerfile
FROM node:22
LABEL "language"="nodejs"
LABEL "framework"="svelte"
ENV PORT=8080
WORKDIR /src
RUN npm install -g pnpm@9
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 8080
CMD ["pnpm", "start"]
```

#### Python

- Default base image: `python:3.10`

**Flask** — Find the WSGI entry first. For example, if `main.py` contains `app = Flask(__name__)`, the entry is `main:app`.

```dockerfile
FROM python:3.10
LABEL "language"="python"
LABEL "framework"="flask"
WORKDIR /src
COPY . .
RUN pip install -r requirements.txt gunicorn
EXPOSE 8080
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "main:app"]
```

**FastAPI** — Choose the start method based on what exists:
1. If `fastapi-cli` is in `requirements.txt` → `fastapi run`
2. If `if __name__ == "__main__":` exists in a `.py` file → `python <file>.py`
3. Otherwise → `uvicorn main:app --host 0.0.0.0 --port 8080` (install `uvicorn` if missing)

```dockerfile
FROM python:3.10
LABEL "language"="python"
LABEL "framework"="fastapi"
WORKDIR /src
COPY . .
RUN pip install -r requirements.txt
EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

**Generic Python** — If WSGI might be applicable, use `gunicorn`. If unsure, just use `python <file>.py`.

#### Go

```dockerfile
FROM golang:1.23 AS build
WORKDIR /src
COPY . .
RUN go build -o /app .

FROM debian:bookworm-slim
LABEL "language"="go"
COPY --from=build /app /app
EXPOSE 8080
CMD ["/app"]
```

#### PHP (Laravel / Symfony / Generic)

Uses NGINX + PHP-FPM. Adjust PHP version and extensions as needed.

```dockerfile
FROM php:8.3-fpm
LABEL "language"="php"
WORKDIR /var/www
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions && sync
RUN apt update && apt install -y cron curl gettext git grep libicu-dev nginx pkg-config unzip && rm -rf /var/lib/apt/lists/*
RUN install-php-extensions @composer apcu bcmath gd intl mysqli opcache pcntl pdo_mysql sysvsem zip
RUN cat <<'NGINX' > /etc/nginx/sites-enabled/default
server {
    listen 8080;
    root /var/www;
    index index.php index.html;
    charset utf-8;
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt { access_log off; log_not_found off; }
    error_page 404 /index.php;
    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }
    location / {
        try_files $uri $uri/ /index.php$is_args$args;
    }
    location ~ /\.(?!well-known).* { deny all; }
    error_log /dev/stderr;
    access_log /dev/stderr;
}
NGINX
RUN chown -R www-data:www-data /var/www
COPY --chown=www-data:www-data . /var/www
USER www-data
RUN if [ -f composer.json ]; then composer install --optimize-autoloader --classmap-authoritative --no-dev; fi && if [ -f package.json ]; then npm install; fi
USER root
EXPOSE 8080
CMD ["sh", "-c", "php-fpm -D && nginx -g 'daemon off;'"]
```

For Laravel, add optimization after `composer install`:
```dockerfile
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache
```

### 3. Handle Existing Dockerfiles

- Analyze the existing Dockerfile first
- Use it as-is if it looks correct
- Suggest improvements only if there are issues (wrong port, missing dependencies, etc.)
- Always add Zeabur-specific labels (`language`, `framework`) if missing

## CLI Commands

After generating the Dockerfile, deploy with:

```bash
npx zeabur@latest deploy --project-id <project-id> --json
```

For redeployment (must pass service ID to avoid creating duplicates):

```bash
npx zeabur@latest deploy --project-id <project-id> --service-id <service-id> --json
```

Use the `zeabur-deploy` skill for the full deployment workflow.

## Error Handling

If the build or runtime fails:

1. Check build logs with the `zeabur-deployment-logs` skill
2. Common issues:
   - **Missing dependencies** — add to `RUN` install step
   - **Wrong port** — verify `EXPOSE` matches what the app listens on; check with `zeabur-port-mismatch` skill
   - **Wrong start command** — verify `CMD` matches the project's actual entry point
   - **Static site served as SSR** — switch to `zeabur/caddy-static` if the app produces static output
   - **SSR served as static** — switch to Node.js runtime if the app requires a server
3. Fix the Dockerfile, then redeploy with `--service-id` to update the existing service
