# Tech stack decisions

A record of every library in the stack: why it was picked, what was considered instead, and under what conditions you should swap it out. This file is the authoritative rationale — if a PR adds or removes a dependency, update this file.

## Guiding principles

1. **Lean by default.** Every dependency costs bundle weight, audit surface, and beginner confusion. We prefer the platform or a dozen lines of custom code over pulling in a library.
2. **Production-shaped, not production-complete.** The starter should *look* like real SaaS code, not a toy. But it should not carry every feature a full product needs.
3. **Opinionated on structure, forgiving on extension.** Core patterns (server-first, zod at boundaries, audit + rate-limit + idempotency) are canonical. Optional features (AI, motion, i18n) live behind docs with clear "when to add" guidance.
4. **Agent-friendly.** Well-typed boundaries, a single source of truth per concern, and an `AGENTS.md` that gives AI coding assistants the full picture.

## The stack

### Framework — **Next.js 16 App Router**
- **Why:** React Server Components + Server Actions give us fast pages, minimal client JS, and a clean mutation story. Vercel-shaped but runs on any Node host.
- **Considered:** Remix / React Router 7 (smaller ecosystem), SvelteKit (JS-only DX loss), TanStack Start (younger, fewer host integrations).
- **Swap if:** You need a framework not tied to React.

### Language — **TypeScript (strict)**
- **Why:** Non-negotiable for a starter AI agents will extend. Path alias `@/*` maps to `src/*`.

### Styling — **Tailwind v4 + shadcn/ui (new-york, Radix primitives)**
- **Why:** Tailwind v4's CSS-only engine is fast and zero-config. shadcn gives us source-owned components — no black-box CSS, no dependency to audit, and consumers can edit the primitives directly.
- **Considered:** CSS Modules (too much glue), Chakra / MUI (heavy, opinionated runtime), styled-components (runtime cost, RSC friction).
- **Swap if:** You have strong preference for a design system library — but expect more bundle size.

### Lint + format — **Biome**
- **Why:** One binary replaces ESLint + Prettier + plugin chaos. ~10× faster. Zero config needed. Next.js 16 is decoupled from `next lint`, so Biome fits naturally.
- **Considered:** ESLint + Prettier (larger config surface, slower), oxlint (promising but younger, no formatter yet).
- **Swap if:** Your team requires an ESLint plugin that Biome doesn't mirror yet. Document the swap in a PR with rationale.

### Auth — **Better Auth (email OTP + TOTP)**
- **Why:** Framework-agnostic, first-party Drizzle adapter, plugin-based extensibility. Email-OTP primary avoids password-reset flows entirely. TOTP 2FA + backup codes + trusted devices are first-party plugins.
- **Considered:** NextAuth / Auth.js (mature but session model is less ergonomic with Server Actions), Clerk (vendor lock-in, not self-hostable, cost scales), Lucia (great but less batteries-included).
- **Swap if:** You need hosted auth with zero ops (Clerk), or you need SAML/enterprise SSO out of the box.

### Database — **Drizzle ORM + Neon (HTTP client)**
- **Why:** Drizzle is schema-as-TypeScript, type-inferred queries, zero runtime overhead. Neon's HTTP client works in any serverless runtime without connection-pool gymnastics. Scales to zero (friendly to free tier).
- **Considered:** Prisma (heavier runtime, separate engine process, codegen step), Kysely (great but less "ORM"), raw SQL (fine but no type inference from schema).
- **Swap if:** You need strong migration tooling for large teams — Prisma Migrate has more ceremony.

### Forms — **React Hook Form + Zod resolver**
- **Why:** RHF is minimal-render, accessible by default. `@hookform/resolvers/zod` gives us a single Zod schema shared between client form and Server Action validation.
- **Considered:** TanStack Form (newer, less ecosystem), Formik (larger, less perf).

### Client state — **Zustand (UI only)**
- **Why:** For sidebar/modal/theme state. Tiny (~1KB), no boilerplate. **Do not** put remote data in Zustand — that's what Server Components are for.
- **Considered:** Redux Toolkit (overkill), Jotai (fine alternative), React Context (fine for simple cases; we use Zustand to keep the pattern uniform).

### Remote data — **Server Components + Server Actions + `revalidatePath`**
- **Why:** The Next 16 baseline. Zero client-side data fetching for most pages. Mutations return fresh data via `revalidatePath`.
- **Considered:** TanStack Query (we ship an *optional* integration guide in `docs/add-tanstack-query.md` — reach for it only when you need optimistic updates, polling, or infinite scroll).
- **Swap if:** Your app is heavily client-driven (realtime dashboards, offline-first, etc.).

### Tables — **TanStack Table v8**
- **Why:** Headless, type-safe, framework-agnostic, integrates with shadcn `Table`. Canonical example lives on the `projects` screen.
- **Considered:** AG Grid (heavy), Material React Table (heavy, design-coupled).

