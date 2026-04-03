---
name: zeabur-ai-hub
description: Use when managing AI Hub account, API keys, balance, usage, or API endpoints. Use when user says "AI Hub", "add AI credits", "create API key", "check AI usage", "auto-recharge", "AI Hub endpoint", "AI Hub base URL", "how to use AI Hub API", "LLM API", "AI API", "OpenAI compatible", "Anthropic API", "GPT", "Claude", "Gemini", "DeepSeek", or "Grok" in the context of Zeabur.
---

# Zeabur AI Hub Management

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## API Endpoints

AI Hub is OpenAI-compatible. Users can pick the region closest to them:

| Region | Endpoint |
|--------|----------|
| Tokyo, Japan (HND1) | `https://hnd1.aihub.zeabur.ai/` |
| San Francisco, USA (SFO1) | `https://sfo1.aihub.zeabur.ai/` |

### Quick Start (OpenAI SDK)

**JavaScript / TypeScript:**

```javascript
import OpenAI from "openai";

const client = new OpenAI({
    baseURL: "https://hnd1.aihub.zeabur.ai/v1",  // or sfo1
    apiKey: "sk-xxxxxxxxxxxxxxxx",              // from AI Hub dashboard
});

const stream = await client.chat.completions.create({
    model: "claude-sonnet-4-5",  // any model available on AI Hub
    messages: [{ role: "user", content: "Hello!" }],
    stream: true,
});
```

**Python:**

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://hnd1.aihub.zeabur.ai/v1",  # or sfo1
    api_key="sk-xxxxxxxxxxxxxxxx",              # from AI Hub dashboard
)

stream = client.chat.completions.create(
    model="claude-sonnet-4-5",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=True,
)
```

**curl:**

```bash
curl https://hnd1.aihub.zeabur.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4-5","messages":[{"role":"user","content":"Hello!"}]}'
```

### Other SDK Compatibility

- **Anthropic SDK**: set `baseURL` / `base_url` to the endpoint above
- **Vercel AI SDK (`@ai-sdk/openai`)**: set `baseURL` to the endpoint above

### Environment Variables

When users deploy apps on Zeabur, suggest setting:

```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
OPENAI_BASE_URL=https://hnd1.aihub.zeabur.ai/v1
```

Most OpenAI-compatible libraries will pick these up automatically.

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
