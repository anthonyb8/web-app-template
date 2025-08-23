import React from "react";
import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">Welcome to your dashboard</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Hours</h3>
          <p className="stat-value hours">127.5</p>
        </div>

        <div className="stat-card">
          <h3>Earnings</h3>
          <p className="stat-value earnings">$8,450</p>
        </div>

        <div className="stat-card">
          <h3>Clients</h3>
          <p className="stat-value clients">7</p>
        </div>

        <div className="stat-card">
          <h3>Projects</h3>
          <p className="stat-value projects">12</p>
        </div>
      </div>

      <div className="actions">
        <button className="btn primary">Get Started</button>
        <button className="btn secondary">Learn More</button>
      </div>
    </div>
  );
}
