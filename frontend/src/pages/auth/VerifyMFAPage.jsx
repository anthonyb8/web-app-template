import AuthLayout from "../../layouts/AuthLayout";
import MFAVerifyForm from "../../components/forms/MFAVerifyForm";

export default function VerifyMFAPage() {
  return (
    <AuthLayout
      title="Verify MFA"
      subtitle="Enter the 6-digit code from your authenticator app"
    >
      <MFAVerifyForm />
    </AuthLayout>
  );
}
