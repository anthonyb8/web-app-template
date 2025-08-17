import React from "react";
import "./LandingPage.css";
import { useNavigate } from "react-router";
import { Helmet } from "react-helmet-async";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>WorkLog – Track Your Time, Bill with Confidence</title>
        <meta
          name="description"
          content="The simplest way for freelancers and contractors to log their work and stay organized. Get started with WorkLog today."
        />
        <meta property="og:title" content="WorkLog – Track Your Time" />
        <meta
          property="og:description"
          content="Log work, bill with confidence, and stay organized."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/" />
      </Helmet>

      <div className="page-container">
        {/* Top Navigation Bar */}
        <header className="navbar">
          <div className="logo">WorkLog</div>
          <div className="nav-buttons">
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/register")}>Register</button>
          </div>
        </header>

        {/* Main Hero Section */}
        <main className="hero">
          <h1>Track Your Time! Bill With Confidence.</h1>
          <p>
            The simplest way for freelancers and contractors to log their work
            and stay organized.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate("/register")}>Get Started</button>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>© {new Date().getFullYear()} WorkLog. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
