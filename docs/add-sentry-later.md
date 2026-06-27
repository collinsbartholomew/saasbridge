# Add Sentry (or equivalent error tracking)

SaaSBridge ships a structured logger (`src/lib/logger.ts`) and host-native log drains. Add Sentry when you need error aggregation, release tracking, or alerting.

## Install

```bash
pnpm add @sentry/nextjs
pnpm dlx @sentry/wizard@latest -i nextjs --skip-connect
```

## Configure

Sentry's wizard creates `sentry.client.config.ts` and `sentry.server.config.ts`. Set:

```env
NEXT_PUBLIC_SENTRY_DSN="..."
SENTRY_AUTH_TOKEN="..."   # for source-map uploads
```

## Hook into the logger

In `src/lib/logger.ts`, route `logger.error()` through `Sentry.captureException`:

```ts
import * as Sentry from "@sentry/nextjs";

export const logger = {
  error(msg: string, meta?: object) {
    console.error(JSON.stringify({ level: "error", msg, ...meta }));
    Sentry.captureMessage(msg, { level: "error", extra: meta });
  },
  // ...
};
```

## Trace Server Actions

Wrap each action with `Sentry.startSpan()` or rely on the auto-instrumentation from `@sentry/nextjs`.

## Release tracking

In your deploy pipeline, add:

```bash
pnpm dlx @sentry/cli releases new $GIT_SHA
pnpm dlx @sentry/cli releases set-commits $GIT_SHA --auto
```

## Alternatives

- **Axiom** — log-first, cheap, plays well with our JSON logs via a Vercel log drain.
- **DataDog / Honeycomb** — if you need tracing across services.
- **BetterStack Logtail** — simple log drain.
