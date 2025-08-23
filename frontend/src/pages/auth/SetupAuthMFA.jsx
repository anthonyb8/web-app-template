import "./AuthForms.css";
import { useEffect, useState } from "react";
import { AuthServices } from "../../services/authService";
import { MdContentCopy, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { tokenManager } from "../../tokenManager";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../layouts/AuthLayout";

function SetupAuthMFAForm() {
  const navigate = useNavigate();
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const { setIsAuthenticatorMfaSetup } = useAuth();
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = tokenManager.getAccessToken();

  useEffect(() => {
    async function fetchQr() {
      const result = await AuthServices.setup_authenticator_mfa();

      if (result.success) {
        setQr(result.data?.qr_code);
        setSecret(result.data?.secret);
      } else {
        if (result.status === 400 || result.status === 409) {
          setError(result.message || "Invalid credentials.");
        } else {
          setError("Failed to load QR code.");
        }
      }
    }

    if (token) {
      fetchQr();
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setIsAuthenticatorMfaSetup(true);

    navigate("/verify-authenticator-mfa");
    setLoading(false);
  };

  return (
    <form onSubmit={handleContinue}>
      {qr && (
        <div className="form-group" style={{ textAlign: "center" }}>
          <img
            src={qr}
            alt="QR Code"
            style={{ width: "200px", marginBottom: "1rem" }}
          />
        </div>
      )}

      {secret && (
        <div className="form-group" style={{ textAlign: "center" }}>
          <label>Secret Key </label>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.5rem",
              fontFamily: "monospace",
              color: "black",
            }}
          >
            <span name="secret">
              {showSecret ? secret : "••••••••••••••••••••••••"}
            </span>
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                backgroundColor: "black",
              }}
              title={showSecret ? "Hide" : "Show"}
            >
              {showSecret ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                backgroundColor: "black",
              }}
              title="Copy secret"
            >
              <MdContentCopy />
            </button>
            {copied && <span style={{ fontSize: "0.8rem" }}>Copied!</span>}
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Continuing..." : "Continue"}
      </button>
    </form>
  );
}

export default function SetupAuthMFA() {
  return (
    <AuthLayout
      title="Set Up MFA"
      subtitle="Scan the QR code and enter the 6-digit code from your authenticator app"
    >
      <SetupAuthMFAForm />
    </AuthLayout>
  );
}
