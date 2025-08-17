import axios from "axios";
import { authenticator } from "otplib";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AuthServices } from "../../src/services/authService";
import { TestServices } from "../setup";
import { tokenManager } from "../../src/tokenManager";

const email = "test@example.com";
const password = "password123";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

describe("AuthServices.register", () => {
  it("register_successful", async () => {
    // Test
    const result = await TestServices.createVerifiedUser(email, password);

    // Validate
    expect(result.success).toBe(true);

    // Clean up
    await TestServices.deleteUser(email, password);
  });

  it("register_unsuccessful", async () => {
    // test
    await TestServices.createVerifiedUser(email, password);
    const result = await AuthServices.register(email, password);

    // validate
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toBe("Email already registered");

    // Clean up
    await TestServices.deleteUser(email, password);
  });
});

describe("AuthServices.verify_email", () => {
  let token;

  beforeEach(async () => {
    const result = await TestServices.createVerifiedUser(email, password);
    token = result.data?.token;
  });

  afterEach(async () => {
    await TestServices.deleteUser(email, password);
  });

  it("verify_email_successful", async () => {
    // Test
    const result = await AuthServices.verify_email(token);

    // Validate
    expect(result.success).toBe(true);
  });

  it("register_unsuccessful", async () => {
    // test
    const result = await AuthServices.verify_email("invalid");

    // validate
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toBe("Invalid or expired token");
  });
});

describe("AuthServices.login", () => {
  let token;

  beforeEach(async () => {
    const result = await TestServices.createVerifiedUser(email, password);
    token = result.data?.token;
    await AuthServices.verify_email(token);
  });

  afterEach(async () => {
    await TestServices.deleteUser(email, password);
  });

  it("login_successful", async () => {
    // Test
    const result = await AuthServices.login(email, password);

    // Validate
    expect(result.success).toBe(true);
    expect(result.data?.access_token).toBeTruthy();
    expect(result.data?.mfa_setup).toBeFalsy();
    expect(result.data?.mfa_required).toBeTruthy();
    expect(result.data?.expires_at).toBeTruthy();
  });

  it("login_unsuccessful", async () => {
    // test
    const result = await AuthServices.login("wrongemil@gmail.com", password);

    // validate
    expect(result.success).toBe(false);
    expect(result.status).toBe(401);
    expect(result.message).toBe("Invalid email or password");
  });
});

describe("AuthServices.forgot_passsword", () => {
  let token;

  beforeEach(async () => {
    const result = await TestServices.createVerifiedUser(email, password);
    token = result.data?.token;
    await AuthServices.verify_email(token);
  });

  afterEach(async () => {
    await TestServices.deleteUser(email, password);
  });

  it("forgot_password_user_exists", async () => {
    // Test
    const result = await TestServices.forgot_password(email);

    // Validate
    expect(result.success).toBe(true);
    expect(result.data?.message).toBe("If email exists reset link sent.");
    expect(result.data?.token).toBeTruthy();
  });

  it("forgot_password_no_user", async () => {
    // test
    const result = await AuthServices.forgot_password("wrongemil@gmail.com");

    // validate
    expect(result.success).toBe(true);
    expect(result.data?.message).toBe("If email exists, reset link sent");
  });
});

describe("AuthServices.reset_passsword", () => {
  let token;
  let new_password = "new_password";

  beforeEach(async () => {
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);
    const response = await TestServices.forgot_password(email);
    token = response.data?.token;
  });

  afterEach(async () => {});

  it("reset_password_user_exists", async () => {
    // Test
    const result = await AuthServices.reset_password(token, new_password);

    // Validate
    expect(result.success).toBe(true);
    expect(result.data?.message).toBe("Password updated successfully");

    // cleanup
    await TestServices.deleteUser(email, new_password);
  });

  it("reset_password_no_user", async () => {
    // test
    const result = await AuthServices.reset_password("invalid", new_password);

    // validate
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toBe("Invalid or expired token");

    // cleanup
    await TestServices.deleteUser(email, password);
  });
});

