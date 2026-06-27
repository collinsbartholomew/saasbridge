import { expect, test } from "@playwright/test";

const hasDatabase = Boolean(process.env.DATABASE_URL);

test("sign-in submits an email and lands on the verify screen", async ({ page }) => {
  test.skip(!hasDatabase, "Requires a real DATABASE_URL so Better Auth can persist OTP state.");

  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("playwright@example.com");
  await page.getByRole("button", { name: "Send sign-in code" }).click();

  await expect(page).toHaveURL(/\/verify\?email=playwright%40example\.com$/);
  await expect(page.getByLabel("Verification code")).toBeVisible();
});

test.describe
  .skip("full OTP flow", () => {
    test("TODO: read the OTP from the test database and complete sign-in", async () => {
      // Intentionally skipped until the starter is wired to a test database that Playwright can read.
    });
  });
