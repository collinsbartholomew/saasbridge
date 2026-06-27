import { beforeEach, describe, expect, it, vi } from "vitest";

const validBaseEnv = {
  BETTER_AUTH_SECRET: "test-better-auth-secret-with-32-chars",
  DATABASE_URL: "postgres://test:test@127.0.0.1:5432/nextbase?sslmode=disable",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

async function loadEnvModule(overrides: Record<string, string | undefined> = {}) {
  vi.resetModules();
  vi.unstubAllEnvs();

  delete process.env.BETTER_AUTH_SECRET;
  delete process.env.DATABASE_URL;
  delete process.env.NEXT_PUBLIC_APP_NAME;
  delete process.env.NEXT_PUBLIC_APP_URL;

  for (const [key, value] of Object.entries(validBaseEnv)) {
    vi.stubEnv(key, value);
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key];
      continue;
    }
    vi.stubEnv(key, value);
  }

  return import("@/lib/env");
}

describe("env", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("rejects a missing DATABASE_URL", async () => {
    await expect(loadEnvModule({ DATABASE_URL: undefined })).rejects.toThrow("DATABASE_URL");
  });

  it("rejects a short BETTER_AUTH_SECRET", async () => {
    await expect(loadEnvModule({ BETTER_AUTH_SECRET: "short-secret" })).rejects.toThrow(
      "BETTER_AUTH_SECRET must be at least 32 chars",
    );
  });

  it("accepts a valid configuration", async () => {
    const { env } = await loadEnvModule();

    expect(env.DATABASE_URL).toBe(validBaseEnv.DATABASE_URL);
    expect(env.BETTER_AUTH_SECRET).toBe(validBaseEnv.BETTER_AUTH_SECRET);
    expect(env.NEXT_PUBLIC_APP_NAME).toBe("SaaSBridge");
  });
});
