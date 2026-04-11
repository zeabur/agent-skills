---
name: zeabur-object-storage
description: Use when deploying object storage (S3-compatible) to Zeabur. Use when user needs MinIO, RustFS, or S3-compatible storage. Use when user says "object storage", "file storage", "S3", "MinIO", "RustFS", "upload files", "store files", "blob storage", or "OSS". Also use when integrating object storage with an existing service.
---

# Zeabur Object Storage Deployment

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

Deploy an S3-compatible object storage service (MinIO or RustFS) to the user's Zeabur project, then help them integrate it with their application.

## Step 1 — Choose the Right Storage

| User Need | Service | Image | Notes |
|-----------|---------|-------|-------|
| Full-featured S3, web console, IAM, versioning | MinIO | `minio/minio:RELEASE.2025-02-28T09-55-16Z` | Feature-rich, higher memory (~512MB+) |
| Lightweight S3-compatible storage | RustFS | `rustfs/rustfs:0.1.1` | Minimal footprint, fast, S3-compatible |

- **Default to MinIO** if the user doesn't specify — it's the most widely supported and has a built-in web console.
- **Recommend RustFS** if the user wants lightweight/minimal or mentions RustFS specifically.

## Step 2 — Identify the Target Project

The storage service must be deployed into a project. Use the `zeabur-service-list` skill or ask the user for their project ID.

```bash
npx zeabur@latest service list --project-id <project-id>
```

## Step 3 — Write and Deploy the Template

Create a template YAML file and deploy it to the user's project:

```bash
npx zeabur@latest template deploy -f object-storage.yaml -i=false --project-id <project-id>
```

### MinIO

```yaml
# yaml-language-server: $schema=https://schema.zeabur.app/template.json
apiVersion: zeabur.com/v1
kind: Template
metadata:
  name: MinIO
spec:
  description: S3-compatible object storage with web console
  icon: https://raw.githubusercontent.com/zeabur/service-icons/main/marketplace/minio.svg
  tags:
    - Storage
  variables:
    - key: CONSOLE_DOMAIN
      type: DOMAIN
      name: MinIO Console Domain
      description: Domain for the MinIO web console
  readme: ""
  services:
    - name: minio
      icon: https://raw.githubusercontent.com/zeabur/service-icons/main/marketplace/minio.svg
      template: PREBUILT_V2
      domainKey:
        - port: console
          variable: CONSOLE_DOMAIN
      spec:
        source:
          image: minio/minio:RELEASE.2025-02-28T09-55-16Z
          command:
            - minio
            - server
            - /data
            - --console-address
            - ":9001"
        ports:
          - id: api
            port: 9000
            type: TCP
          - id: console
            port: 9001
            type: HTTP
        portForwarding:
          enabled: true
        volumes:
          - id: data
            dir: /data
        env:
          MINIO_ROOT_USER:
            default: minioadmin
            expose: true
          MINIO_ROOT_PASSWORD:
            default: ${PASSWORD}
            expose: true
          MINIO_HOST:
            default: ${CONTAINER_HOSTNAME}
            expose: true
            readonly: true
          MINIO_PORT:
            default: ${API_PORT}
            expose: true
            readonly: true
          MINIO_ENDPOINT:
            default: http://${MINIO_HOST}:${MINIO_PORT}
            expose: true
            readonly: true
```

### RustFS

```yaml
# yaml-language-server: $schema=https://schema.zeabur.app/template.json
apiVersion: zeabur.com/v1
kind: Template
metadata:
  name: RustFS
spec:
  description: Lightweight S3-compatible object storage
  icon: https://raw.githubusercontent.com/zeabur/service-icons/main/marketplace/rustfs.svg
  tags:
    - Storage
  variables:
    - key: CONSOLE_DOMAIN
      type: DOMAIN
      name: RustFS Console Domain
      description: Domain for the RustFS web console
  readme: ""
  services:
    - name: rustfs
      icon: https://raw.githubusercontent.com/zeabur/service-icons/main/marketplace/rustfs.svg
      template: PREBUILT_V2
      domainKey:
        - port: console
          variable: CONSOLE_DOMAIN
      spec:
        source:
          image: rustfs/rustfs:0.1.1
          command:
            - rustfs
            - server
            - /data
            - --console-address
            - ":9001"
        ports:
          - id: api
            port: 9000
            type: TCP
          - id: console
            port: 9001
            type: HTTP
        portForwarding:
          enabled: true
        volumes:
          - id: data
            dir: /data
        env:
          RUSTFS_ROOT_USER:
            default: minioadmin
            expose: true
          RUSTFS_ROOT_PASSWORD:
            default: ${PASSWORD}
            expose: true
          RUSTFS_HOST:
            default: ${CONTAINER_HOSTNAME}
            expose: true
            readonly: true
          RUSTFS_PORT:
            default: ${API_PORT}
            expose: true
            readonly: true
          RUSTFS_ENDPOINT:
            default: http://${RUSTFS_HOST}:${RUSTFS_PORT}
            expose: true
            readonly: true
```

