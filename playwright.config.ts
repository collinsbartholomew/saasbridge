import { defineConfig, devices } from "@playwright/test";

const placeholderDatabaseUrl =
  "postgres://nextbase:nextbase@127.0.0.1:5432/nextbase_test?sslmode=disable";
const placeholderAuthSecret = "test-better-auth-secret-for-playwright-123456";
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  retries: process.env.CI ? 2 : 0,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://localhost:3000",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: skipWebServer
    ? undefined
    : {
        command: "pnpm dev",
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL ?? placeholderDatabaseUrl,
          BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? placeholderAuthSecret,
          BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
          NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "SaaSBridge",
          NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        },
      },
});
