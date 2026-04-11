---
name: zeabur-object-storage
description: Use when deploying object storage (S3-compatible) to Zeabur. Use when user needs MinIO, RustFS, or S3-compatible storage. Use when user says "object storage", "file storage", "S3", "MinIO", "RustFS", "upload files", "store files", "blob storage", or "OSS". Also use when integrating object storage with an existing service.
---

# Zeabur Object Storage Deployment

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

Deploy an S3-compatible object storage service (MinIO or RustFS) to the user's Zeabur project via an existing template, then help them integrate it with their application.

## Step 1 — Choose the Right Storage

| User Need | Search Keyword | Notes |
|-----------|---------------|-------|
| Full-featured S3, web console, IAM, versioning | `minio` | Feature-rich, higher memory (~512MB+) |
| Lightweight S3-compatible storage | `rustfs` | Minimal footprint, fast, S3-compatible |

- **Default to MinIO** if the user doesn't specify — it's the most widely supported and has a built-in web console.
- **Recommend RustFS** if the user wants lightweight/minimal or mentions RustFS specifically.

## Step 2 — Find the Template

Search for existing object storage templates on Zeabur:

```bash
npx zeabur@latest template search minio -i=false --json
```

This returns a JSON array of matching templates. Pick the one with the highest deployment count (more battle-tested). Note the `code` field — you'll need it to deploy.

To inspect a template's full YAML (service definitions, env vars, volumes, etc.):

```bash
npx zeabur@latest template get -c <TEMPLATE_CODE> --raw
```

> For advanced customization or creating a template from scratch, use the `zeabur-template` skill.

## Step 3 — Identify the Target Project

The storage service must be deployed into a project. Use the `zeabur-service-list` skill or ask the user for their project ID.

```bash
npx zeabur@latest service list --project-id <project-id>
```

## Step 4 — Deploy the Template

Deploy the storage template into the user's project:

```bash
npx zeabur@latest template deploy -c <TEMPLATE_CODE> -i=false --project-id <project-id>
```

## Step 5 — Access the Web Console

Both MinIO and RustFS provide a web console for managing buckets and files.

1. After deployment, a domain will be assigned for the console. Check it with:
   ```bash
   npx zeabur@latest service list --project-id <project-id>
   ```

2. Open the console URL in a browser and log in with the root credentials (check the template's env vars for the username and password).

3. Create a bucket in the console before your application can upload files.

## Step 6 — Integrate with Application

After deploying, set S3-compatible env vars on the application service. Use the `zeabur-variables` skill.

> **Note:** The actual variable names depend on the template. Use `npx zeabur@latest template get -c <TEMPLATE_CODE> --raw` to check the exact env var names exposed by the template.

### Common Application Env Var Mapping

Most apps and SDKs use the standard AWS S3 env var names. Map them to the storage service variables:

| App Env Var | Description |
|-------------|-------------|
| `S3_ENDPOINT` or `AWS_ENDPOINT_URL` | The storage service's internal endpoint (e.g., `http://minio.zeabur.internal:9000`) |
| `S3_ACCESS_KEY` or `AWS_ACCESS_KEY_ID` | Root user from the storage service |
| `S3_SECRET_KEY` or `AWS_SECRET_ACCESS_KEY` | Root password from the storage service |
| `S3_BUCKET` | Bucket name created in the console |
| `S3_REGION` | `us-east-1` (default, any value works) |
| `S3_FORCE_PATH_STYLE` | `true` |

> **Important:** `S3_FORCE_PATH_STYLE=true` (or `forcePathStyle: true` in SDK config) is required for MinIO/RustFS. Without it, the SDK will try virtual-hosted-style URLs which won't resolve.

> **Cross-service variable references** (e.g., `${MINIO.MINIO_ENDPOINT}`) should be set via the Zeabur Dashboard or GraphQL API — the CLI has a known issue with `${}` expansion. See the `zeabur-variables` skill for details.

## Step 7 — Verify

1. Check that the storage service is running:
   ```bash
   npx zeabur@latest deployment log --service-id <storage-service-id>
   ```

2. Test S3 API connectivity from the application container:
   ```bash
   npx zeabur@latest service exec --id <app-service-id> -- nc -z minio.zeabur.internal 9000
   ```

3. Test with a simple health check (if `curl` is available in the app container):
   ```bash
   npx zeabur@latest service exec --id <app-service-id> -- \
     curl -s -o /dev/null -w "%{http_code}" http://minio.zeabur.internal:9000/minio/health/live
   ```

## Tips

- **External API access:** The S3 API port uses TCP with port forwarding enabled. Get the external endpoint with `npx zeabur@latest service network --id <service-id>`.
- **Data persistence:** Storage templates include volumes. Uploaded files survive restarts.
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
