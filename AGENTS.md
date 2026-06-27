<!-- BEGIN:nextjs-agent-rules -->
# Next.js 16 note for agents

This project uses Next.js 16. Several APIs and file conventions changed between 15 and 16. If your memory conflicts with what's in `node_modules/next/dist/docs/` or the current official docs, trust the docs. Key call-outs: `proxy.ts` replaces `middleware.ts`; async `headers()`/`cookies()` imports from `next/headers`; `typedRoutes` is stable.
<!-- END:nextjs-agent-rules -->

---

# AGENTS.md

**Canonical guidance for AI agents** (Claude Code, Cursor, Codex CLI, Aider, etc.) working in this repo.

This file is the source of truth for agent behavior. `CLAUDE.md` and `.cursorrules` re-point here.

## What SaaSBridge is

A lean, production-shaped Next.js 16 SaaS starter. It is **deliberately minimal** — every dependency is justified in [`docs/tech-stack-decisions.md`](docs/tech-stack-decisions.md). Do not expand the stack without a strong reason.

Target user: a beginner who wants a clean, opinionated starting point and can extend from there.

## Canonical stack (do not swap without explicit user request)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 App Router | `proxy.ts`, NOT `middleware.ts` |
| Language | TypeScript (strict) | Path alias: `@/*` → `src/*` |
| Styling | Tailwind v4 + shadcn/ui (new-york, Radix) | Theme tokens only — no ad-hoc hex |
| Lint + format | Biome | One tool, no ESLint/Prettier |
| Auth | Better Auth (email OTP + TOTP) | Passwordless primary |
| DB | Drizzle ORM + Neon (HTTP client) | `@neondatabase/serverless` |
| Forms | React Hook Form + Zod resolver | |
| Email | Resend (prod) / console (dev) | React Email templates |
| Client state | Zustand (UI-only) | No remote data in Zustand |
| Remote state | Server Components + Server Actions + `revalidatePath` | Reach for TanStack Query ONLY for optimistic / polling / infinite scroll. See [`docs/add-tanstack-query.md`](docs/add-tanstack-query.md). |
| Tables | TanStack Table v8 | `projects` screen is the canonical example |
| Icons | Lucide | `h-4 w-4` or `h-5 w-5` default |
| Toasts | Sonner | |
| Theme | next-themes (class strategy) | |
| Tests | Vitest + Testing Library + Playwright + Axe | Playwright is **smoke/UAT only** |
| AI | Vercel AI Gateway via AI SDK v6 | `provider/model` strings; feature-flagged on `AI_GATEWAY_API_KEY` |

## Architectural rules

1. **Server-first.** Default every component to a Server Component. Only add `"use client"` when you need interactivity, browser-only APIs, or React Context.
2. **Data flows down the server tree.** Fetch in Server Components and Server Actions. Pass data to client components via props, not client-side fetches.
3. **Mutations are Server Actions.** Use route handlers only for webhooks, public APIs, and Better Auth (`app/api/auth/[...all]`).
4. **Zod at every boundary.** Validate env, form input, Server Action args, webhook payloads, and API request bodies with Zod.
5. **Audit security-sensitive actions.** Anything that changes auth state (enable/disable 2FA, regenerate backup codes, revoke a session) or destroys user data calls `audit()` from `src/lib/audit.ts`.
6. **Rate-limit at the edge of abuse.** Wrap sensitive endpoints (auth, webhook, AI) with `rateLimit()` from `src/lib/rate-limit`.
7. **Idempotency for external callers.** Any endpoint that accepts `Idempotency-Key` wraps its work in `withIdempotency()`.
8. **No secrets client-side.** Server env access goes through `env` from `@/lib/env`. The client only ever sees `NEXT_PUBLIC_*` vars.

## File layout

