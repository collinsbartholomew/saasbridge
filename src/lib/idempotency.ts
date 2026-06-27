import { createHash } from "node:crypto";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db/client";
import { idempotencyKeys } from "@/db/schema";

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

function hashResult(result: unknown) {
  return createHash("sha256").update(JSON.stringify(result)).digest("hex");
}

async function resolveKey(inputKey?: string | null) {
  if (inputKey) {
    return inputKey;
  }

  try {
    const headerStore = await headers();

    return headerStore.get("Idempotency-Key");
  } catch {
    return null;
  }
}

export async function withIdempotency<T>(
  inputKey: string | null | undefined,
  fn: () => Promise<T>,
) {
  const key = await resolveKey(inputKey);

  if (!key) {
    return {
      cached: false,
      result: await fn(),
    };
  }

  const [existing] = await db
    .select()
    .from(idempotencyKeys)
    .where(eq(idempotencyKeys.key, key))
    .limit(1);

  if (existing) {
    const isExpired = Date.now() - existing.createdAt.getTime() > IDEMPOTENCY_TTL_MS;

    if (isExpired) {
      await db.delete(idempotencyKeys).where(eq(idempotencyKeys.key, key));
    } else {
      return {
        cached: true,
        result: existing.response as T,
      };
    }
  }

  const result = await fn();

  await db.insert(idempotencyKeys).values({
    key,
    response: result,
    resultHash: hashResult(result),
    status: "completed",
  });

  return {
    cached: false,
    result,
  };
}

export const IDEMPOTENCY_TTL_HOURS = IDEMPOTENCY_TTL_MS / (60 * 60 * 1000);
