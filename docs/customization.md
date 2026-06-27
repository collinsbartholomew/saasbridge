# Customization

How to make SaaSBridge yours without breaking the foundations.

## Brand

- **Name:** update `NEXT_PUBLIC_APP_NAME` env var. It flows through metadata, email templates, and `src/lib/env.ts`.
- **Colors:** edit theme tokens in `src/app/globals.css`. Keep OKLCH values so dark mode stays consistent. Never hardcode hex in components.
- **Logo:** replace `public/logo.svg` (or whatever you add). Reference via `next/image`.
- **Fonts:** the layout uses Geist. To swap, change the import in `src/app/layout.tsx` and the `--font-sans` literal in `globals.css`.

## Navigation

- Marketing routes: `src/app/(marketing)/`.
- App routes (auth-gated): `src/app/(app)/`.
- Auth routes: `src/app/(auth)/`.
- Add a new top-level tab by creating a folder under `(app)/` and adding a link in the dashboard nav component.

## Adding a new feature (the `projects` pattern)

1. Drizzle table in `src/db/schema/<feature>.ts`, re-exported from `src/db/schema/index.ts`.
2. `pnpm db:generate && pnpm db:migrate`.
3. Queries + mutations in `src/lib/<feature>/queries.ts` and `src/lib/<feature>/mutations.ts` — pure functions that take `db` and typed args.
4. Zod schemas in `src/lib/<feature>/schemas.ts` (form + Server Action input).
5. Page at `src/app/(app)/<feature>/page.tsx` (Server Component by default).
6. Server Actions at `src/app/(app)/<feature>/actions.ts` with `"use server"`.
7. A client sub-component only where you need interactivity.

## Emails

- Templates live in `src/lib/email/templates/`.
- `src/lib/email/send.tsx` is the single entry point. Pass React elements as `react`; `@react-email/components` renders to HTML.
- Dev mode logs rendered email to console — no `RESEND_API_KEY` needed.

## Auth

- Swap the primary auth method: follow `docs/add-password-auth.md`.
- Extend the user schema: add columns to `src/db/schema/auth.ts` and expose them via Better Auth's `additionalFields` config in `src/lib/auth/server.ts`.

## Theme

- `next-themes` class strategy (`class="dark"` on `<html>`).
- The shadcn theme tokens cover 95% of styling needs. Use `bg-*` / `text-*` / `border-*` utilities; never hardcode colors.

## Removing features you don't want

The starter is lean but if you want even less:

- **Remove TanStack Table:** delete the `projects` page and `@tanstack/react-table` dep.
- **Remove 2FA:** delete `src/app/(auth)/two-factor/page.tsx` and the `twoFactor` plugin in `src/lib/auth/server.ts`. Drop related tables in the next migration.
- **Remove audit log:** delete `src/lib/audit.ts`, remove its call sites, drop the table.
- **Remove webhook skeleton:** delete `src/app/api/webhooks/[source]/`.

See also `AGENTS.md` for the list of things deliberately *not* included.

## Style of commits and PRs

Follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, etc. See `CONTRIBUTING.md`.
