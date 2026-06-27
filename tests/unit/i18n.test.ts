import { describe, expect, it } from "vitest";

import { t } from "@/lib/i18n";

describe("t", () => {
  it("returns the matching dictionary entry", () => {
    expect(t("projects.empty")).toBe("No projects yet.");
  });

  it("keeps translation keys typed at compile time", () => {
    const typecheckOnly = () => {
      // @ts-expect-error invalid keys must fail type-checking
      t("projects.missing");
    };

    expect(typecheckOnly).toBeTypeOf("function");

    expect(t("auth.sign_in.title")).toBe("Sign in");
  });
});
