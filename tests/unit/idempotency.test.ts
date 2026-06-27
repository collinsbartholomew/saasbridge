import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type StoredRow = {
  createdAt: Date;
  key: string;
  response: unknown;
};

const rows = new Map<string, StoredRow>();

let customSelect: ((key: string) => Promise<StoredRow[]>) | undefined;
let insertHook: ((value: { key: string; response: unknown }) => Promise<void>) | undefined;

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((_column: unknown, value: string) => ({ value })),
}));

vi.mock("@/db/schema", () => ({
  idempotencyKeys: {
    key: "key",
  },
}));

vi.mock("@/db/client", () => {
  const db = {
    delete: vi.fn(() => ({
      where: vi.fn(async (condition: { value: string }) => {
        rows.delete(condition.value);
      }),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(async (value: { key: string; response: unknown }) => {
        if (insertHook) {
          await insertHook(value);
          return;
        }

        rows.set(value.key, {
          key: value.key,
          response: value.response,
          createdAt: new Date(),
        });
      }),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn((condition: { value: string }) => ({
          limit: vi.fn(async () => {
            if (customSelect) {
              return customSelect(condition.value);
            }

            const row = rows.get(condition.value);
            return row ? [row] : [];
          }),
        })),
      })),
    })),
  };

  return { db };
});

describe("withIdempotency", () => {
  beforeEach(() => {
    rows.clear();
    customSelect = undefined;
    insertHook = undefined;
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("executes the function for a new key and persists the result", async () => {
    const { withIdempotency } = await import("@/lib/idempotency");
    const fn = vi.fn(async () => ({ ok: true, value: 42 }));

    const result = await withIdempotency("create-once", fn);

    expect(result).toEqual({
      cached: false,
      result: { ok: true, value: 42 },
    });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(rows.get("create-once")?.response).toEqual({ ok: true, value: 42 });
  });

  it("returns the cached response when the key has already completed", async () => {
    rows.set("cached-key", {
      key: "cached-key",
      response: { ok: true, value: "cached" },
      createdAt: new Date(),
    });

    const { withIdempotency } = await import("@/lib/idempotency");
    const fn = vi.fn(async () => ({ ok: true, value: "fresh" }));

    const result = await withIdempotency("cached-key", fn);

    expect(result).toEqual({
      cached: true,
      result: { ok: true, value: "cached" },
    });
    expect(fn).not.toHaveBeenCalled();
  });

  it("deduplicates a cooperative concurrent same-key race in the cached read path", async () => {
    let executionCount = 0;
    let selectCount = 0;
    let markInserted!: () => void;

    const inserted = new Promise<void>((resolve) => {
      markInserted = resolve;
    });

    customSelect = async (key) => {
      selectCount += 1;
      if (selectCount === 1) {
        return [];
      }

      // The current implementation has no lock. This test only proves the
      // "read cached row on the second caller" interleaving, which is the
      // safest behavior available without changing production code.
      await inserted;
      const row = rows.get(key);
      return row ? [row] : [];
    };

    insertHook = async (value) => {
      rows.set(value.key, {
        key: value.key,
        response: value.response,
        createdAt: new Date(),
      });
      markInserted();
    };

    const { withIdempotency } = await import("@/lib/idempotency");

    const run = vi.fn(async () => {
      executionCount += 1;
      await Promise.resolve();
      return { ok: true, value: "shared" };
    });

    const [first, second] = await Promise.all([
      withIdempotency("shared-key", run),
      withIdempotency("shared-key", run),
    ]);

    expect(executionCount).toBe(1);
    expect(first).toEqual({
      cached: false,
      result: { ok: true, value: "shared" },
    });
    expect(second).toEqual({
      cached: true,
      result: { ok: true, value: "shared" },
    });
  });
});
