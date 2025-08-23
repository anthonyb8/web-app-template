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
    await expect(page).toHaveURL(url("/mfa-selection"));

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

// MFA Selection Page
test.describe("MFA Selection Page", () => {
  // Test
  test("select-email-mfa", async ({ page }) => {
    // Register
    const result = await TestServices.createVerifiedUser(email, password);
    const verified = await AuthServices.verify_email(result.data?.token);

    // Login
    await page.goto(url("/login"));
    await page.getByPlaceholder("Enter your email").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);
    const res = await page.getByRole("button", { name: "Sign In" }).click();

    // Test
    await page.locator('input[name="mfaEmailOption"]').click();
    await page.getByRole("button", { type: "submit" }).click();

    // Expect
    await expect(page).toHaveURL(url("/verify-email-mfa"));

    await TestServices.deleteUser(email, password);
  });

  test("select-authenticator-mfa", async ({ page }) => {
    // Register
    const result = await TestServices.createVerifiedUser(email, password);
    const verified = await AuthServices.verify_email(result.data?.token);

    // Login
    await page.goto(url("/login"));
    await page.getByPlaceholder("Enter your email").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);
    const res = await page.getByRole("button", { name: "Sign In" }).click();

    // Test
    await page.locator('input[name="mfaAuthenticatorOption"]').click();
    await page.getByRole("button", { type: "submit" }).click();

    // Expect
    await expect(page).toHaveURL(url("/setup-authenticator-mfa"));

    await TestServices.deleteUser(email, password);
  });

  test("select-authenticator-mfa-already-setup", async ({ page }) => {
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

    // Logout
    await page.locator('li[name="button-to-account"]').click();
    await page.locator('button[name="logout-btn"]').click();

    // Login
    await page.goto(url("/login"));
    await page.getByPlaceholder("Enter your email").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);
    const res = await page.getByRole("button", { name: "Sign In" }).click();

    // Test
    await page.locator('input[name="mfaAuthenticatorOption"]').click();
    await page.getByRole("button", { type: "submit" }).click();

    // Expect
    await expect(page).toHaveURL(url("/verify-authenticator-mfa"));

    await TestServices.deleteUser(email, password);
  });
});

// MFA Authenticator Setup  Page
test.describe("MFA Authenticator Setup Page", () => {
  test("mfa-authenticator-successful", async ({ page }) => {
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
    expect(secret).toBeTruthy();

    // Continue when mfa setup
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(url("/verify-authenticator-mfa"));

    await TestServices.deleteUser(email, password);
  });
});

// Verify Authenticator page
test.describe("Verify-Authenticator-MFA Page", () => {
  test("verify-auth-successful", async ({ page }) => {
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

    // Expect
    await expect(page).toHaveURL(url("/dashboard"));

    await TestServices.deleteUser(email, password);
  });

  test("verify-auth-invalid", async ({ page }) => {
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
    const code = authenticator.generate("RSLF7CSBTGRWU6KK5G34VXN7SB37D5RP");
    await page.locator('input[name="mfaCode"]').fill(code);
    await page.locator('button[type="submit"]').click();

    // Expect
    const errorMessage = page.getByText("Invalid MFA code");
    await expect(errorMessage).toBeVisible();

    await TestServices.deleteUser(email, password);
  });
});

// Verify mfa page
test.describe("Verify-Email-MFA Page", () => {
  test("verify-email-successful", async ({ page }) => {
    // Register
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);

    // Login
    await page.goto(url("/login"));
    await page.getByPlaceholder("Enter your email").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Select Email Option
    await page.locator('input[name="mfaEmailOption"]').click();
    await page.getByRole("button", { type: "submit" }).click();

    // Test
    const entry = page.locator('input[name="mfaCode"]');
    await new Promise((r) => setTimeout(r, 1000)); // Delay for a second to let the new code settle
    const res = await TestServices.send_email_mfa(email);

    // console.log(code);
    // await entry.type(code);
    await entry.fill(res.data?.code);
    await page.locator('button[type="submit"]').click();

    // Expect
    await expect(page).toHaveURL(url("/dashboard"));

    await TestServices.deleteUser(email, password);
  });

  test("verify-email-invalid", async ({ page }) => {
    // Register
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);

    // Login
    await page.goto(url("/login"));
    await page.getByPlaceholder("Enter your email").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Select Email Option
    await page.locator('input[name="mfaEmailOption"]').click();
    await page.getByRole("button", { type: "submit" }).click();

    // Test
    const code = "123456";
    await page.locator('input[name="mfaCode"]').fill(code);
    await page.locator('button[type="submit"]').click();

    const errorMessage = page.getByText("Invalid MFA code");
    await expect(errorMessage).toBeVisible();

    await TestServices.deleteUser(email, password);
  });
});

