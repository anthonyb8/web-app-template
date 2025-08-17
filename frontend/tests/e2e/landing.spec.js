import { test, expect } from "@playwright/test";

const frontend_url = process.env.FRONTEND_URL;

function url(endpoint) {
  return `${frontend_url}${endpoint}`;
}

test.describe("Landing Page", () => {
  test("get-started-click", async ({ page }) => {
    await page.goto(url("/"));

    // Click "Get Started" should go to registration
    await page.getByRole("button", { name: "Get Started" }).click();

    await expect(page).toHaveURL(url("/register"));
    await expect(page).toHaveTitle(
      "WorkLog – Track Your Time, Bill with Confidence",
    );
  });

  test("login-button-click", async ({ page }) => {
    await page.goto(url("/"));

    // Click the get started link.
    await page.getByRole("button", { name: "Login" }).click();

    // Expects page to have a heading with the name of Installation.
    await expect(page).toHaveURL(url("/login"));
  });

  test("register-button-click", async ({ page }) => {
    await page.goto(url("/"));

    // Click the get started link.
    await page.getByRole("button", { name: "Register" }).click();

    // Expects page to have a heading with the name of Installation.
    await expect(page).toHaveURL(url("/register"));
  });
});
