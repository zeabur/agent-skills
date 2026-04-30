---
name: zeabur-image-gen
description: Use when user asks to generate an image and post it to Discord. Triggers on "生成圖片", "generate image", "draw", "畫", "image gen", "圖片生成", or any request to create visual content and send it to a Discord channel.
---

# Zeabur Image Generation → Discord

Generate an image via Zeabur AI Hub and post it to a Discord channel.

## Prerequisites

- Zeabur AI Hub API key (`test-image-gen-2`: `sk-Wqu7za_At5GjesYPFmPgpw`)
- Discord bot token (use **claude** bot by default: see memory `reference_openab_bot_tokens.md`)
- Target Discord channel ID (read from `sender_context.channel_id` in the user's message)

## Step 1 — Generate the image

Use `gemini-2.5-flash-image` via the chat completions endpoint (NOT `/v1/images/generations`):

```bash
curl -s -X POST https://hnd1.aihub.zeabur.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-Wqu7za_At5GjesYPFmPgpw" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash-image",
    "messages": [{"role": "user", "content": "<PROMPT>"}],
    "modalities": ["text", "image"]
  }'
```

The response contains `choices[0].message.images[0].image_url.url` — a `data:image/png;base64,...` string.

> **Note:** The response is large (1–2 MB). Save it to a temp file and extract with Node.js, not shell pipes.

## Step 2 — Save to temp file

```bash
# Save the full API response first
curl ... > /tmp/imggen_response.json

# Then extract and decode with Node.js
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/tmp/imggen_response.json', 'utf8'));
const b64 = data.choices[0].message.images[0].image_url.url.replace('data:image/png;base64,', '');
fs.writeFileSync('/tmp/generated_image.png', Buffer.from(b64, 'base64'));
console.log('size:', fs.statSync('/tmp/generated_image.png').size);
"
```

## Step 3 — Post to Discord

Use the claude bot token and the channel ID from `sender_context`:

```bash
curl -s -X POST "https://discord.com/api/v10/channels/<CHANNEL_ID>/messages" \
  -H "Authorization: Bot <BOT_TOKEN>" \
  -F "content=<optional caption>" \
  -F "files[0]=@/tmp/generated_image.png;type=image/png"
```

## Available image models (AI Hub)

| Model | Notes |
|-------|-------|
| `gemini-2.5-flash-image` | Fast, good quality — recommended |
| `gemini-3-pro-image-preview` | Higher quality, slower |
| `gemini-3.1-flash-image-preview` | Latest flash variant |

## Example flow

User says: `幫我生成一張可愛的貓咪圖片`

1. Extract `channel_id` from `sender_context` in the message
2. Read claude bot token from memory (`reference_openab_bot_tokens.md`)
3. Call image generation with prompt `一張可愛的卡通貓咪`
4. Save → upload to Discord
5. Confirm with the channel ID and image size

## Error handling

| Error | Fix |
|-------|-----|
| `404` on `/v1/images/generations` | Use `/v1/chat/completions` instead (this is correct) |
| `401 auth_error` | Check API key starts with `sk-` |
| `50013 Missing Permissions` | Bot lacks `Send Messages` or `Attach Files` in that channel |
| Response too large for shell | Save to file first, decode with Node.js |
