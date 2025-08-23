import "./AuthForms.css";
import { useState } from "react";
import { AuthServices } from "../../services/authService";
import AuthLayout from "../../layouts/AuthLayout";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const sendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await AuthServices.forgot_password(email);
      setMessage(response.data?.message);
    } catch (err) {
      setError("Invalid email");
    } finally {
      setLoading(false);
    }
  };

  return (
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

      {message && (
        <div name="message" className="link-btn">
          {message}
        </div>
      )}
      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Sending..." : "Send Email"}
      </button>
    </form>
  );
}

export default function ForgotPassword() {
  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email address. If it's correct, we'll send you an email with password reset instructions."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
