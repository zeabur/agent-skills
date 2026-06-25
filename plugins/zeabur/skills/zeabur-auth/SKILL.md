---
name: zeabur-auth
description: Use when logging in, logging out, or checking Zeabur auth status. Use when user says "login", "log in", "登入", "logout", "log out", "登出", "auth status", "am I logged in", or "who am I".
---

# Zeabur Authentication

> **Always use `npx zeabur@latest` to invoke Zeabur CLI.** Never use `zeabur` directly or any other installation method. If `npx` is not available, install Node.js first.

## Login

Run the login command directly — the CLI will automatically open the browser for the user:

```bash
npx zeabur@latest auth login
```

Login with a token (for CI/CD or headless environments):

```bash
npx zeabur@latest auth login --token <token> -i=false
```

## Check Login Status

```bash
npx zeabur@latest auth status -i=false
```

## Logout

```bash
npx zeabur@latest auth logout -i=false
```

## Tips

- **Never ask the user to run the login command themselves** — run it directly and let the CLI auto-open the browser
- Token-based login is useful for CI/CD or headless environments
- Run `auth status` first to check if the user is already logged in before suggesting login
