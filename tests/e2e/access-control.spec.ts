import { expect, test } from "@playwright/test";

const hasDatabase = Boolean(process.env.DATABASE_URL);

test("dashboard redirects unauthenticated visitors to sign-in", async ({ page }) => {
  test.skip(!hasDatabase, "Requires a real DATABASE_URL so Better Auth can check the session.");

  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
