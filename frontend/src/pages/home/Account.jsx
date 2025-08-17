import React from "react";
import "./Account.css";
import { useAuth } from "../../context/AuthContext";

export default function Account() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      console.error("Logout error:", error);
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
            name="logout-btn"
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
