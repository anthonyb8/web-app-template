import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./TopBar.css";

const TopBar = ({ activeSection }) => {
  const { user } = useAuth();

  const getSectionTitle = (section) => {
    switch (section) {
      case "dashboard":
        return "Dashboard";
      case "work-hours":
        return "Work Hours Log";
      case "mfa-setup":
        return "Multi-Factor Authentication";
      case "profile":
        return "Profile Settings";
      default:
        return "Work Hours Tracker";
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1 className="page-title">{getSectionTitle(activeSection)}</h1>
        <p className="current-date">{getCurrentDate()}</p>
      </div>

      <div className="topbar-right">
        <div className="user-info">
          <div className="user-avatar">
            <span>
              {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
            </span>
          </div>
          <div className="user-details">
            <span className="user-name">Welcome back!</span>
            <span className="user-email">
              {user?.email || "user@example.com"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
