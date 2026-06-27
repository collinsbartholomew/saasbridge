# Architecture

A system-level view of how SaaSBridge fits together.

## Runtime topology

```
           ┌─────────────────────────────────────────┐
 Browser ──▶ Vercel / Netlify (Next.js 16)           │
           │                                         │
           │  ┌───────────────┐  ┌────────────────┐  │
           │  │ Server        │  │ proxy.ts       │  │
           │  │ Components    │◀─┤ (request-ID,   │  │
           │  │ + Actions     │  │  auth gate)    │  │
           │  └───────┬───────┘  └────────────────┘  │
           │          │                              │
           │  ┌───────▼────────┐   ┌──────────────┐  │
           │  │ src/lib/auth   │   │ src/lib/     │  │
           │  │ (Better Auth)  │   │   rate-limit │  │
           │  └───────┬────────┘   │   idempotency│  │
           │          │            │   audit      │  │
           │  ┌───────▼────────┐   │   logger     │  │
           │  │ src/db (Drizzle)│◀──┤   email     │  │
           │  └───────┬────────┘   └──────────────┘  │
           └──────────┼──────────────────────────────┘
                      │
                 Neon Postgres                Resend
                  (HTTP)                     (transactional email)
```

## Request lifecycle (protected page)

1. Browser requests `/dashboard`.
2. `proxy.ts` runs: assigns a `x-request-id` header, reads the Better Auth session cookie, verifies it against the DB session store, and either passes through or redirects to `/sign-in`.
3. Next.js renders the Server Component for `/dashboard`, which imports helpers from `src/lib/auth` and `src/db`.
4. Queries hit Neon over HTTP (Drizzle's `neon-http` driver).
5. Rendered HTML streams to the browser. A small client bundle hydrates only the interactive islands.

## Mutation lifecycle (Server Action)

1. A form calls `action={serverAction}` (or `useActionState` for progressive enhancement).
2. The action runs on the server, validates input with Zod, performs the DB write via Drizzle, optionally calls `audit(...)`, then `revalidatePath('/...')`.
3. Next.js re-renders affected Server Components with fresh data; the UI updates.
4. If the action throws, a typed `{ ok: false, error }` is returned to the client; we show a `sonner` toast.

## Data layer

- Tables live under `src/db/schema/`.
- `src/db/client.ts` exports `db` — a Drizzle instance bound to the Neon HTTP client.
- Migrations land in `drizzle/` via `pnpm db:generate` and are applied via `pnpm db:migrate`.
- **Do not** query the DB from client components. Always go through a server helper.

### Canonical tables (v1)

| Table | Purpose |
|---|---|
| `user`, `session`, `account`, `verification` | Better Auth core |
| `two_factor`, `trusted_device`, `backup_code` | Better Auth 2FA plugins |
| `audit_logs` | Security-sensitive-action ledger |
| `webhook_events` | Dedupe store for inbound webhooks |
| `idempotency_keys` | 24h cache for idempotent endpoints |
| `projects` | The canonical example domain |

## Auth

- Primary: **email OTP** (passwordless). No password = no password-reset flow.
- Optional: **TOTP 2FA** — enabled in `/settings/security`. Backup codes + trusted-device shortening follow Better Auth's defaults.
- Sessions live in the DB via Better Auth's Drizzle adapter; rotating on sign-in, expiring on logout.
- `proxy.ts` is the single chokepoint that decides public vs authenticated routes.

## Security

| Concern | How we handle it |
|---|---|
| **CSP + headers** | `next.config.ts` emits strict CSP, HSTS, X-Frame-Options, Permissions-Policy on every response |
| **Rate limiting** | `src/lib/rate-limit/` — adapter interface, in-memory default. Applied to auth and webhook endpoints |
| **Secret scanning** | Gitleaks on every PR + GitHub push-protection |
| **Dependency vulns** | Dependabot + `pnpm audit --prod --audit-level=high` in CI + CodeQL weekly scan |
| **Webhook integrity** | HMAC signature verification + `(source, external_id)` unique index on `webhook_events` |
| **Idempotency** | `withIdempotency(key, fn)` helper + `idempotency_keys` table |
| **Audit trail** | `audit({ actor, action, target, metadata })` for security-sensitive mutations |
| **Env validation** | Boot-time Zod parse in `src/lib/env.ts` — fails fast on missing or invalid vars |

## Observability

No Sentry in v1 — but the primitives are in place:

- `src/lib/logger.ts` — structured JSON on prod, pretty on dev, request-ID-aware
- Vercel / Netlify native log drains capture stdout
- Every Server Action catches + logs errors before returning `{ ok: false }`
- See `docs/observability.md` for reading logs locally and on host

When you outgrow this, see `docs/add-sentry-later.md`.

## Extension seams (already wired, typed, inert)

- `src/lib/ai/gateway.ts` — returns `{ ok: false, reason: "disabled" }` unless `AI_GATEWAY_API_KEY` is set
- `src/lib/flags.ts` — env-backed `isEnabled(key)` for coarse feature flags
- `src/lib/analytics.ts` — `track(event, props)` — no-op by default; wire to PostHog/Segment later
- `src/lib/i18n.ts` — typed `t(key)` over a single dictionary; swap for `next-intl` when you add locales

## Deployment

- **Vercel:** `vercel.json` committed. Zero-config framework detection + function `maxDuration: 30s`.
- **Netlify:** `netlify.toml` committed with `@netlify/plugin-nextjs`.
- **Self-host:** Standard `next start`. CSP headers are emitted by the Next runtime so they work anywhere.

See `docs/deploy-vercel.md` and `docs/deploy-netlify.md` for step-by-step.
