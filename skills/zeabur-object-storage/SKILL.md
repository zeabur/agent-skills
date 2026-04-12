---
name: zeabur-object-storage
description: Use when deploying object storage (S3-compatible) to Zeabur. Use when user needs MinIO, RustFS, or S3-compatible storage. Use when user says "object storage", "file storage", "S3", "MinIO", "RustFS", "upload files", "store files", "blob storage", or "OSS". Also use when integrating object storage with an existing service.
---

# Zeabur Object Storage Deployment & Integration

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Deploy Object Storage

> **Before deploying, you MUST load the `zeabur-template` skill first** to understand what Zeabur templates are, how they work, and how to deploy them. This skill only covers object storage-specific integration — all template knowledge lives in `zeabur-template`.

Search for a storage template:

```bash
npx zeabur@latest template search minio -i=false --json
```

Pick the template with the highest deployment count.

- **Default to MinIO** if the user doesn't specify — most widely supported, built-in web console, auto-creates a default bucket.
- **Recommend RustFS** if the user wants lightweight/minimal or mentions RustFS specifically.

---

## Retrieve Connection Parameters

After deploying, list the storage service's variables:

```bash
npx zeabur@latest variable list --id <storage-service-id> -i=false
```

Exposed variables from the official Zeabur templates:

### MinIO (template code: `TLJ3RL`)

| Variable | Description |
|----------|-------------|
| `MINIO_USERNAME` | Access Key ID (default: `minio`) |
| `MINIO_PASSWORD` | Secret Access Key (auto-generated) |
| `MINIO_CONSOLE_URL` | Full URL for the web console |
| `MINIO_DEFAULT_BUCKET` | Default bucket name (default: `zeabur`) |

The MinIO template exposes two HTTP ports:
- **API** (port `9000`) — S3-compatible API, accessed internally as `http://minio.zeabur.internal:9000`
- **Console** (port `9090`) — Web management UI, accessed via the domain in `MINIO_CONSOLE_URL`

> **Note:** The MinIO template does **not** expose `MINIO_HOST`, `MINIO_PORT`, or `MINIO_ENDPOINT` variables. The internal S3 endpoint must be constructed manually: `http://minio.zeabur.internal:9000` (where `minio` is the service name).

### RustFS (template code: `7FG0WI`)

| Variable | Description |
|----------|-------------|
| `RUSTFS_USERNAME` | Access Key ID (default: `rustfs`) |
| `RUSTFS_PASSWORD` | Secret Access Key (auto-generated) |

The RustFS template exposes two HTTP ports:
- **API** (port `9000`) — S3-compatible API, accessed internally as `http://rustfs.zeabur.internal:9000`
- **Console** (port `9001`) — Web management UI

> **Note:** The RustFS template does **not** expose HOST/PORT/ENDPOINT variables. Construct the internal endpoint manually: `http://rustfs.zeabur.internal:9000` (where `rustfs` or `RustFS` is the service name — check `service list` for the exact name).

> **Variable names may differ across templates.** Always run `variable list` to confirm the actual keys.

---

## Integrate with Application

### Cross-service variable references

Zeabur uses a **flat variable namespace** — all exposed variables from every service in the same project are merged together. Your app can reference them directly by name, no service prefix needed:

```
${MINIO_USERNAME}
${MINIO_PASSWORD}
```

> **CLI limitation:** The CLI has a known bug with `${}` expansion — variable references should be set via the **Zeabur Dashboard**. See the `zeabur-variables` skill for details.

### S3 SDK env var mapping

Most S3-compatible SDKs need these values:

| App Env Var | MinIO Value | RustFS Value |
|-------------|-------------|--------------|
| `S3_ENDPOINT` or `AWS_ENDPOINT_URL` | `http://minio.zeabur.internal:9000` | `http://rustfs.zeabur.internal:9000` |
| `S3_ACCESS_KEY` or `AWS_ACCESS_KEY_ID` | `${MINIO_USERNAME}` | `${RUSTFS_USERNAME}` |
| `S3_SECRET_KEY` or `AWS_SECRET_ACCESS_KEY` | `${MINIO_PASSWORD}` | `${RUSTFS_PASSWORD}` |
| `S3_BUCKET` | `zeabur` (MinIO auto-creates this) | (must create bucket first) |
| `S3_REGION` | `us-east-1` (any value works, but must be set) | `us-east-1` |
| `S3_FORCE_PATH_STYLE` | `true` | `true` |

> **Important:** The S3 endpoint must be hardcoded or set manually because the templates don't expose it as a variable. Use the internal hostname `<service-name>.zeabur.internal:9000`.

