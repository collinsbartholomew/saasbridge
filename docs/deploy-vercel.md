# Deploy to Vercel

SaaSBridge ships with a minimal `vercel.json` and is zero-config from there.

## 1. Push to GitHub

```bash
git push origin main
```

## 2. Import to Vercel

- Go to https://vercel.com/new and import your repo.
- Framework preset is auto-detected (Next.js).
- Leave install + build commands as-is (Vercel reads `vercel.json`).

## 3. Add environment variables

In the Vercel dashboard → your project → **Settings → Environment Variables**. Add these for **Production** (and optionally Preview):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `BETTER_AUTH_SECRET` | 32+ char random string (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | `https://<your-domain>.vercel.app` (or your custom domain) |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Verified Resend sender, e.g. `"Your App <no-reply@yourdomain.com>"` |
| `NEXT_PUBLIC_APP_NAME` | Your public app name |
| `NEXT_PUBLIC_APP_URL` | Same as `BETTER_AUTH_URL` |

Optional:

| Variable | When |
|---|---|
| `AI_GATEWAY_API_KEY` | If you're enabling AI features (see `docs/add-ai-later.md`) |

## 4. First deploy

- Click **Deploy**. First build ~90s.
- Once live, run the database migration against production:

  ```bash
  # From your local machine, pointing at the production DB:
  DATABASE_URL="<prod-pooled-url>" pnpm db:migrate
  ```

  (SaaSBridge intentionally does not run migrations in the build step — migrations should be an explicit, reviewable action.)

## 5. Verify

1. Visit your domain.
2. Sign in with a real email; verify the OTP arrives via Resend.
3. Enable 2FA in `/settings/security`; confirm the QR + backup codes work.
4. Check **Vercel → Logs** — you should see structured JSON lines with request IDs.

## Troubleshooting

**`CSP` blocks something**
CSP defaults are strict. If you add a third-party script/origin, extend `csp` in `next.config.ts` and redeploy.

**`middleware.ts` isn't being picked up**
SaaSBridge uses `proxy.ts` (Next.js 16 naming). Do **not** rename it.

**Slow cold starts**
Fluid Compute (default) warms instances across requests. If you still see slow cold starts, bump `maxDuration` in `vercel.json` or move to a closer region.

**OTP email lands in spam**
Verify your sending domain in Resend, set up SPF + DKIM, and use a verified `EMAIL_FROM` on your own domain. `onboarding@resend.dev` works for testing but shouldn't be used in real production.

## Recommended settings

- Enable **Rolling Releases** for safer deploys.
- Turn on **Vercel Firewall** basic bot-protection for public endpoints.
- Enable **Speed Insights** and **Web Analytics** (opt-in, privacy-preserving).

## Custom domains

Add your domain in Vercel → Settings → Domains. Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` env vars, then redeploy.
