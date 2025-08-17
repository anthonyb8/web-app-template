import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import LoginForm from "../../components/forms/LoginForm";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return (
    <>
      <AuthLayout
        title="Welcome Back"
        subtitle="Sign in to your work hours tracker"
      >
        <LoginForm />
        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate("/register")}
            >
              Sign up
            </button>
          </p>
        </div>
      </AuthLayout>
    </>
  );
};

export default LoginPage;
