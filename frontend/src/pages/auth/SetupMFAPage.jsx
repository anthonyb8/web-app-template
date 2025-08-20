import AuthLayout from "../../layouts/AuthLayout";
import MFASetupForm from "../../components/forms/MFASetupForm";

export default function SetupMFAPage() {
  return (
    <AuthLayout
      title="Set Up MFA"
      subtitle="Scan the QR code and enter the 6-digit code from your authenticator app"
    >
      <MFASetupForm />
    </AuthLayout>
  );
}
