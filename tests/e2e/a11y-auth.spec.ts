import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

async function expectNoViolations(path: string, page: Page) {
  await page.goto(path);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
}

test("sign-in page has no axe violations", async ({ page }) => {
  await expectNoViolations("/sign-in", page);
});

test("verify page has no axe violations", async ({ page }) => {
  await expectNoViolations("/verify?email=playwright@example.com", page);
});
