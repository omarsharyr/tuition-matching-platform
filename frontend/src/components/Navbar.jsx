// frontend/src/components/Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ showAuthButtons = true }) {
  const navigate = useNavigate();

  return (
    <header className="main-navbar">
      <div className="navbar-content">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          <div className="navbar-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Tuition Match</h1>
        </div>
        
        {showAuthButtons && (
          <div className="navbar-actions">
            <button 
              className="navbar-btn navbar-btn-outline"
              onClick={() => navigate("/login/student")}
            >
              Student Login
            </button>
            <button 
              className="navbar-btn navbar-btn-outline"
              onClick={() => navigate("/login/tutor")}
            >
              Tutor Login
            </button>
            <button 
              className="navbar-btn navbar-btn-primary"
              onClick={() => navigate("/register/student")}
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
