import "./AuthForms.css";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { AuthServices } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function MFAVerifyPage() {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { startTokenRefreshCycle } = useAuth();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await AuthServices.verify_mfa(code);

    if (result.success) {
      startTokenRefreshCycle(
        result.data?.access_token,
        result.data?.expires_at,
      );

      navigate("/dashboard");
    } else {
      if (result.status === 400 || result.status === 409) {
        setError(result.message || "Invalid code.");
        throw error;
      } else {
        setError("MFA not verified. Please try again.");
        throw error;
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
          placeholder="Enter 6-digit code"
          maxLength="6"
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
