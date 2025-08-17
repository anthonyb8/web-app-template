import { test, expect } from "@playwright/test";
import { TestServices } from "../setup";
import { AuthServices } from "../../src/services/authService";
import { authenticator } from "otplib";

const email = "test@example.com";
const password = "password";
const frontend_url = process.env.FRONTEND_URL;

function url(endpoint) {
  return `${frontend_url}${endpoint}`;
}

test.describe.configure({ mode: "serial" });

// Add to test to see the browser console output
// page.on("console", (msg) => console.log("BROWSER:", msg.text()));

// Registration Page
test.describe("Register Page", () => {
  test("register-already-exists", async ({ page }) => {
    const result = await TestServices.createVerifiedUser(email, password);

    await page.goto(url("/register"));

    await page.getByPlaceholder("Enter your email").fill(email);
    await page
      .getByPlaceholder("Create a password (min 8 characters)")
      .fill(password);
    await page.getByPlaceholder("Confirm your password").fill(password);
    await page.getByRole("button", { name: "Create Account" }).click();

    const errorMessage = page.getByText("Email already registered");
    await expect(errorMessage).toBeVisible();

    await TestServices.deleteUser(email, password);
  });

  test("register-passwords-dont-match", async ({ page }) => {
    await page.goto(url("/register"));

    await page.getByPlaceholder("Enter your email").fill(email);
    await page
      .getByPlaceholder("Create a password (min 8 characters)")
      .fill(password);
    await page.getByPlaceholder("Confirm your password").fill("1");

    await page.getByRole("button", { name: "Create Account" }).click();

    const errorMessage = page.getByText("Passwords do not match");
    await expect(errorMessage).toBeVisible();
  });
});

// Login  Page
test.describe("Login Page", () => {
  // Test
  test("login-successful", async ({ page }) => {
    const result = await TestServices.createVerifiedUser(email, password);
    const verified = await AuthServices.verify_email(result.data?.token);

    await page.goto(url("/login"));

    await page.getByPlaceholder("Enter your email").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);

    const res = await page.getByRole("button", { name: "Sign In" }).click();

    // Expect an error message to appear
    await expect(page).toHaveURL(url("/setup-mfa"));

    await TestServices.deleteUser(email, password);
  });

  test("login-unregistered", async ({ page }) => {
    await page.goto(url("/login"));

    await page.getByPlaceholder("Enter your email").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);

    await page.getByRole("button", { name: "Sign In" }).click();

    // Expect an error message to appear
    const errorMessage = page.getByText("Login failed. Please try again.");
    await expect(errorMessage).toBeVisible();
  });
});

// Mfa Setup Page
test.describe("Setup-MFA Page", () => {
  test("login-successful", async ({ page }) => {
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);

    // login (need loggin token)
    await page.goto(url("/login"));
    await page.getByPlaceholder("Enter your email").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // click button to show secret
    const secret = page.locator('span[name="secret"]');
    await page.getByRole("button", { name: "Show" }).click();
    const s_value = await secret.textContent();
    expect(s_value).toBeTruthy();

    // Continue when mfa setup
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(url("/verify-mfa"));

    await TestServices.deleteUser(email, password);
  });
});

// Verify mfa page
test.describe("Verify-MFA Page", () => {
  test("verify-successful", async ({ page }) => {
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);

    await page.goto(url("/login"));
    await page.getByPlaceholder("Enter your email").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();

    const secret_cont = page.locator('span[name="secret"]');
    await page.getByRole("button", { name: "Show" }).click();
    const secret = await secret_cont.textContent();
    await page.locator('button[type="submit"]').click();

    const code = authenticator.generate(secret.trim());
    await page.locator('input[name="mfaCode"]').fill(code);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(url("/dashboard"));

    await TestServices.deleteUser(email, password);
  });

  test("verify-invalid", async ({ page }) => {
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);

    await page.goto(url("/login"));
    await page.getByPlaceholder("Enter your email").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();

    await page.getByRole("button", { name: "Show" }).click();
    await page.locator('button[type="submit"]').click();

    const code = authenticator.generate("RSLF7CSBTGRWU6KK5G34VXN7SB37D5RP");
    await page.locator('input[name="mfaCode"]').fill(code);
    await page.locator('button[type="submit"]').click();

    const errorMessage = page.getByText("Invalid MFA code");
    await expect(errorMessage).toBeVisible();

    await TestServices.deleteUser(email, password);
  });
});

