import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("marketing page renders the app name, sign-in CTA, and passes axe", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "SaaSBridge" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