## Step 4 — Access the Web Console

Both MinIO and RustFS provide a web console for managing buckets and files.

1. After deployment, a domain will be assigned for the console. Check it with:
   ```bash
   npx zeabur@latest service list --project-id <project-id>
   ```

2. Open the console URL in a browser and log in with the root credentials:
   - **MinIO:** user `minioadmin`, password from `MINIO_ROOT_PASSWORD`
   - **RustFS:** user `minioadmin`, password from `RUSTFS_ROOT_PASSWORD`

3. Create a bucket in the console before your application can upload files.

## Step 5 — Integrate with Application

After deploying, set S3-compatible env vars on the application service. Use the `zeabur-variables` skill.

### Connection Variables

| Service | Variable | Example Value |
|---------|----------|---------------|
| MinIO | `MINIO_ENDPOINT` | `http://minio.zeabur.internal:9000` |
| MinIO | `MINIO_ROOT_USER` | `minioadmin` |
| MinIO | `MINIO_ROOT_PASSWORD` | (auto-generated) |
| RustFS | `RUSTFS_ENDPOINT` | `http://rustfs.zeabur.internal:9000` |
| RustFS | `RUSTFS_ROOT_USER` | `minioadmin` |
| RustFS | `RUSTFS_ROOT_PASSWORD` | (auto-generated) |

### Common Application Env Var Mapping

Most apps and SDKs use the standard AWS S3 env var names. Map them to the storage service variables:

| App Env Var | Value (MinIO) | Value (RustFS) |
|-------------|---------------|----------------|
| `S3_ENDPOINT` or `AWS_ENDPOINT_URL` | `${MINIO.MINIO_ENDPOINT}` | `${RUSTFS.RUSTFS_ENDPOINT}` |
| `S3_ACCESS_KEY` or `AWS_ACCESS_KEY_ID` | `${MINIO.MINIO_ROOT_USER}` | `${RUSTFS.RUSTFS_ROOT_USER}` |
| `S3_SECRET_KEY` or `AWS_SECRET_ACCESS_KEY` | `${MINIO.MINIO_ROOT_PASSWORD}` | `${RUSTFS.RUSTFS_ROOT_PASSWORD}` |
| `S3_BUCKET` | (bucket name created in console) | (bucket name created in console) |
| `S3_REGION` | `us-east-1` (default, any value works) | `us-east-1` |
| `S3_FORCE_PATH_STYLE` | `true` | `true` |

> **Important:** `S3_FORCE_PATH_STYLE=true` (or `forcePathStyle: true` in SDK config) is required for MinIO/RustFS. Without it, the SDK will try virtual-hosted-style URLs which won't resolve.

> **Cross-service variable references** (e.g., `${MINIO.MINIO_ENDPOINT}`) should be set via the Zeabur Dashboard or GraphQL API — the CLI has a known issue with `${}` expansion. See the `zeabur-variables` skill for details.

## Step 6 — Verify

1. Check that the storage service is running:
   ```bash
   npx zeabur@latest deployment log --service-id <storage-service-id>
   ```

2. Test S3 API connectivity from the application container:
   ```bash
   # MinIO
   npx zeabur@latest service exec --id <app-service-id> -- nc -z minio.zeabur.internal 9000

   # RustFS
   npx zeabur@latest service exec --id <app-service-id> -- nc -z rustfs.zeabur.internal 9000
   ```

3. Test with a simple S3 operation (if `curl` is available in the app container):
   ```bash
   npx zeabur@latest service exec --id <app-service-id> -- \
     curl -s -o /dev/null -w "%{http_code}" http://minio.zeabur.internal:9000/minio/health/live
   ```

## Tips

- **External API access:** The S3 API port uses TCP with port forwarding enabled. Get the external endpoint with `npx zeabur@latest service network --id <service-id>`.
- **Data persistence:** Both templates include volumes. Uploaded files survive restarts.
- **Bucket creation via CLI:** If `mc` (MinIO Client) is available:
  ```bash
  npx zeabur@latest service exec --id <storage-service-id> -- \
    mc alias set local http://localhost:9000 minioadmin PASSWORD && \
    mc mb local/my-bucket
  ```
- **SDK examples** — Most S3 SDKs just need endpoint + credentials + `forcePathStyle`:
  ```javascript
  // Node.js (AWS SDK v3)
  const { S3Client } = require("@aws-sdk/client-s3");
  const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
    region: "us-east-1",
    forcePathStyle: true,
  });
  ```
