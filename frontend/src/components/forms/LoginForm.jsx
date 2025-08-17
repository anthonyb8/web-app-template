import "./AuthForms.css";
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { AuthServices } from "../../services/authService";
import { tokenManager } from "../../tokenManager";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setIsLoggedIn, setIsMfaSetup } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await AuthServices.login(formData.email, formData.password);

    if (result.success) {
      tokenManager.setAccessToken(result.data?.access_token);
      setIsLoggedIn(true);
      console.log(result.data);
      // setMfaSetup(result.data?.mfa_setup));
      if (!result.data?.mfa_setup) {
        setIsMfaSetup(false);
        navigate("/setup-mfa");
      } else {
        setIsMfaSetup(true);
        navigate("/verify-mfa");
      }
    } else {
      if (result.status === 400 || result.status === 409) {
        setError(result.message || "Invalid credentials.");
        throw error;
      } else {
        setError("Login failed. Please try again.");
        throw error;
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
          placeholder="Enter your password"
          disabled={loading}
        />
      </div>
      <div>
        <p>
          Forgot{" "}
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate("/forgot-password")}
          >
            password
          </button>{" "}
          ?
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}

// export default LoginForm;
