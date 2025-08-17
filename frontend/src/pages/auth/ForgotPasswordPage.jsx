import AuthLayout from "../../layouts/AuthLayout";
import ForgotPassword from "../../components/forms/ForgotPassword";

function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email address. If it's correct, we'll send you an email with password reset instructions."
    >
      <ForgotPassword />
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
