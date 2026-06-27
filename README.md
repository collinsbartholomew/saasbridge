# SaaSBridge

> A lean, production-shaped Next.js 16 SaaS starter — zero bloat, beginner-friendly, agent-ready.

**SaaSBridge** is an opinionated open-source starter you can clone, fill in two env vars, and deploy to Vercel or Netlify in five minutes. It ships with passwordless auth (email OTP + TOTP 2FA), a real database layer, secure defaults, and clean extension seams for AI, billing, teams, and observability — without forcing any of them on you in v1.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![CI](https://github.com/OWNER/nextbase/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)

## What's inside

- **Next.js 16** App Router, Server Components, Server Actions, `proxy.ts`, `typedRoutes`
- **TypeScript** (strict), **Tailwind v4**, **shadcn/ui** (new-york style, Radix primitives)
- **Biome** for lint + format (one tool, zero config)
- **Better Auth** — email OTP primary, TOTP 2FA, backup codes, trusted devices
- **Drizzle ORM** + **Neon** Postgres
- **React Hook Form** + **Zod** — forms and runtime validation end-to-end
- **TanStack Table** — canonical example on the `projects` screen
- **Zustand** — local UI state only
- **Sonner** + **Lucide** + **next-themes**
- **Resend** — production email; **console fallback** in dev
- **Vercel AI Gateway** — wired and ready, disabled until you set an API key
- **Vitest** + **Testing Library** + **Playwright** + **Axe** — unit + UAT smoke + a11y
- **Security baked in** — strict CSP + security headers, Zod-validated env, in-memory rate limiter with pluggable adapters, audit log, webhook idempotency, CodeQL + Gitleaks + Dependabot + `pnpm audit` in CI

## Requirements

You need one paid/free account at each of:

| Service | Why | Free tier? |
|---|---|---|
| [Neon](https://console.neon.tech) | Postgres database | Yes |
| [Vercel](https://vercel.com) **or** [Netlify](https://netlify.com) | Hosting | Yes |
| [Resend](https://resend.com) | Sending OTP emails in production | Yes (3k emails/mo) |

That's it. No Redis, no Stripe, no Sentry, no Upstash required for v1.

## Quickstart

```bash
git clone https://github.com/OWNER/nextbase.git my-app
cd my-app
pnpm install

cp .env.example .env.local
# Fill in DATABASE_URL and BETTER_AUTH_SECRET (at minimum).
# Each variable has an inline comment explaining where to get it.

pnpm db:generate       # generate initial migration
pnpm db:migrate        # apply to your Neon DB
pnpm dev               # open http://localhost:3000
```

Sign in with any email — in dev, your OTP code is printed to the terminal. In production, Resend delivers it.

## Deploy

### Vercel (recommended)

```bash
pnpm dlx vercel
```

Vercel auto-detects Next.js and picks up `vercel.json`. Set the four env vars in the dashboard:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET` (32+ chars — generate with `openssl rand -base64 32`)
- `BETTER_AUTH_URL` (your production URL)
- `RESEND_API_KEY`

Full guide: [`docs/deploy-vercel.md`](docs/deploy-vercel.md).

### Netlify

See [`docs/deploy-netlify.md`](docs/deploy-netlify.md). `netlify.toml` is committed and ready.

## What's _not_ included (on purpose)

This starter deliberately omits features that are not one-size-fits-all. Each lives behind a short add-later doc so you can opt in when (and only when) you need it:

- **AI features** — [`docs/add-ai-later.md`](docs/add-ai-later.md)
- **Redis / durable rate limiting** — [`docs/add-redis-later.md`](docs/add-redis-later.md)
- **Sentry / error tracking** — [`docs/add-sentry-later.md`](docs/add-sentry-later.md)
- **Password-based auth** — [`docs/add-password-auth.md`](docs/add-password-auth.md)
- **TanStack Query** — [`docs/add-tanstack-query.md`](docs/add-tanstack-query.md)
- **Motion / Framer Motion** — [`docs/add-motion.md`](docs/add-motion.md)
- **Full i18n** — [`docs/add-i18n.md`](docs/add-i18n.md)
- Billing, teams/orgs, monorepo, queues — deferred to future guidance

## Agent-friendly

If you use an AI coding assistant (Claude Code, Cursor, Codex CLI, Aider, Continue, etc.), read [`AGENTS.md`](AGENTS.md) first — it's the canonical behavioral contract for agents in this repo. `CLAUDE.md` and `.cursorrules` point to it.

## Architecture at a glance

- **Server-first.** Components are Server Components by default; data fetched server-side.
- **Mutations are Server Actions.** Route handlers are reserved for auth, webhooks, and public APIs.
- **Zod at every boundary.** Env, forms, server actions, webhooks, APIs.
- **Security-sensitive actions are audited.** See `src/lib/audit.ts`.
- **Sensitive endpoints are rate-limited.** See `src/lib/rate-limit/`.
- **Webhooks are dedupe-safe.** See `src/lib/idempotency.ts` and `webhook_events` table.

Full details: [`docs/architecture.md`](docs/architecture.md) · Stack rationale: [`docs/tech-stack-decisions.md`](docs/tech-stack-decisions.md).

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` / `lint:fix` | Biome lint |
| `pnpm format` | Biome format |
| `pnpm typecheck` | TypeScript check, no emit |
| `pnpm test:unit` | Vitest unit + component |
| `pnpm test:e2e` | Playwright UAT smoke |
| `pnpm test` | Unit + E2E |
| `pnpm db:generate` | Drizzle Kit — generate migration from schema |
| `pnpm db:migrate` | Drizzle Kit — apply migrations |
| `pnpm db:studio` | Drizzle Studio — local DB browser |
| `pnpm db:seed` | Seed dev data (idempotent) |

## Contributing

Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) and our [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). Security issues? See [`SECURITY.md`](SECURITY.md) for private disclosure.

## License

[MIT](LICENSE) — do whatever you want, just keep the notice.
