import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import LoginForm from "../components/forms/LoginForm";
import MFASetupForm from "../components/forms/MFASetupForm";
import MFAVerifyForm from "../components/forms/MFAVerifyForm";
import RegisterForm from "../components/forms/RegisterForm";

const AuthPage = ({ initialForm }) => {
  const [currentStep, setCurrentStep] = useState(initialForm);
  const { isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // Determine which form to show based on auth state
  useEffect(() => {}, [currentStep]);

  useEffect(() => {
    setCurrentStep(initialForm);
  }, [initialForm]);

  // Redirect if already fully authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [currentStep, isAuthenticated]);

  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  const renderCurrentForm = () => {
    {
      console.log(currentStep);
    }
    switch (currentStep) {
      case "login":
        return (
          <>
            <AuthLayout
              title="Welcome Back"
              subtitle="Sign in to your work hours tracker"
            >
              <LoginForm onStepChange={handleStepChange} />
              <div className="auth-footer">
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => navigate("/register")}
                    // disabled={loading}
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </AuthLayout>
          </>
        );

      case "mfa-setup":
        return (
          <AuthLayout
            title="Set Up MFA"
            subtitle="Scan the QR code and enter the 6-digit code from your authenticator app"
          >
            <MFASetupForm onStepChange={handleStepChange} />
          </AuthLayout>
        );

      case "mfa-verify":
        return (
          <AuthLayout
            title="Verify MFA"
            subtitle="Enter the 6-digit code from your authenticator app"
          >
            <MFAVerifyForm onStepChange={handleStepChange} />
          </AuthLayout>
        );

      case "register":
        return (
          <AuthLayout
            title="Create Account"
            subtitle="Join the work hours tracker"
          >
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

      default:
        return (
          <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to your work hours tracker"
          >
            <LoginForm onStepChange={handleStepChange} />
          </AuthLayout>
        );
    }
  };

  return renderCurrentForm();
};

export default AuthPage;