// todo: How to test with a dummy email.
// // Forgot Password Page
// test.describe("Forgot Password Page", () => {
//   test("forgot-password-submit", async ({ page }) => {
//     const result = await TestServices.createVerifiedUser(email, password);
//     await AuthServices.verify_email(result.data?.token);
//
//     await page.goto(url("/forgot-password"));
//     await page.locator('input[name="email"]').fill(email);
//     await page.locator('button[type="submit"]').click();
//
//     const message = page.locator('div[name="message"]');
//     await expect(message).toBeVisible();
//
//     await TestServices.deleteUser(email, password);
//   });
// });

// Reset Password Page
test.describe("Reset Password Page", () => {
  test("reset-successful", async ({ page }) => {
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);

    const forgot_response = await TestServices.forgot_password(email);
    console.log(forgot_response);
    const token = forgot_response.data?.token;

    await page.goto(url(`/reset-password?token=${token}`));

    const new_password = "passwrod";
    await page.locator('input[name="password"]').fill(new_password);
    await page.locator('input[name="confirmPassword"]').fill(new_password);

    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(url("/login"));

    await TestServices.deleteUser(email, new_password);
  });

  test("reset-invalid-token", async ({ page }) => {
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);

    await page.goto(url(`/reset-password?token=12345`));

    const new_password = "passwrod";
    await page.locator('input[name="password"]').fill(new_password);
    await page.locator('input[name="confirmPassword"]').fill(new_password);

    await page.locator('button[type="submit"]').click();

    const errorMessage = page.getByText("Invalid or expired token");
    await expect(errorMessage).toBeVisible();

    await TestServices.deleteUser(email, password);
  });

  test("reset-mismatch-passwords", async ({ page }) => {
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);

    await page.goto(url(`/reset-password?token=12345`));

    const new_password = "passwrod";
    await page.locator('input[name="password"]').fill(new_password);
    await page.locator('input[name="confirmPassword"]').fill("12345");

    await page.locator('button[type="submit"]').click();

    const errorMessage = page.getByText("Passwords do not match");
    await expect(errorMessage).toBeVisible();

    await TestServices.deleteUser(email, password);
  });
});

// Verified Email Page
test.describe("Verify Email Page", () => {
  // Test
  test("verify-email-successful", async ({ page }) => {
    const result = await TestServices.createVerifiedUser(email, password);
    const token = result.data?.token;

    await page.goto(url(`/verify-email?token=${token}`));
    const msg = page.getByText("Your email has been verified.");
    await expect(msg).toBeVisible();

    await page.locator('button[type="button"]').click();
    await expect(page).toHaveURL(url("/login"));

    await TestServices.deleteUser(email, password);
  });

  test("verify-email-unsuccessful", async ({ page }) => {
    await page.goto(url(`/verify-email?token=123456`));
    const msg = page.getByText("Enter email to resend verification code.");
    await expect(msg).toBeVisible();
  });
});

// // Send vefication Email Page
// test.describe("Send Verfication Email Page", () => {
//   // Test
//   test("login-successful", async ({ page }) => {
//     await TestServices.createVerifiedUser(email, password);
//     const re
//     // const verified = await AuthServices.verify_email(result.data?.token);
//
//     await page.goto(url("/login"));
//     await page.getByPlaceholder("Enter your email").fill(email);
//     await page.getByPlaceholder("Enter your password").fill(password);
//     await page.getByRole("button", { name: "Sign In" }).click();
//     // console.log(login);
//
//     await page.getByRole("button", { name: "secret" }).click();
//
//     const secret = await page.evaluate(() => navigator.clipboard.readText());
//     // const secret = await page.evaluate(() => navigator.clipboard.readText());
//     console.log(secret);
//
//     // await page.goto(url("/setup-mfa"));
//     //
//     // await page.getByPlaceholder("Enter your email").fill(email);
//     // await page.getByPlaceholder("Enter your password").fill(password);
//     //
//     // const res = await page.getByRole("button", { name: "Sign In" }).click();
//     //
//     // // Expect an error message to appear
//     // await expect(
//     //   page.getByText(
//     //     "Scan the QR code and enter the 6-digit code from your authenticator app",
//     //   ),
//     // ).toBeVisible();
//
//     await TestServices.deleteUser(email, password);
//   });
// });