### Icons — **Lucide**
- **Why:** shadcn default. Tree-shakeable, consistent, large catalog.

### Toasts — **Sonner**
- **Why:** Lightweight, accessible, the default recommended by shadcn. Plays well with Server Actions (toast on `{ ok: false, error }` return).

### Theme — **next-themes**
- **Why:** De-facto standard for Next.js dark mode. Class-based strategy so shadcn `dark:` variants just work.

### Email — **Resend** (prod) / **console** (dev)
- **Why:** Modern API, free tier (3k/month), React Email templates, no deliverability configuration needed for dev. In development we log the rendered email to console so you never need a real key to test.
- **Considered:** Postmark, SendGrid, SES (great but more setup for a starter).
- **Swap if:** You need transactional sending at high scale — SES is cheapest.

### AI — **Vercel AI Gateway via AI SDK v6**
- **Why:** Unified API across Anthropic/OpenAI/Google/etc., with observability, fallbacks, and zero data retention. You configure a `"provider/model"` string and switch models without code changes.
- **Disabled by default.** Unset `AI_GATEWAY_API_KEY` → the gateway helper returns a typed error. The starter doesn't drag AI into every codepath.
- **Considered:** Direct provider SDKs (harder to swap models), OpenRouter (similar idea, less observability).

### Rate limiting — **In-memory LRU default, Postgres adapter as recipe**
- **Why:** Zero-cost default (no new service), works across every host. Per-instance limits are sufficient at starter scale. The adapter interface means you swap to Postgres / Upstash / Vercel Runtime Cache by changing one file.
- **Considered:** Upstash Redis (would add an external dependency to a v1), DB-backed default (costs Neon compute on free tier).
- **Swap if:** You're operating at scale and need global limits — see `docs/add-redis-later.md`.

### Structured logging — **tiny JSON logger** (`src/lib/logger.ts`)
- **Why:** 40 lines, no dependency. JSON lines in prod, pretty in dev, request-ID-aware. Ships integrations for Vercel/Netlify via their native log drains.
- **Considered:** Pino (great but unnecessary weight for a starter), Winston (legacy), OpenTelemetry (deferred to `docs/add-sentry-later.md`).

### Testing — **Vitest + Testing Library + Playwright + Axe**
- **Why:** Vitest mirrors the Next.js/Vite DX; Testing Library is the standard for React; Playwright is the de-facto E2E tool; `@axe-core/playwright` gives us accessibility smoke tests for free.
- **Playwright is smoke-only.** Deep E2E coverage is user-specific and drags maintenance onto every fork.

### Email templates — **React Email**
- **Why:** Write templates in JSX, preview in browser, render to HTML at send time. One less DSL to learn.

### Deploy targets — **Vercel (primary) + Netlify (first-class)**
- **Why:** The two dominant Next.js-friendly free tiers. `vercel.json` and `netlify.toml` are both committed.
- **Swap if:** You're self-hosting — see `docs/architecture.md` for port + env var shape.

## Deliberately not in v1

| Thing | Why not | Where to find the path |
|---|---|---|
| **tRPC** | Server Actions cover mutations and inference end-to-end for App Router | — |
| **Prisma** | Drizzle's type inference and lighter runtime win for a starter | — |
| **Sentry** | Excellent product but tied to an account and pricing | `docs/add-sentry-later.md` |
| **Redis / Upstash** | Adds an external service and cost | `docs/add-redis-later.md` |
| **Stripe / billing** | Wildly per-app; not one-size-fits-all | (future `docs/add-billing-*.md`) |
| **Orgs / teams / multi-tenant** | Significant schema and auth surface; conflicts with "personal-first" v1 | (future `docs/add-teams-later.md`) |
| **Monorepo / Turborepo** | Overkill for most starter users; premature optimization | — |
| **PWA / service worker** | Maintenance tax > benefit for most SaaS | — |
| **Full i18n** (next-intl / i18next) | Ship with a typed `t(key)` stub, add real lib when you need locales | `docs/add-i18n.md` |
| **Password auth** | Email OTP is simpler and more secure for most cases | `docs/add-password-auth.md` |
| **Motion (framer-motion)** | `tw-animate-css` + Radix transitions cover 90% | `docs/add-motion.md` |
| **TanStack Query** | Server Components cover baseline data fetching | `docs/add-tanstack-query.md` |

## When to add a dependency

Before opening a PR that adds a dependency:

1. Is there a 20-line custom implementation? Prefer that.
2. Does the platform (Next.js, Vercel, Netlify, Neon, Resend) already solve this?
3. Is this dependency small (< 50KB minified + gzipped), well-maintained (commits in last 6 months), and typed?
4. Would a beginner immediately understand why it's here?
5. If all yes — add it AND append a new entry to the "The stack" table above with your reasoning.

If you can't justify it in two sentences, it doesn't belong in core.
