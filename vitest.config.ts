import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));
const serverOnlyStub = fileURLToPath(
  new URL("./tests/unit/support/server-only.ts", import.meta.url),
);

export default defineConfig({
  resolve: {
    alias: {
      "@": srcDir,
      "server-only": serverOnlyStub,
    },
  },
  test: {
    environment: "node",
    exclude: ["tests/e2e/**"],
    include: ["tests/unit/**/*.test.ts"],
  },
});
