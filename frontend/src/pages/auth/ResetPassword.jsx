import "./AuthForms.css";
import AuthLayout from "../../layouts/AuthLayout";
import { useState } from "react";
import { AuthServices } from "../../services/authService";
import { useNavigate, useSearchParams } from "react-router-dom";

function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const validateForm = () => {
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    const result = await AuthServices.reset_password(token, formData.password);

    if (result.success) {
      navigate("/login");
    } else {
      if (result.status === 400 || result.status === 409) {
        setError(result.message || "Invalid credentials.");
      } else {
        setError("Registration failed. Please try again.");
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="New Password (min 8 characters)"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          placeholder="Confirm password"
          disabled={loading}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Resetting Password..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPassword() {
  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password.">
      <ResetPasswordForm />
    </AuthLayout>
  );
}
