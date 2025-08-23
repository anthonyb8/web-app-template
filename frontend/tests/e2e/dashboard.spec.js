import { test, expect } from "@playwright/test";
import { TestServices } from "../setup";
import { AuthServices } from "../../src/services/authService";
import { authenticator } from "otplib";

const email = "test2@example.com";
const password = "password123";
const frontend_url = process.env.FRONTEND_URL;

function url(endpoint) {
  return `${frontend_url}${endpoint}`;
}

test.describe.configure({ mode: "serial" });

// Dashboard : Logout / Refresh
test.describe("Dashboard Page", () => {
  test("dashboard-navigation-successful", async ({ page }) => {
    // Register
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);

    // Login
    await page.goto(url("/login"));
    await page.getByPlaceholder("Enter your email").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Selector
    await page.locator('input[name="mfaAuthenticatorOption"]').click();
    await page.getByRole("button", { type: "submit" }).click();

    // Setup
    const secret_cont = page.locator('span[name="secret"]');
    await page.getByRole("button", { name: "Show" }).click();
    const secret = await secret_cont.textContent();
    await page.locator('button[type="submit"]').click();

    // Test
    const code = authenticator.generate(secret.trim());
    await page.locator('input[name="mfaCode"]').fill(code);
    await page.locator('button[type="submit"]').click();
    await page.locator('button[name="doneCodes"]').click();

    await expect(page).toHaveURL(url("/dashboard"));

    await TestServices.deleteUser(email, password);
  });

  test("dashboard-navigation-account", async ({ page }) => {
    // Register
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);

    // Login
    await page.goto(url("/login"));
    await page.getByPlaceholder("Enter your email").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Selector
    await page.locator('input[name="mfaAuthenticatorOption"]').click();
    await page.getByRole("button", { type: "submit" }).click();

    // Setup
    const secret_cont = page.locator('span[name="secret"]');
    await page.getByRole("button", { name: "Show" }).click();
    const secret = await secret_cont.textContent();
    await page.locator('button[type="submit"]').click();

    // Verify
    const code = authenticator.generate(secret.trim());
    await page.locator('input[name="mfaCode"]').fill(code);
    await page.locator('button[type="submit"]').click();
    await page.locator('button[name="doneCodes"]').click();

    // Test
    await page.locator('li[name="button-to-account"]').click();

    await expect(page).toHaveURL(url("/account"));

    await TestServices.deleteUser(email, password);
  });
});

test.describe("Account Page", () => {
  test("account-logout", async ({ page }) => {
    // Register
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);

    // Login
    await page.goto(url("/login"));
    await page.getByPlaceholder("Enter your email").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Selector
    await page.locator('input[name="mfaAuthenticatorOption"]').click();
    await page.getByRole("button", { type: "submit" }).click();

    // Setup
    const secret_cont = page.locator('span[name="secret"]');
    await page.getByRole("button", { name: "Show" }).click();
    const secret = await secret_cont.textContent();
    await page.locator('button[type="submit"]').click();

    // Verify
    const code = authenticator.generate(secret.trim());
    await page.locator('input[name="mfaCode"]').fill(code);
    await page.locator('button[type="submit"]').click();
    await page.locator('button[name="doneCodes"]').click();

    // Test
    await page.locator('li[name="button-to-account"]').click();

    await page.locator('button[name="logout-btn"]').click();

    await expect(page).toHaveURL(url("/login"));

    await page.goto(url("/dashboard"));
    await expect(page).toHaveURL(url("/login"));

    await TestServices.deleteUser(email, password);
  });
});
