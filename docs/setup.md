# Setup

A walkthrough from `git clone` to `pnpm dev` running on your machine. Beginner-friendly.

## 0. Prerequisites

- **Node.js 22 (or 20+)** — [install via fnm or nvm](https://github.com/Schniz/fnm).
- **pnpm 10** — `npm install -g pnpm` (we pin `packageManager` in `package.json`, so anything ≥10 works).
- A **Neon** account (free) — https://console.neon.tech.
- A **Resend** account (optional in dev) — https://resend.com.

## 1. Clone and install

```bash
git clone https://github.com/OWNER/nextbase.git my-app
cd my-app
pnpm install
```

## 2. Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local`. Every variable has an inline comment explaining where to get the value. You need at minimum:

- `DATABASE_URL` — your Neon pooled connection string. Copy it from the Neon dashboard → your project → "Connection string" → toggle "Pooled connection".
- `BETTER_AUTH_SECRET` — generate one:

  ```bash
  openssl rand -base64 32
  ```

- `BETTER_AUTH_URL` — leave as `http://localhost:3000` for dev.

In development, `RESEND_API_KEY` is **optional**. If unset, sign-in OTP codes are printed to the terminal so you can log in without sending real email.

## 3. Initialize the database

```bash
pnpm db:generate   # produces SQL migrations from the Drizzle schema
pnpm db:migrate    # applies them to your Neon DB
```

Optional: seed a dev user + sample data (idempotent — safe to re-run):

```bash
pnpm db:seed
```

## 4. Run the dev server

```bash
pnpm dev
```

Open http://localhost:3000.

1. Click **Sign in**.
2. Enter any email — you'll be redirected to `/verify`.
3. Look in your terminal — the 6-digit OTP is printed there.
4. Paste it on the verify page.
5. You're on the dashboard.

## 5. Enable 2FA (optional)

1. From the dashboard, go to **Settings → Security**.
2. Click **Enable two-factor authentication**.
3. Scan the QR code with Google Authenticator, 1Password, Authy, or Bitwarden.
4. Enter the code to confirm.
5. **Save your backup codes** — they're shown once.

Next sign-in will ask for the TOTP code after the OTP.

## 6. Run the tests

```bash
pnpm lint            # Biome — lint + format check
pnpm typecheck       # TypeScript strict
pnpm test:unit       # Vitest unit + component tests
pnpm test:e2e        # Playwright smoke (requires Chromium)
```

On first `test:e2e` Playwright will download Chromium.

## 7. What next?

- **Customize the UI:** see `docs/customization.md`.
- **Deploy:** `docs/deploy-vercel.md` or `docs/deploy-netlify.md`.
- **Add an AI feature:** `docs/add-ai-later.md`.
- **Add something that's not in v1:** check the `docs/add-*-later.md` index.

## Troubleshooting

**"Invalid server environment variables" on boot**
One or more env vars in `.env.local` is missing or wrong. The error lists each one — fix and re-run.

**Database connection errors**
Make sure you're using the *pooled* connection string from Neon (the one that has `-pooler` in the hostname). The HTTP client doesn't hold long-lived connections.

**OTP email never arrives (in production)**
Verify `RESEND_API_KEY` is set in Vercel/Netlify. If it is, check Resend's dashboard → **Emails** for bounce/delivery logs. Ensure `EMAIL_FROM` matches a *verified sender* on your Resend account.

**2FA code rejected**
Time drift between your authenticator app and server. On the sending device, make sure automatic time is on; on the server, trust `Date.now()`.

**`pnpm test:e2e` fails to launch Chromium**
Run `pnpm exec playwright install chromium --with-deps`.
