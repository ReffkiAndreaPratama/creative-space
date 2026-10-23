import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Nexreff");
  });

  test("navbar links navigate to pages", async ({ page }) => {
    await page.goto("/");
    // Click Photography link (visible on desktop)
    const photoLink = page.getByRole("link", { name: "Photography" }).first();
    await photoLink.click();
    await expect(page).toHaveURL(/\/photography/);
  });

  test("search page works", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("h1")).toContainText("Search");
  });

  test("404 page shows for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await expect(page.locator("body")).toContainText("404");
  });

  test("admin login page is accessible", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("body")).toContainText("Admin");
  });
});
