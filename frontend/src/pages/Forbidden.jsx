import React from "react";
import { Link } from "react-router-dom";
import "../styles/AuthForms.css";

export default function Forbidden() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  // Emergency debug
  console.log("🚨 FORBIDDEN PAGE DEBUG:", {
    user: user,
    token: token ? "EXISTS" : "MISSING",
    userRole: user?.role,
    localStorage: Object.keys(localStorage),
    currentURL: window.location.href
  });

  return (
    <div className="auth-container">
      <h1 className="auth-title">Access Denied</h1>
      <div className="auth-error">
        You don't have permission to access this page.
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <p>Current user: {user.name || "Unknown"}</p>
        <p>Role: {user.role || "Unknown"}</p>
        <p>Token: {token ? "EXISTS" : "MISSING"}</p>
      </div>
      
      {/* Emergency admin access button */}
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid #ddd' }}>
        <h4>Emergency Admin Access:</h4>
        <button 
          onClick={() => {
            console.log("🚨 FORCING ADMIN ACCESS");
            window.location.href = '/admin/dashboard';
          }}
          style={{ 
            backgroundColor: 'red', 
            color: 'white', 
            padding: '5px 10px', 
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Force Admin Dashboard
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <Link to="/" className="btn primary">Go to Home</Link>
      </div>
    </div>
  );
}
