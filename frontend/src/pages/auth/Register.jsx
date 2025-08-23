import "./AuthForms.css";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import React, { useState } from "react";
import { AuthServices } from "../../services/authService";

function RegisterForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
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
    if (!formData.email || !formData.password) {
      setError("All fields are required");
      return false;
    }

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

    const result = await AuthServices.register(
      formData.email,
      formData.password,
    );

    if (result.success) {
      navigate("/login");
    } else {
      if (result.status === 400 || result.status === 409) {
        setError(result.message || "Invalid credentials.");
      } else {
        setError(result.message);
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter your email"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Create a password (min 8 characters)"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          placeholder="Confirm your password"
          disabled={loading}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}

export default function Register() {
  const navigate = useNavigate();

  return (
    <AuthLayout title="Create Account" subtitle="Join the work hours tracker">
      <RegisterForm />
      <div className="auth-footer">
        <p>
          Already have an account?{" "}
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