### SDK code examples

```javascript
// Node.js (AWS SDK v3)
const { S3Client } = require("@aws-sdk/client-s3");
const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT, // http://minio.zeabur.internal:9000
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  region: "us-east-1",
  forcePathStyle: true,
});
```

```python
# Python (boto3)
import boto3
s3 = boto3.client(
    "s3",
    endpoint_url=os.environ["S3_ENDPOINT"],  # http://minio.zeabur.internal:9000
    aws_access_key_id=os.environ["S3_ACCESS_KEY"],
    aws_secret_access_key=os.environ["S3_SECRET_KEY"],
    region_name="us-east-1",
)
# boto3 uses path style by default when endpoint_url is set
```

```go
// Go (aws-sdk-go-v2)
cfg, _ := config.LoadDefaultConfig(ctx,
    config.WithRegion("us-east-1"),
    config.WithCredentialsProvider(
        credentials.NewStaticCredentialsProvider(accessKey, secretKey, ""),
    ),
)
client := s3.NewFromConfig(cfg, func(o *s3.Options) {
    o.BaseEndpoint = aws.String(endpoint) // http://minio.zeabur.internal:9000
    o.UsePathStyle = true
})
```

---

## Web Console

Both MinIO and RustFS provide a web console for managing buckets and files:

- **MinIO:** Console URL is in `MINIO_CONSOLE_URL`. Login with `MINIO_USERNAME` / `MINIO_PASSWORD`. The MinIO template auto-creates a `zeabur` default bucket.
- **RustFS:** Console is on the domain bound to port `9001`. Login with `RUSTFS_USERNAME` / `RUSTFS_PASSWORD`. **You must create a bucket manually** before the app can upload files.

---

## External Access (from local machine)

MinIO and RustFS ports are **HTTP type** (not TCP), so they are accessed via **domain binding** through Zeabur's reverse proxy — **not** via port forwarding.

Use `service instruction` to get the resolved external connection info:

```bash
npx zeabur@latest service instruction --id <storage-service-id> -i=false
```

This outputs the console URL and credentials with real values substituted.

For the **S3 API endpoint**, the API port is also HTTP and served via the bound domain. Use the domain URL as the S3 endpoint (e.g., `https://minio-api.zeabur.app`). If no domain is bound to the API port, bind one via the Dashboard or use the `zeabur-domain-url` skill.

Use the external S3 endpoint with local tools:

```bash
# MinIO Client (mc)
mc alias set zeabur https://MINIO_API_DOMAIN ACCESS_KEY SECRET_KEY
mc ls zeabur/
mc mb zeabur/my-bucket
mc cp local-file.txt zeabur/my-bucket/

# AWS CLI
aws --endpoint-url https://MINIO_API_DOMAIN s3 ls
aws --endpoint-url https://MINIO_API_DOMAIN s3 mb s3://my-bucket
```

---

## Caveats

1. **`forcePathStyle` is required** — MinIO and RustFS use path-style URLs (`http://host:9000/bucket/key`). Without `forcePathStyle: true` (or equivalent), S3 SDKs default to virtual-hosted-style (`http://bucket.host:9000/key`) which won't resolve on internal networks. This is the #1 cause of "bucket not found" or DNS errors.
2. **Create bucket before uploading (RustFS)** — Unlike the MinIO template which auto-creates a `zeabur` default bucket, RustFS starts with zero buckets. The app will get a `NoSuchBucket` error if the bucket doesn't exist. Create it via the web console or programmatically with `CreateBucket` API.
3. **S3 endpoint is not a template variable** — Neither MinIO nor RustFS templates expose the S3 API endpoint as an env var. For **inter-service** (internal) access, set it manually as `http://<service-name>.zeabur.internal:9000`. For **external** access, bind a domain to the API port and use that domain URL.
4. **Ports are HTTP, not TCP** — Both MinIO and RustFS templates declare their ports as HTTP type. This means they go through Zeabur's reverse proxy and are accessed via domain binding — **not** via port forwarding. `service network` will NOT show forwarded ports for these services.
5. **Console vs API ports** — MinIO uses port `9000` for S3 API and port `9090` for web console. RustFS uses `9000` for API and `9001` for console. Applications should connect to the API port, not the console port.
6. **Data persistence** — Storage templates include volumes. Uploaded files survive restarts.
7. **Large file uploads** — If uploads fail or timeout, check the app's request size limits (e.g., Nginx `client_max_body_size`, Express `bodyParser.limit`). The storage service itself has no practical upload limit.
