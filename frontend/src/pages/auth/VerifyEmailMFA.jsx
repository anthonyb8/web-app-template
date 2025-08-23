import "./AuthForms.css";
import AuthLayout from "../../layouts/AuthLayout";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { AuthServices } from "../../services/authService";
import { useNavigate } from "react-router-dom";

function VerifyEmailMFAForm() {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { startTokenRefreshCycle } = useAuth();

  async function send_email() {
    const result = await AuthServices.send_mfa_email();

    if (!result.success) {
      if (result.status === 400 || result.status === 409) {
        setError(result.message || "Invalid credentials.");
      } else {
        setError("Failed to send mfa verification email.");
      }
    }
  }
  useEffect(() => {
    async function fetchMFAEmail() {
      setLoading(true);
      await send_email();
      setLoading(false);
    }
    fetchMFAEmail();
  }, []);

  const handleResend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await send_email();

    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await AuthServices.verify_email_mfa(code);

    if (result.success) {
      startTokenRefreshCycle(
        result.data?.access_token,
        result.data?.expires_at,
      );
      if (result.data?.revcovery_codes) {
        {
          step === "recovery-codes" && (
            <RecoveryCodesForm
              recoveryCodes={result.data?.recovery_codes}
              onDone={() => navigate("/dashboard")}
            />
          );
        }
      } else {
        navigate("/dashboard");
      }
    } else {
      if (result.status === 400 || result.status === 409) {
        setError(result.message || "Invalid code.");
      } else {
        setError("MFA not verified. Please try again.");
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleVerify}>
      <div className="form-group">
        <label htmlFor="mfaCode">MFA Code</label>
        {loading ? (
          <div className="skeleton skeleton-input"></div>
        ) : (
          <>
            <input
              type="text"
              id="mfaCode"
              name="mfaCode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="Enter 6-digit code"
              maxLength="6"
              disabled={loading}
            />
            <small className="form-help">
              Open your authenticator app to get your current code.
            </small>
          </>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <p>
        Didn't receieve the code. Have a bew one sent{" "}
        <button onClick={handleResend}>Resend</button>
      </p>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </button>
    </form>
  );
}

export default function VerifyEmailMFA() {
  return (
    <AuthLayout
      title="Verify MFA"
      subtitle="Enter the 6-digit code from your authenticator app"
    >
      <VerifyEmailMFAForm />
    </AuthLayout>
  );
}
