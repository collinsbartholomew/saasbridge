import { beforeEach, describe, expect, it, vi } from "vitest";

describe("generate", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv("DATABASE_URL", "postgres://test:test@127.0.0.1:5432/nextbase?sslmode=disable");
    vi.stubEnv("BETTER_AUTH_SECRET", "test-better-auth-secret-with-32-chars");
  });

  it("returns disabled when AI_GATEWAY_API_KEY is missing", async () => {
    const { generate } = await import("@/lib/ai/gateway");

    const result = await generate({
      model: "openai/gpt-5.4",
      prompt: "Hello",
    });

    expect(result).toEqual({
      ok: false,
      error: "AI disabled",
      reason: "disabled",
    });
  });
});