describe("AuthServices.setup_mfa", () => {
  // let token;

  beforeEach(async () => {
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);
    const login_result = await AuthServices.login(email, password);
    tokenManager.setAccessToken(login_result.data?.access_token);
  });

  afterEach(async () => {
    await TestServices.deleteUser(email, password);
  });

  it("setup_mfa_successful", async () => {
    // Test
    const result = await AuthServices.setup_mfa();

    // Validate
    expect(result.success).toBe(true);
    expect(result.data?.secret).toBeTruthy();
    expect(result.data?.qr_code).toBeTruthy();
  });

  it("setup_mfa_invalid_token", async () => {
    // test
    tokenManager.setAccessToken("invalid_token");
    const result = await AuthServices.setup_mfa();

    // validate
    expect(result.success).toBe(false);
    expect(result.status).toBe(401);
    expect(result.message).toBe("Invalid authentication credentials");
  });
});

describe("AuthServices.verify_mfa", () => {
  let secret;
  beforeEach(async () => {
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);
    const login_result = await AuthServices.login(email, password);
    tokenManager.setAccessToken(login_result.data?.access_token);
    const setup_result = await AuthServices.setup_mfa();
    secret = setup_result.data?.secret;
  });

  afterEach(async () => {
    await TestServices.deleteUser(email, password);
  });
  it("verify_mfa_successful", async () => {
    // Test
    const code = authenticator.generate(secret);
    const result = await AuthServices.verify_mfa(code);

    // Validate
    expect(result.success).toBe(true);
    expect(result.data?.access_token).toBeTruthy();
    expect(result.data?.expires_at).toBeTruthy();
    expect(result.data?.token_type).toBe("bearer");
  });

  it("verify_mfa_invalid_code", async () => {
    // Test
    const result = await AuthServices.verify_mfa("123456");

    // validate
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toBe("Invalid MFA code");
  });
});

describe("AuthServices.verify-recovery-code", () => {
  let secret;
  let codes;
  beforeEach(async () => {
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);
    const login_result = await AuthServices.login(email, password);
    tokenManager.setAccessToken(login_result.data?.access_token);
    const setup_result = await AuthServices.setup_mfa();
    secret = setup_result.data?.secret;
    codes = setup_result.data?.recovery_codes;
  });

  afterEach(async () => {
    await TestServices.deleteUser(email, password);
  });

  it("verify_recovery_successful", async () => {
    // Test
    const code = authenticator.generate(secret);
    const _ = await AuthServices.verify_mfa(code);
    const result = await AuthServices.verify_recovery_code(codes[0]);

    // Validate
    expect(result.success).toBe(true);
    expect(result.data?.access_token).toBeTruthy();
    expect(result.data?.expires_at).toBeTruthy();
    expect(result.data?.token_type).toBe("bearer");
  });

  it("verify_recovery_invalid_code", async () => {
    // Test
    const result = await AuthServices.verify_recovery_code("123456");

    // validate
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toBe("MFA not set up");
  });
});

describe("AuthServices.regenerate-recovery-codes", () => {
  let secret;
  beforeEach(async () => {
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);
    const login_result = await AuthServices.login(email, password);
    tokenManager.setAccessToken(login_result.data?.access_token);
    const setup_result = await AuthServices.setup_mfa();
    secret = setup_result.data?.secret;
  });

  afterEach(async () => {
    await TestServices.deleteUser(email, password);
  });

  it("regenerate-recovery-codes-success", async () => {
    // Test
    const code = authenticator.generate(secret);
    const verify_result = await AuthServices.verify_mfa(code);
    tokenManager.setAccessToken(verify_result.data?.access_token);

    const result = await AuthServices.regenerate_recovery_codes();

    // Validate
    expect(result.success).toBe(true);
    expect(result.data?.codes.length).toBe(10);
  });

  it("regenerate-recovery-codes-unsuccess", async () => {
    // Test
    const result = await AuthServices.regenerate_recovery_codes();

    // validate
    expect(result.success).toBe(false);
    expect(result.status).toBe(401);
    expect(result.message).toBe("Invalid authentication credentials");
  });
});

