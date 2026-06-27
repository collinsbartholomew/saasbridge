# Testing

Phase 10 adds two testing layers:

- `pnpm test:unit` runs Vitest against pure library logic.
- `pnpm test:e2e` runs Playwright smoke/UAT coverage against a local `pnpm dev` server.

## Fresh clone behavior

You do not need to configure a real database just to boot the Playwright web server.

- `playwright.config.ts` injects placeholder `DATABASE_URL`, `BETTER_AUTH_SECRET`, and public app URLs into the `pnpm dev` process so the app can render on a fresh clone.
- The DB-backed Playwright specs (`access-control` and `auth-otp`) are skipped unless you export a real `DATABASE_URL` in the shell before running `pnpm test:e2e`.
- The marketing and auth accessibility smoke tests always run.

## Running with a real database

If you want the full auth/session smoke coverage:

1. Copy `.env.example` to `.env.local` and set a working `DATABASE_URL`.
2. Run your Drizzle migrations against that database.
3. Export `DATABASE_URL` in the same shell you use for `pnpm test:e2e`.

The OTP smoke test still stops at the `/verify` screen. The end-to-end OTP completion remains intentionally skipped until the project owner wires a test DB reader into Playwright.
