import { describe, expect, it } from "vitest";

import { CreateProjectInput, UpdateProjectInput } from "../../src/lib/projects/schemas";

describe("project schemas", () => {
  it("defaults a new project to active status", () => {
    const parsed = CreateProjectInput.parse({
      description: "Starter workspace",
      name: "Alpha",
    });

    expect(parsed.status).toBe("active");
  });

  it("accepts a partial project update with a uuid id", () => {
    const parsed = UpdateProjectInput.parse({
      id: "9e6c0d64-4100-468b-9df7-bf8ff8ff7d1b",
      status: "archived",
    });

    expect(parsed.status).toBe("archived");
  });

  it("rejects a missing project name on create", () => {
    const result = CreateProjectInput.safeParse({
      description: "Missing name",
      name: "",
    });

    expect(result.success).toBe(false);
  });
});
