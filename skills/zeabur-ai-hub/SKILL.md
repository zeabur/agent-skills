---
name: zeabur-ai-hub
description: Use when managing AI Hub account, API keys, balance, or usage. Use when user says "AI Hub", "add AI credits", "create API key", "check AI usage", or "auto-recharge".
---

# Zeabur AI Hub Management

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Check AI Hub Status

```bash
npx zeabur@latest ai-hub status -i=false
npx zeabur@latest ai-hub status -i=false --json
```

Shows tenant balance, API keys, and auto-recharge settings.

## API Key Management

```bash
# List all keys
npx zeabur@latest ai-hub keys list -i=false
npx zeabur@latest ai-hub keys ls -i=false --json

# Create a new key (optional alias)
npx zeabur@latest ai-hub keys create --alias "my-app" -i=false

# Delete a key
npx zeabur@latest ai-hub keys delete --key-id <key-id> -i=false
```

**The API key is only shown once at creation time.** Make sure the user saves it immediately.

## Add Balance

```bash
# Add $10 to AI Hub balance
npx zeabur@latest ai-hub add-balance --amount 10 -i=false
```

- Amount is in **whole dollars** (integer).
- Deducts from Zeabur account credits. If insufficient credits and no linked card, a checkout page opens in the browser automatically.

## Check Usage

```bash
# Current month usage
npx zeabur@latest ai-hub usage -i=false

# Specific month
npx zeabur@latest ai-hub usage --month 2026-03 -i=false
npx zeabur@latest ai-hub usage --month 2026-03 -i=false --json
```

Shows total spend and per-model cost breakdown. `--month` must be in `YYYY-MM` format.

## Auto-Recharge Settings

```bash
# Enable: recharge $20 when balance drops below $5
npx zeabur@latest ai-hub auto-recharge --threshold 5 --amount 20 -i=false

# Disable auto-recharge
npx zeabur@latest ai-hub auto-recharge --threshold 0 --amount 0 -i=false
```

Both `--threshold` and `--amount` are in whole dollars.

## See Also

- `zeabur-service-list` — get service IDs for other operations
