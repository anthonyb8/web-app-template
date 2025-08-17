import AuthLayout from "../../layouts/AuthLayout";
import ResetPassword from "../../components/forms/ResetPassword";

function ResetPasswordPage() {
  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password.">
      <ResetPassword />
    </AuthLayout>
  );
}

export default ResetPasswordPage;
