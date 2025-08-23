import "./AuthForms.css";
import AuthLayout from "../../layouts/AuthLayout";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { AuthServices } from "../../services/authService";
import { useNavigate } from "react-router-dom";

function RecoveryCodeForm() {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { startTokenRefreshCycle } = useAuth();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await AuthServices.verify_recovery_code(code);

    if (result.success) {
      startTokenRefreshCycle(
        result.data?.access_token,
        result.data?.expires_at,
      );
      navigate("/dashboard");
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
        <input
          type="text"
          id="mfaCode"
          name="mfaCode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          placeholder="Enter 8-digit code"
          maxLength="8"
          disabled={loading}
        />
        <small className="form-help">
          Open your authenticator app to get your current code.
        </small>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </button>
    </form>
  );
}

export default function RecoveryCode() {
  return (
    <AuthLayout
      title="Verify MFA"
      subtitle="Enter the 6-digit code from your authenticator app"
    >
      <RecoveryCodeForm />
    </AuthLayout>
  );
}
