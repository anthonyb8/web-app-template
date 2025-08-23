import "./AuthForms.css";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function MFASelectionForm() {
  const navigate = useNavigate();
  const { isAuthenticatorMfaSetup } = useAuth();
  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!method) {
      setError("Please select an authentication method");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (method === "email") {
        navigate("/verify-email-mfa");
      } else if (method === "authenticator") {
        if (isAuthenticatorMfaSetup) {
          navigate("/verify-authenticator-mfa");
        } else {
          navigate("/setup-authenticator-mfa");
        }
      }
    } catch (err) {
      setError("Failed to proceed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Select Authentication Method:</label>

        <label>
          <input
            type="radio"
            name="mfaEmailOption"
            value="email"
            checked={method === "email"}
            onChange={(e) => setMethod(e.target.value)}
            disabled={loading}
          />
          Email Verification
        </label>

        <label>
          <input
            type="radio"
            name="mfaAuthenticatorOption"
            value="authenticator"
            checked={method === "authenticator"}
            onChange={(e) => setMethod(e.target.value)}
            disabled={loading}
          />
          Authenticator App
        </label>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        type="submit"
        className="submit-btn"
        disabled={loading || !method}
        onClick={handleSubmit}
      >
        {loading ? "Setting up..." : "Continue"}
      </button>
    </div>
  );
}

export default function MFASelection() {
  return (
    <AuthLayout title="MFA Selection" subtitle="Select Form of MFA.">
      <MFASelectionForm />
    </AuthLayout>
  );
}