// PAssin  but fail in CI ithnk timign related
// // Recovery Code Page
// test.describe("Recover Codes Page", () => {
//   test("recovery-code-successful", async ({ page }) => {
//     // Register
//     const result = await TestServices.createVerifiedUser(email, password);
//     await AuthServices.verify_email(result.data?.token);
//
//     // Login
//     await page.goto(url("/login"));
//     await page.getByPlaceholder("Enter your email").fill(email);
//     await page.getByPlaceholder("Enter your password").fill(password);
//     await page.getByRole("button", { name: "Sign In" }).click();
//     await page.waitForURL(url("/mfa-selection"));
//
//     // Selector
//     await page.locator('input[name="mfaAuthenticatorOption"]').click();
//     await page.getByRole("button", { type: "submit" }).click();
//     await page.waitForURL(url("/setup-authenticator-mfa"));
//
//     // Setup
//     const secret_cont = page.locator('span[name="secret"]');
//     await page.getByRole("button", { name: "Show" }).click();
//     const secret = await secret_cont.textContent();
//     await page.locator('button[type="submit"]').click();
//     await page.waitForURL(url("/verify-authenticator-mfa"));
//
//     // Verify
//     const code = authenticator.generate(secret.trim());
//     await page.locator('input[name="mfaCode"]').fill(code);
//     await page.locator('button[type="submit"]').click();
//
//     // Get Recovery Code
//     const recovery_code = await page
//       .locator('[data-testid="recovery-code-1"]')
//       .textContent();
//     await page.locator('button[name="doneCodes"]').click();
//
//     // Logout
//     await page.locator('li[name="button-to-account"]').click();
//     await page.locator('button[name="logout-btn"]').click();
//
//     // Login
//     await page.goto(url("/login"));
//     await page.getByPlaceholder("Enter your email").fill(email);
//     await page.getByPlaceholder("Enter your password").fill(password);
//     const res = await page.getByRole("button", { name: "Sign In" }).click();
//
//     // Select
//     await page.locator('input[name="mfaAuthenticatorOption"]').click();
//     await page.getByRole("button", { type: "submit" }).click();
//
//     // Click use code
//     await page.locator('button[name="useRecovery-btn"]').click();
//
//     // Test
//     await page.waitForURL(url("/verify-recovery-code"));
//     await page.locator('input[name="mfaCode"]').fill(recovery_code);
//     await page.locator('button[type="submit"]').click();
//
//     // Expect
//     await expect(page).toHaveURL(url("/dashboard"));
//
//     await TestServices.deleteUser(email, password);
//   });
//
//   test("recovery-code-unsuccessful", async ({ page }) => {
//     // Register
//     const result = await TestServices.createVerifiedUser(email, password);
//     await AuthServices.verify_email(result.data?.token);
//
//     // Login
//     await page.goto(url("/login"));
//     await page.getByPlaceholder("Enter your email").fill(email);
//     await page.getByPlaceholder("Enter your password").fill(password);
//     await page.getByRole("button", { name: "Sign In" }).click();
//
//     // Selector
//     await page.locator('input[name="mfaAuthenticatorOption"]').click();
//     await page.getByRole("button", { type: "submit" }).click();
//
//     // Setup
//     const secret_cont = page.locator('span[name="secret"]');
//     await page.getByRole("button", { name: "Show" }).click();
//     const secret = await secret_cont.textContent();
//     await page.locator('button[type="submit"]').click();
//
//     // Verify
//     const code = authenticator.generate(secret.trim());
//     await page.locator('input[name="mfaCode"]').fill(code);
//     await page.locator('button[type="submit"]').click();
//
//     // Get Recovery Code
//     const recovery_code = await page
//       .locator('[data-testid="recovery-code-1"]')
//       .textContent();
//     await page.locator('button[name="doneCodes"]').click();
//
//     // Logout
//     await page.locator('li[name="button-to-account"]').click();
//     await page.locator('button[name="logout-btn"]').click();
//
//     // Login
//     await page.goto(url("/login"));
//     await page.getByPlaceholder("Enter your email").fill(email);
//     await page.getByPlaceholder("Enter your password").fill(password);
//     const res = await page.getByRole("button", { name: "Sign In" }).click();
//
//     // Select
//     await page.locator('input[name="mfaAuthenticatorOption"]').click();
//     await page.getByRole("button", { type: "submit" }).click();
//
//     // Click use code
//     await page.locator('button[name="useRecovery-btn"]').click();
//
//     // Test
//     const invalid_code = "12345678";
//     const recoveryInput = page.locator('input[name="mfaCode"]');
//     await recoveryInput.waitFor();
//     await recoveryInput.fill(invalid_code);
//     await page.locator('button[type="submit"]').click();
//
//     // Expect
//     const errorMessage = page.getByText("Invalid recovery code.");
//     await expect(errorMessage).toBeVisible();
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
