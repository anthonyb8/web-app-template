import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import RegisterForm from "../../components/forms/RegisterForm";

export default function RegisterPage() {
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
