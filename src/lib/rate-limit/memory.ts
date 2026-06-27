import type { RateLimitAdapter, RateLimitResult } from "./index";

const MAX_KEYS = 5_000;

type WindowState = {
  hits: number[];
  lastSeenAt: number;
};

const store = new Map<string, WindowState>();

function pruneStaleEntries(_now: number) {
  if (store.size <= MAX_KEYS) {
    return;
  }

  const sortedEntries = [...store.entries()].sort(
    ([, left], [, right]) => left.lastSeenAt - right.lastSeenAt,
  );
  const overflow = sortedEntries.length - MAX_KEYS;

  for (const [key] of sortedEntries.slice(0, overflow)) {
    store.delete(key);
  }
}

export const memoryRateLimitAdapter: RateLimitAdapter = {
  async check(key, opts) {
    const now = Date.now();
    const windowMs = opts.windowSec * 1000;
    const windowStart = now - windowMs;
    const current = store.get(key) ?? { hits: [], lastSeenAt: now };
    const hits = current.hits.filter((timestamp) => timestamp > windowStart);

    if (hits.length >= opts.limit) {
      const resetAt = new Date((hits[0] ?? now) + windowMs);

      current.hits = hits;
      current.lastSeenAt = now;
      store.set(key, current);

      return {
        ok: false,
        remaining: 0,
        resetAt,
      } satisfies RateLimitResult;
    }

    hits.push(now);
    store.set(key, {
      hits,
      lastSeenAt: now,
    });
    pruneStaleEntries(now);

    return {
      ok: true,
      remaining: Math.max(0, opts.limit - hits.length),
      resetAt: new Date((hits[0] ?? now) + windowMs),
    } satisfies RateLimitResult;
  },
};
