import { expect, test } from "@playwright/test";

for (const route of ["/", "/company", "/business", "/newsletter", "/contact", "/privacy", "/terms", "/email-policy"]) {
  test(`public ${route} renders without horizontal overflow @a11y`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow).toBe(false);
    await expect(page.locator("a.skip-link")).toHaveCount(1);
  });
}

test("five-locale navigation preserves the company route", async ({ page }) => {
  await page.goto("/company");
  await page.locator(".locale-control select").selectOption("en");
  await expect(page).toHaveURL(/\/en\/company$/);
});

test("admin unauthenticated route is protected", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login$/);
});
