import { and, count, eq, gt, lt, min } from "drizzle-orm";

import { db } from "@/db/client";
import { rateLimits } from "@/db/schema";

import type { RateLimitAdapter, RateLimitResult } from "./index";

export const postgresRateLimitAdapter: RateLimitAdapter = {
  async check(key, opts) {
    const now = new Date();
    const windowStart = new Date(now.getTime() - opts.windowSec * 1000);

    await db.delete(rateLimits).where(lt(rateLimits.createdAt, windowStart));

    const [snapshot] = await db
      .select({
        count: count(),
        oldestHit: min(rateLimits.createdAt),
      })
      .from(rateLimits)
      .where(and(eq(rateLimits.key, key), gt(rateLimits.createdAt, windowStart)));

    const currentCount = Number(snapshot?.count ?? 0);

    if (currentCount >= opts.limit) {
      return {
        ok: false,
        remaining: 0,
        resetAt: new Date((snapshot?.oldestHit ?? now).getTime() + opts.windowSec * 1000),
      } satisfies RateLimitResult;
    }

    await db.insert(rateLimits).values({
      key,
    });

    const nextCount = currentCount + 1;

    return {
      ok: true,
      remaining: Math.max(0, opts.limit - nextCount),
      resetAt: new Date((snapshot?.oldestHit ?? now).getTime() + opts.windowSec * 1000),
    } satisfies RateLimitResult;
  },
};
