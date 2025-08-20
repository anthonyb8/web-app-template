import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage from "./components/forms/VerifyEmail";
import SetupMFAPage from "./pages/auth/SetupMFAPage";
import VerifyMFAPage from "./pages/auth/VerifyMFAPage";
import DashboardPage from "./pages/home/DashboardPage";
import Account from "./pages/home/Account";

function LoginProtectedLayout() {
  const { isLoggedIn, isMfaSetup } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user needs MFA setup (doesn't have it configured)
  if (!isMfaSetup && location.pathname !== "/setup-mfa") {
    return <Navigate to="/setup-mfa" replace />;
  }

  // If user has MFA setup but isn't on verify page
  if (isMfaSetup && location.pathname !== "/verify-mfa") {
    return <Navigate to="/verify-mfa" replace />;
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
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route element={<LoginProtectedLayout />}>
        <Route path="/setup-mfa" element={<SetupMFAPage />} />
        <Route path="/verify-mfa" element={<VerifyMFAPage />} />
      </Route>

      {/* Protected routes - all share DashboardLayout */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/account" element={<Account />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
