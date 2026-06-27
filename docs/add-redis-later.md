# Add Redis / durable rate limiting

The default rate limiter is in-memory — per-instance, zero-cost, good enough for starter scale. Swap it for a shared store when you need global limits or multi-region deployment.

## Option A — Postgres-backed (zero new service)

SaaSBridge ships a Drizzle adapter interface. Add a Postgres implementation:

1. Create `src/db/schema/rate-limit.ts` with a `rate_limits` table (key, count, window_start).
2. Create `src/lib/rate-limit/postgres.ts` implementing the `RateLimitAdapter` interface.
3. In `src/lib/rate-limit/index.ts`, switch the default adapter based on an env var.

Trade-off: every rate check becomes a DB roundtrip. On Neon free tier (scales to zero), the first check after idle wakes the compute — adds noticeable latency. Fine for low-volume or paid-tier Neon.

## Option B — Upstash Redis (HTTP, serverless-friendly)

```bash
pnpm add @upstash/redis @upstash/ratelimit
```

Create an Upstash Redis DB, grab `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, add to env.

Implement `src/lib/rate-limit/upstash.ts`:

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const rl = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"),
});

export const upstashAdapter: RateLimitAdapter = {
  async check(key, { limit, windowSec }) {
    const { success, remaining, reset } = await rl.limit(key);
    return { ok: success, remaining, resetAt: reset };
  },
};
```

Trade-off: adds an external service + monthly cost above free tier.

## Option C — Vercel Runtime Cache API

Ephemeral per-region cache, shared across functions in the same region. Good for short-TTL deduplication (not strict global limits).

See https://vercel.com/docs/runtime-cache-api.

## Recommendation

- Starter / low-volume / single-region: **keep in-memory default.**
- Global consistency, multi-region, or heavy traffic: **Upstash Redis.**
- Hate adding services: **Postgres adapter**, accept the latency.
