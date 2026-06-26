---
name: zeabur-server-catalog
description: Use when browsing available dedicated server options. Use when user asks "what servers are available", "show server prices", or "compare server plans". Do NOT use for listing owned servers (use zeabur-server-list instead).
---

# Zeabur Server Catalog

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Get All Available Options (JSON)

```bash
npx zeabur@latest server catalog -i=false
```

Returns JSON with all providers, regions, and plans:

```json
{
  "providers": [
    {
      "code": "HETZNER",
      "name": "Hetzner",
      "regions": [
        {
          "id": "nbg1",
          "name": "Nuremberg",
          "city": "",
          "country": "DE",
          "continent": "",
          "plans": [
            {
              "name": "cpx22",
              "cpu": 2,
              "memory": 4,
              "disk": 80,
              "egress": 20000,
              "price": 6,
              "originalPrice": 7.46,
              "available": true
            }
          ]
        }
      ]
    }
  ]
}
```

**Notes:**
- `price` is in **USD per month** (integer or float). `originalPrice` shows the provider's list price before Zeabur discount.
- `memory` is in **GB** (not MB).
- `egress` is monthly bandwidth in **GB**.
- `code` is **uppercase** (e.g. `HETZNER`, `VULTR`), but `--provider` filter accepts lowercase.

## Filter Options

| Flag | Example | Description |
|------|---------|-------------|
| `--provider` | `--provider hetzner` | Filter by provider code |
| `--country` | `--country DE` | Filter by country code |
| `--min-cpu` | `--min-cpu 4` | Minimum CPU cores |
| `--min-memory` | `--min-memory 8192` | Minimum memory in **MB** (note: JSON output uses GB) |
| `--gpu` | `--gpu` | Only GPU plans |

```bash
# Example: 4+ core servers in Germany
npx zeabur@latest server catalog --country DE --min-cpu 4 -i=false
```

## Use With Server Rent

Parse the catalog JSON to extract `provider`, `region`, and `plan` values, then use the `zeabur-server-rent` skill to rent:

```bash
npx zeabur@latest server rent --provider <code> --region <id> --plan <name> -y -i=false
```

