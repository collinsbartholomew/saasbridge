import { beforeEach, describe, expect, it, vi } from "vitest";

import { isEnabled } from "@/lib/flags";

describe("isEnabled", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads enabled flags from environment variables", () => {
    vi.stubEnv("FLAG_AI_ENABLED", "true");

    expect(isEnabled("ai")).toBe(true);
  });

  it("returns false when a flag is unset", () => {
    expect(isEnabled("billing")).toBe(false);
  });
});
