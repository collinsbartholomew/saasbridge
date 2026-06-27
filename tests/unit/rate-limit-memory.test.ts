import { beforeEach, describe, expect, it, vi } from "vitest";

import { memoryRateLimitAdapter } from "@/lib/rate-limit/memory";

describe("memoryRateLimitAdapter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  it("returns ok with remaining budget while under the limit", async () => {
    const key = `under-limit-${crypto.randomUUID()}`;

    const result = await memoryRateLimitAdapter.check(key, { limit: 2, windowSec: 60 });

    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(1);
    expect(result.resetAt.toISOString()).toBe("2026-01-01T00:01:00.000Z");
  });

  it("returns ok=false once the limit has been reached", async () => {
    const key = `at-limit-${crypto.randomUUID()}`;

    await memoryRateLimitAdapter.check(key, { limit: 2, windowSec: 60 });
    await memoryRateLimitAdapter.check(key, { limit: 2, windowSec: 60 });

    const result = await memoryRateLimitAdapter.check(key, { limit: 2, windowSec: 60 });

    expect(result).toMatchObject({
      ok: false,
      remaining: 0,
    });
    expect(result.resetAt.toISOString()).toBe("2026-01-01T00:01:00.000Z");
  });

  it("resets the window after the configured duration elapses", async () => {
    const key = `window-reset-${crypto.randomUUID()}`;

    await memoryRateLimitAdapter.check(key, { limit: 1, windowSec: 60 });
    vi.advanceTimersByTime(60_001);

    const result = await memoryRateLimitAdapter.check(key, { limit: 1, windowSec: 60 });

    expect(result).toMatchObject({
      ok: true,
      remaining: 0,
    });
    expect(result.resetAt.toISOString()).toBe("2026-01-01T00:02:00.001Z");
  });
});
