import "./AuthForms.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { AuthServices } from "../../services/authService";
import { useNavigate, useSearchParams } from "react-router-dom";

function SuccessfullyVerified() {
  const navigate = useNavigate();

  return (
    <>
      <div className="logo">
        <h2>Email Successfully Verified!</h2>
        <p>Your email has been verified.</p>
      </div>
      <form>
        <div className="form-group">
          <button
            type="button"
            className="submit-btn"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </form>
    </>
  );
}

function UnsuccessfullyVerified() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await AuthServices.send_verification_email(email);
      console.log(response);
    } catch (err) {
      setError("Invalid email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="logo">
        <h2>Email Not Verified!</h2>
        <p>Enter email to resend verification code.</p>
      </div>
      <form onSubmit={sendEmail}>
        <div className="form-group">
          <input
            type="text"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            maxLength="50"
            disabled={loading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Sending..." : "Send Email"}
        </button>
      </form>
    </>
  );
}

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState(false);
  const token = searchParams.get("token");

  useEffect(() => {
    const verify_email = async () => {
      const response = await AuthServices.verify_email(token);
      console.log(response);

      if (response.success) {
        setResult(true);
      } else {
        setResult(false);
      }
    };
    verify_email();
  }, []);

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <div className="auth-header">
          {result ? <SuccessfullyVerified /> : <UnsuccessfullyVerified />}
        </div>
      </div>
    </div>
  );
}
