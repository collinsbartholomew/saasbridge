# Deploy to Netlify

`netlify.toml` is committed and ready.

## 1. Push to GitHub

```bash
git push origin main
```

## 2. Import to Netlify

- Go to https://app.netlify.com/start and connect your repo.
- Netlify auto-detects Next.js and installs `@netlify/plugin-nextjs`.
- Build command: `pnpm build` (from `netlify.toml`).
- Publish directory: `.next` (from `netlify.toml`).

## 3. Add environment variables

In **Site settings → Environment variables**. Same list as Vercel:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `BETTER_AUTH_SECRET` | 32+ char random string |
| `BETTER_AUTH_URL` | `https://<your-site>.netlify.app` |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Verified sender |
| `NEXT_PUBLIC_APP_NAME` | Public app name |
| `NEXT_PUBLIC_APP_URL` | Same as `BETTER_AUTH_URL` |

Optional: `AI_GATEWAY_API_KEY`.

## 4. First deploy

- **Deploy site**. First build ~2 minutes.
- Run production migration from your machine:

  ```bash
  DATABASE_URL="<prod-pooled-url>" pnpm db:migrate
  ```

## 5. Verify

Same checks as the Vercel guide: sign in, verify OTP, enable 2FA, check logs.

## Notes

- Netlify handles Next.js 16 including Server Actions and `proxy.ts` via `@netlify/plugin-nextjs`.
- **Log drains:** Netlify → Site settings → Log drains. The logger emits JSON lines to stdout.
- **Custom domains:** Netlify → Domain management.

## Known limitations vs Vercel

- **Fluid Compute** is Vercel-specific. On Netlify, functions run on AWS Lambda under the plugin. Cold starts may be marginally higher.
- **Rolling Releases** — Netlify has its own gradual-rollout equivalent via deploy contexts.
- **Runtime Cache API** (the Vercel KV-style ephemeral cache) is unavailable. If your app uses it (SaaSBridge's defaults do not), swap to a Marketplace-provisioned Redis.

## Troubleshooting

**Build fails with `Cannot find module '@netlify/plugin-nextjs'`**
Netlify auto-installs this from `netlify.toml`. If it doesn't, add it manually:
```bash
pnpm add -D @netlify/plugin-nextjs
```

**Headers missing in production**
SaaSBridge emits security headers from `next.config.ts`, not Netlify's headers file. Confirm `next.config.ts` is deployed and the plugin is active.