describe("AuthServices.disable-mfa", () => {
  let secret;

  beforeEach(async () => {
    const result = await TestServices.createVerifiedUser(email, password);
    await AuthServices.verify_email(result.data?.token);
    const login_result = await AuthServices.login(email, password);
    tokenManager.setAccessToken(login_result.data?.access_token);
    const setup_result = await AuthServices.setup_mfa();
    secret = setup_result.data?.secret;
  });

  afterEach(async () => {
    await TestServices.deleteUser(email, password);
  });

  it("disable-mfa-success", async () => {
    // Test
    const totp_code = authenticator.generate(secret);
    const verify_result = await AuthServices.verify_mfa(totp_code);
    tokenManager.setAccessToken(verify_result.data?.access_token);

    const code = authenticator.generate(secret);
    const result = await AuthServices.disable_mfa(code);

    // Validate
    expect(result.success).toBe(true);
    expect(result.data?.message).toBe("MFA disabled successfully");
  });

  it("disable-mfa-unsuccess", async () => {
    // Test
    const result = await AuthServices.disable_mfa("123456");

    // validate
    expect(result.success).toBe(false);
    expect(result.status).toBe(401);
    expect(result.message).toBe("Invalid authentication credentials");
  });
});

// // Todo : how to test refresh token with the cookies
// describe("AuthServices.refresh_token", () => {
//   let secret;
//   let token;
//   let cookieJar = ""; // Store cookies manually
//
//   beforeEach(async () => {
//     const result = await TestServices.createVerifiedUser(email, password);
//     await AuthServices.verify_email(result.data?.token);
//     const login_result = await AuthServices.login(email, password);
//     token = login_result.data?.access_token;
//     tokenManager.setAccessToken(token);
//     const setup_result = await AuthServices.setup_mfa();
//     secret = setup_result.data?.secret;
//   });
//
//   afterEach(async () => {
//     await TestServices.deleteUser(email, password);
//   });
//
//   it("refresh_token_successful", async () => {
//     const code = authenticator.generate(secret);
//
//     // Verify MFA and capture cookies
//     const response = await axios.post(
//       `${BASE_URL}/auth/verify-mfa`,
//       { code: code },
//       {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       },
//     );
//
//     // Extract and store cookies manually
//     const setCookieHeader = response.headers["set-cookie"];
//     console.log(setCookieHeader);
//
//     if (setCookieHeader) {
//       cookieJar = setCookieHeader
//         .map((cookie) => cookie.split(";")[0]) // Get name=value part only
//         .join("; ");
//       console.log("Captured cookies:", cookieJar);
//     }
//
//     // // Test
//     const result = await AuthServices.refresh_token();
//     console.log(result);
//
//     // Validate
//     // expect(result.success).toBe(true);
//     // expect(result.data?.access_token).toBeTruthy();
//     // expect(result.data?.refresh_token).toBeTruthy();
//     // expect(result.data?.expires_at).toBeTruthy();
//     // expect(result.data?.token_type).toBe("bearer");
//
//     // Clean up
//     // await delete_user(email, password);
//   });
//   // it("refresh_token_invalid_code", async () => {
//   //   await AuthServices.register(email, password);
//   //   const login_result = await AuthServices.login(email, password);
//   //   const token = login_result.data?.access_token;
//   //   await AuthServices.setup_mfa(token);
//   //
//   //   // Test
//   //   const result = await AuthServices.verify_mfa(token, "123456");
//   //
//   //   // validate
//   //   // expect(result.success).toBe(false);
//   //   // expect(result.status).toBe(400);
//   //   // expect(result.message).toBe("Invalid MFA code");
//   //
//   //   await delete_user(email, password);
//   // });
// });
