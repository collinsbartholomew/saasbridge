# Observability (without Sentry)

SaaSBridge deliberately does not ship an error-tracking vendor in v1. Instead, it provides the primitives so you can see what's happening on local dev and on your host, then add a vendor when you're ready.

## What you get out of the box

1. **Structured JSON logs** — `src/lib/logger.ts`.
2. **Request IDs** — `proxy.ts` assigns an `x-request-id` header on every request. The logger reads it automatically for any log emitted during the request.
3. **Error logging in Server Actions** — every server action catches and logs before returning a typed `{ ok: false }` to the client.
4. **Pretty dev output / JSON prod output** — the logger detects `NODE_ENV` and switches.

## Using the logger

```ts
import { logger } from "@/lib/logger";

logger.info("project_created", { projectId, userId });
logger.warn("rate_limit_hit", { key, remaining });
logger.error("db_write_failed", { error: err.message });
```

## Reading logs locally

Logs go to stdout. In dev you'll see coloured pretty-print. In prod mode (`NODE_ENV=production pnpm start`) you'll see JSON.

## Reading logs on Vercel

- **Dashboard:** project → Logs. Filter by function, path, or request ID.
- **Drain:** project → Settings → Log Drains. Point at Datadog / Axiom / Logtail for retention.

## Reading logs on Netlify

- **Dashboard:** site → Logs → Function logs.
- **Drain:** site → Log drains.

## Adding Sentry (or equivalent)

See `docs/add-sentry-later.md`.

## What *not* to log

- Secrets: API keys, tokens, `BETTER_AUTH_SECRET`.
- Full request bodies for auth routes.
- PII beyond user ID — email/phone/name should be referenced by ID, not inlined.
- OTP codes — ever. (Dev is the one exception — we log to console for manual sign-in.)

The logger does not sanitize automatically. Be intentional with what you pass as `meta`.

## Uptime and alerting

Out of scope for v1. Simplest option: use **Vercel's built-in deploy notifications** + **UptimeRobot free tier** pointed at `/api/health`. If you want an in-repo health endpoint, add:

```ts
// src/app/api/health/route.ts
export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json({ ok: true, ts: Date.now() });
}
```
