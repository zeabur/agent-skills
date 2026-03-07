---
name: zeabur-server-catalog
description: Use when browsing available dedicated server options. Use when user asks what servers are available to rent.
---

# Zeabur Server Catalog

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method.

## Get All Available Options (JSON)

```bash
npx zeabur@latest server catalog -i=false
```

Returns JSON with all providers, regions, and plans:

```json
{
  "providers": [
    {
      "code": "hetzner",
      "name": "Hetzner",
      "regions": [
        {
          "id": "fsn1",
          "name": "Falkenstein",
          "city": "Falkenstein",
          "country": "DE",
          "plans": [
            {
              "name": "CAX11",
              "cpu": 2,
              "memory": 4096,
              "disk": 40,
              "price": 399,
              "available": true
            }
          ]
        }
      ]
    }
  ]
}
```

**Note:** `price` is in cents (USD). Divide by 100 for dollars per month.

## Filter Options

| Flag | Example | Description |
|------|---------|-------------|
| `--provider` | `--provider hetzner` | Filter by provider code |
| `--country` | `--country DE` | Filter by country code |
| `--min-cpu` | `--min-cpu 4` | Minimum CPU cores |
| `--min-memory` | `--min-memory 8192` | Minimum memory in MB |
| `--gpu` | `--gpu` | Only GPU plans |

```bash
# Example: 4+ core servers in Germany
npx zeabur@latest server catalog --country DE --min-cpu 4 -i=false
```

## Use With Server Rent

Parse the catalog JSON to extract `provider`, `region`, and `plan` values, then:

```bash
npx zeabur@latest server rent --provider <code> --region <id> --plan <name> -y -i=false
```