```
app/                      # Next.js App Router
  (marketing)/            # public pages (/, /privacy)
  (auth)/                 # sign-in, verify, two-factor
  (app)/                  # protected dashboard, projects, settings
  api/auth/[...all]/      # Better Auth handler
  api/webhooks/[source]/  # signed webhook receiver
src/
  components/             # app components (non-shadcn)
  components/ui/          # shadcn primitives — do not hand-edit; regenerate via shadcn CLI
  db/
    client.ts             # Neon + Drizzle
    schema/               # all table schemas
    seed.ts               # idempotent dev seed
  lib/
    auth/                 # Better Auth server + client
    rate-limit/           # adapter interface + memory impl
    email/                # Resend helper + React Email templates
    ai/gateway.ts         # Vercel AI Gateway wrapper
    env.ts                # Zod-validated env
    logger.ts             # structured JSON logger
    idempotency.ts
    audit.ts
    flags.ts              # feature flags (env-backed stub)
    analytics.ts          # track() no-op stub
    i18n.ts               # single-locale stub
    utils.ts              # cn() helper
  hooks/                  # reusable client hooks
  stores/                 # Zustand stores (UI only)
  types/                  # shared type definitions
tests/
  unit/                   # Vitest
  e2e/                    # Playwright smoke + Axe a11y
docs/                     # all extension guides + decisions
```

## How to add a new feature

1. **Schema first.** Add a Drizzle table under `src/db/schema/`, re-export from `src/db/schema/index.ts`, run `pnpm db:generate`.
2. **Server-side helpers.** Write query/mutation helpers in `src/lib/<feature>/` that use `db`. Keep them pure and server-only.
3. **Zod schemas.** Define input validation in `src/lib/<feature>/schemas.ts`.
4. **Server Actions.** Under `src/app/(app)/<feature>/actions.ts`. Use `"use server"`, `revalidatePath` after mutations, return typed `{ ok: true } | { ok: false, error }` shapes — do not throw across the boundary.
5. **Pages.** Server Components in `src/app/(app)/<feature>/page.tsx`. Delegate interactivity to small client components.
6. **UI.** Reach for shadcn primitives first. Use TanStack Table for tabular data. Use Sonner for toasts. Use Lucide for icons.
7. **Audit + rate-limit + idempotency** where appropriate (rules 5–7 above).
8. **Unit tests** for schemas and pure helpers. **One Playwright smoke** exercising the happy path.

## Canonical conventions

- **Imports:** absolute via `@/...` for everything under `src/`.
- **Exports:** named exports only. No default exports except where Next.js route/page files require them.
- **Server Action return shape:** `{ ok: true, data?: T } | { ok: false, error: string, field?: string }`.
- **Error handling:** throw from query helpers; catch at Server Action boundaries and return typed `{ ok: false }`.
- **Dates:** `timestamp with time zone` in Postgres; serialize as ISO-8601 at API boundaries.
- **IDs:** UUIDs. `crypto.randomUUID()` or Drizzle `$default` — avoid sequential IDs for user-facing resources.
- **Component styling:** theme tokens (`bg-background`, `text-foreground`, `border-border`). No ad-hoc `#hex` values.
- **Icons:** `h-4 w-4` by default; `h-5 w-5` in primary CTAs.
- **Density:** `gap-6 p-6 text-sm` (comfortable) or `gap-4 p-4 text-sm` (compact) — pick one per page.
- **Dark mode:** default to `system`. Tokens work in both via CSS vars.

## Deliberately out of scope (v1)

Do **not** introduce any of these unless the user explicitly asks:

- tRPC, Prisma, Redux, SWR
- Sentry / DataDog (see `docs/add-sentry-later.md`)
- Redis, Upstash, BullMQ, queues (see `docs/add-redis-later.md`)
- Billing (Stripe, Dodo, LemonSqueezy)
- Organizations / teams / multi-tenant
- Monorepo / Turborepo
- PWA, service worker
- Full i18n (stub lives at `src/lib/i18n.ts`)
- Password-based auth (see `docs/add-password-auth.md`)

## When in doubt

1. Read `docs/architecture.md`.
2. Read `docs/tech-stack-decisions.md`.
3. Follow the existing pattern for a similar feature. `projects` is the canonical example.
4. Do **not** add a dependency without justification in `docs/tech-stack-decisions.md`.

## Commit conventions

- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`.
- Keep subject short; use the body for the *why*.
- One commit per logical unit — don't bundle refactors into feature commits.

## Running locally

```bash
pnpm install
cp .env.example .env.local        # fill in DATABASE_URL + BETTER_AUTH_SECRET
pnpm db:generate && pnpm db:migrate
pnpm db:seed                       # optional
pnpm dev
```

Each required env var and how to get it is inline in `.env.example`.

## Verification before claiming work is done

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test:unit` passes
- [ ] `pnpm test:e2e` passes (if UI changed)
- [ ] Manually exercised the new path in the browser if UI changed
