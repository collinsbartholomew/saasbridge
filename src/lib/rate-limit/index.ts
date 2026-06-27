import { memoryRateLimitAdapter } from "./memory";
import { postgresRateLimitAdapter } from "./postgres";

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: Date;
};

export interface RateLimitAdapter {
  check(key: string, opts: { limit: number; windowSec: number }): Promise<RateLimitResult>;
}

function getAdapter() {
  if (process.env.NEXTBASE_RATE_LIMIT_ADAPTER === "postgres") {
    return postgresRateLimitAdapter;
  }

  return memoryRateLimitAdapter;
}

export async function rateLimit(key: string, opts: { limit: number; windowSec: number }) {
  return getAdapter().check(key, opts);
}
