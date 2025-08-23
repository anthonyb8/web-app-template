import "./AuthForms.css";
import AuthLayout from "../../layouts/AuthLayout";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { AuthServices } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import RecoveryCodesModal from "../../components/ui/RecoveryCodesModal";

function VerifyAuthMFAForm() {
  const navigate = useNavigate();

  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { startTokenRefreshCycle } = useAuth();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await AuthServices.verify_authenticator_mfa(code);

    if (result.success) {
      startTokenRefreshCycle(
        result.data?.access_token,
        result.data?.expires_at,
      );
      if (result.data?.recovery_codes) {
        setShowRecoveryCodes(true);
        setRecoveryCodes(result.data?.recovery_codes);
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
    <div>
      <form onSubmit={handleVerify}>
        <div className="form-group">
          <label htmlFor="mfaCode">MFA Code</label>
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
        </div>

        <div>
          <p>
            Lost access to the authenticator use a{" "}
            <button
              type="button"
              className="link-btn"
              name="useRecovery-btn"
              onClick={() => navigate("/verify-recovery-code")}
            >
              recovery code
            </button>
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      {/* Recovery Codes Modal */}
      <RecoveryCodesModal
        recoveryCodes={recoveryCodes}
        isOpen={showRecoveryCodes && recoveryCodes.length > 0}
        onDone={() => {
          setShowRecoveryCodes([]);
          setShowRecoveryCodes(false);
          navigate("/dashboard");
        }}
      />
    </div>
  );
}

export default function VerifyAuthMFA() {
  return (
    <AuthLayout
      title="Verify MFA"
      subtitle="Enter the 6-digit code from your authenticator app"
    >
      <VerifyAuthMFAForm />
    </AuthLayout>
  );
}
