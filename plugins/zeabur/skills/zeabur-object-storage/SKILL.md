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

## After Deployment: How to Connect

For object storage, you need: **S3 API endpoint** (how to connect), **access key + secret key** (how to authenticate), and a **bucket name**.

### How to connect — `service network`

```bash
npx zeabur@latest service network --id <storage-service-id> -i=false
```

This shows:
- **Private Networking** — internal `hostname:port` for the S3 API (e.g., `minio.zeabur.internal:9000`)
- **Public Networking** — for HTTP ports, it will indicate you need to bind a domain to access externally

> MinIO and RustFS ports are **HTTP type**, so public access is via **domain binding**, not port forwarding. Bind a domain to the API port via the Dashboard to get an external S3 endpoint (e.g., `https://minio-api.zeabur.app`).

### How to authenticate — `variable list`

```bash
npx zeabur@latest variable list --id <storage-service-id> -i=false
```

This lists the access key, secret key, and other credentials.

---

## MinIO

### Credentials (from `variable list`)

| Variable | Description |
|----------|-------------|
| `MINIO_USERNAME` | Access Key ID (default: `minio`) |
| `MINIO_PASSWORD` | Secret Access Key (auto-generated) |
| `MINIO_DEFAULT_BUCKET` | Default bucket name (default: `zeabur`) |
| `MINIO_CONSOLE_URL` | Web console URL |

### Connect from app (same project)

Set these env vars on your app service:

```
S3_ENDPOINT=http://minio.zeabur.internal:9000
S3_ACCESS_KEY=${MINIO_USERNAME}
S3_SECRET_KEY=${MINIO_PASSWORD}
S3_BUCKET=zeabur
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true
```

> The S3 endpoint is not exposed as a variable — you must hardcode it using the internal hostname from `service network`.

### Connect from local machine

Bind a domain to the API port, then use that domain as endpoint:

```bash
# MinIO Client (mc)
mc alias set zeabur https://MINIO_API_DOMAIN MINIO_USERNAME MINIO_PASSWORD
mc ls zeabur/
mc cp local-file.txt zeabur/zeabur/

# AWS CLI
aws --endpoint-url https://MINIO_API_DOMAIN s3 ls
```

### Web Console

Open `MINIO_CONSOLE_URL` in a browser, login with `MINIO_USERNAME` / `MINIO_PASSWORD`. MinIO auto-creates a `zeabur` bucket on first boot.

---

## RustFS

### Credentials (from `variable list`)

| Variable | Description |
|----------|-------------|
| `RUSTFS_USERNAME` | Access Key ID (default: `rustfs`) |
| `RUSTFS_PASSWORD` | Secret Access Key (auto-generated) |

### Connect from app (same project)

Set these env vars on your app service:

```
S3_ENDPOINT=http://rustfs.zeabur.internal:9000
S3_ACCESS_KEY=${RUSTFS_USERNAME}
S3_SECRET_KEY=${RUSTFS_PASSWORD}
S3_BUCKET=my-bucket
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true
```

> The S3 endpoint is not exposed as a variable — you must hardcode it using the internal hostname from `service network`. Also check `service list` for the exact service name (may be `RustFS` not `rustfs`).

> **You must create a bucket first** — unlike MinIO, RustFS starts with zero buckets.

### Connect from local machine

Bind a domain to the API port, then:

```bash
mc alias set zeabur https://RUSTFS_API_DOMAIN RUSTFS_USERNAME RUSTFS_PASSWORD
mc mb zeabur/my-bucket
mc ls zeabur/
```

### Web Console

Open the domain bound to port `9001` in a browser, login with `RUSTFS_USERNAME` / `RUSTFS_PASSWORD`. Create a bucket before your app can upload files.

---

## SDK Examples

All S3-compatible SDKs need: endpoint, access key, secret key, region, and `forcePathStyle: true`.

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

```python
# Python (boto3)
import boto3, os
s3 = boto3.client(
    "s3",
    endpoint_url=os.environ["S3_ENDPOINT"],
    aws_access_key_id=os.environ["S3_ACCESS_KEY"],
    aws_secret_access_key=os.environ["S3_SECRET_KEY"],
    region_name="us-east-1",
)
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
    o.BaseEndpoint = aws.String(endpoint)
    o.UsePathStyle = true
})
```

---

## Caveats

1. **`forcePathStyle` is required** — Without it, S3 SDKs use virtual-hosted-style URLs (`http://bucket.host:9000/key`) which won't resolve. This is the #1 cause of "bucket not found" errors.
2. **Create bucket before uploading (RustFS)** — MinIO auto-creates a `zeabur` bucket; RustFS does not. Create one via the console or `mc mb`.
3. **S3 endpoint is not a template variable** — Hardcode it using the hostname from `service network` (internal) or the bound domain (external).
4. **Variable references** — Zeabur uses a flat namespace. Set `${MINIO_USERNAME}` etc. via the **Zeabur Dashboard** — the CLI has a known bug with `${}` expansion.
5. **Console vs API ports** — MinIO: API `9000`, console `9090`. RustFS: API `9000`, console `9001`. Apps connect to the API port.
