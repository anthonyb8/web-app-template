import React, { useState } from "react";
import "./Account.css";
import { useAuth } from "../../context/AuthContext";
import { AuthServices } from "../../services/authService";
import RecoveryCodesModal from "../../components/ui/RecoveryCodesModal";

export default function Account() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      setError("Logout error:", error);
    }
  };

  const handleGenerateRecoveryCodes = async () => {
    try {
      const result = await AuthServices.regenerate_recovery_codes();

      if (result.success) {
        setRecoveryCodes(result.data?.codes);
        setShowRecoveryCodes(true);
      }
    } catch (error) {
      setError("Logout error:", error);
    }
  };
  return (
    <div className="account-container">
      <h2>Account Settings</h2>
      <p className="subtitle">
        Manage your profile information, email, and password.
      </p>

      <div className="account-card">
        <p>
          <strong>Name:</strong> John Doe
        </p>
        <p>
          <strong>Email:</strong> john@example.com
        </p>
        <div className="button-group">
          <button className="edit-btn">Edit Profile</button>
          <button
            name="regenerate-codes-btn"
            className="recovery-codes-btn"
            onClick={handleGenerateRecoveryCodes}
          >
            Generate Recovery Codes
          </button>
          <button
            name="logout-btn"
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Recovery Codes Modal */}
      <RecoveryCodesModal
        recoveryCodes={recoveryCodes}
        isOpen={showRecoveryCodes && recoveryCodes.length > 0}
        onDone={() => {
          setShowRecoveryCodes([]);
          setShowRecoveryCodes(false);
        }}
      />
    </div>
  );
}
