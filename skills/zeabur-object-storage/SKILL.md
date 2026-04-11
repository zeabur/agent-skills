---
name: zeabur-object-storage
description: Use when deploying object storage (S3-compatible) to Zeabur. Use when user needs MinIO, RustFS, or S3-compatible storage. Use when user says "object storage", "file storage", "S3", "MinIO", "RustFS", "upload files", "store files", "blob storage", or "OSS". Also use when integrating object storage with an existing service.
---

# Zeabur Object Storage Deployment & Integration

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Deploy Object Storage

Search and deploy an object storage template:

```bash
# Search for a storage template (minio, rustfs)
npx zeabur@latest template search minio -i=false --json

# Inspect a template's full definition (env vars, volumes, ports)
npx zeabur@latest template get -c <TEMPLATE_CODE> --raw

# Deploy to the user's project
npx zeabur@latest template deploy -c <TEMPLATE_CODE> -i=false --project-id <project-id>
```

Pick the template with the highest deployment count.

- **Default to MinIO** if the user doesn't specify — most widely supported, built-in web console.
- **Recommend RustFS** if the user wants lightweight/minimal or mentions RustFS.

> For creating a custom storage template from scratch, use the `zeabur-template` skill.

---

## Retrieve Connection Parameters

After deploying, list the storage service's variables:

```bash
npx zeabur@latest variable list --id <storage-service-id> -i=false
```

Common variables exposed by storage templates:

| Service | Key Variables | Description |
|---------|--------------|-------------|
| MinIO | `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_HOST`, `MINIO_PORT`, `MINIO_ENDPOINT` | Endpoint is `http://<host>:<port>` |
| RustFS | `RUSTFS_ROOT_USER`, `RUSTFS_ROOT_PASSWORD`, `RUSTFS_HOST`, `RUSTFS_PORT`, `RUSTFS_ENDPOINT` | Same pattern as MinIO |

> **Variable names depend on the template.** Always run `variable list` to confirm the actual keys.

---

## Integrate with Application

### Cross-service variable references

In Zeabur, services can reference other services' exposed variables using the `${SERVICE_NAME.VAR_NAME}` syntax. For example, if the storage service is named `minio`:

```
${MINIO.MINIO_ENDPOINT}
${MINIO.MINIO_ROOT_USER}
${MINIO.MINIO_ROOT_PASSWORD}
```

> **CLI limitation:** The CLI has a known bug with `${}` expansion — cross-service references should be set via the **Zeabur Dashboard** or GraphQL API. See the `zeabur-variables` skill for details.

### S3 SDK env var mapping

Most S3-compatible SDKs use these standard env vars:

| App Env Var | Value | Notes |
|-------------|-------|-------|
| `S3_ENDPOINT` or `AWS_ENDPOINT_URL` | `${MINIO.MINIO_ENDPOINT}` | Internal endpoint, e.g. `http://minio.zeabur.internal:9000` |
| `S3_ACCESS_KEY` or `AWS_ACCESS_KEY_ID` | `${MINIO.MINIO_ROOT_USER}` | |
| `S3_SECRET_KEY` or `AWS_SECRET_ACCESS_KEY` | `${MINIO.MINIO_ROOT_PASSWORD}` | |
| `S3_BUCKET` | (bucket name created in console) | Must create bucket first |
| `S3_REGION` | `us-east-1` | Any value works, but must be set |
| `S3_FORCE_PATH_STYLE` | `true` | **Required** — see caveats |

### SDK code examples

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
import boto3
s3 = boto3.client(
    "s3",
    endpoint_url=os.environ["S3_ENDPOINT"],
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
    o.BaseEndpoint = aws.String(endpoint)
    o.UsePathStyle = true
})
```

---

## Web Console

Both MinIO and RustFS provide a web console (usually on port 9001) for managing buckets and files. After deployment:

1. Check the service list for the console domain:
   ```bash
   npx zeabur@latest service list --project-id <project-id>
   ```
2. Log in with root credentials (from `variable list`).
3. **Create a bucket** before the application can upload files — most S3 SDKs don't auto-create buckets.

---

## Local Connection (Port Forwarding)

The S3 API port (9000) is TCP with port forwarding auto-enabled. To get the external endpoint:

```bash
npx zeabur@latest service network --id <storage-service-id>
```

Use the forwarded host:port to connect from local tools:

```bash
# MinIO Client (mc)
mc alias set zeabur http://FORWARDED_HOST:FORWARDED_PORT ACCESS_KEY SECRET_KEY
mc ls zeabur/
mc mb zeabur/my-bucket
mc cp local-file.txt zeabur/my-bucket/

# AWS CLI
aws --endpoint-url http://FORWARDED_HOST:FORWARDED_PORT s3 ls
aws --endpoint-url http://FORWARDED_HOST:FORWARDED_PORT s3 mb s3://my-bucket
```

---

## Caveats

1. **`forcePathStyle` is required** — MinIO and RustFS use path-style URLs (`http://host:9000/bucket/key`). Without `forcePathStyle: true` (or equivalent), S3 SDKs default to virtual-hosted-style (`http://bucket.host:9000/key`) which won't resolve on internal networks. This is the #1 cause of "bucket not found" or DNS errors.
2. **Create bucket before uploading** — Unlike managed S3, self-hosted storage starts with zero buckets. The app will get a `NoSuchBucket` error if the bucket doesn't exist. Create it via the web console, `mc mb`, or programmatically with `CreateBucket` API.
3. **Data persistence** — Storage templates include volumes. Uploaded files survive restarts. If a user reports file loss, verify the template has a `volumes` section.
4. **Console vs API ports** — The web console (port 9001, HTTP) and S3 API (port 9000, TCP) are separate. Applications should connect to the API port, not the console port.
5. **Large file uploads** — If uploads fail or timeout, check the app's request size limits (e.g., Nginx `client_max_body_size`, Express `bodyParser.limit`). The storage service itself has no practical upload limit.
