import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/home/Dashboard";
import Account from "./pages/home/Account";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import MFASelection from "./pages/auth/MfaSelection";
import SetupAuthMFA from "./pages/auth/SetupAuthMFA";
import VerifyAuthMFA from "./pages/auth/VerifyAuthMFA";
import VerifyEmailMFA from "./pages/auth/VerifyEmailMFA";
import RecoveryCode from "./pages/auth/RecoveryCode";

function LoginProtectedLayout() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/mfa-selection" element={<MFASelection />} />

      <Route element={<LoginProtectedLayout />}>
        <Route path="/setup-authenticator-mfa" element={<SetupAuthMFA />} />
        <Route path="/verify-authenticator-mfa" element={<VerifyAuthMFA />} />
        <Route path="/verify-email-mfa" element={<VerifyEmailMFA />} />
        <Route path="/verify-recovery-code" element={<RecoveryCode />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/account" element={<Account />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
