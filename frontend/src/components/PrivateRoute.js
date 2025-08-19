import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import "../styles/PrivateRoute.css";

export default function PrivateRoute({ children, requireVerified = false }) {
  const token = localStorage.getItem("authToken");
  const profile = JSON.parse(localStorage.getItem("authProfile") || "null");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireVerified && profile && !profile.isVerified) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Account Pending Verification</h2>
        <p>Your account is waiting for admin approval. You'll get access once verified.</p>
        <button onClick={() => {
          localStorage.clear();
          window.location.href = '/';
        }}>
          Logout
        </button>
      </div>
    );
  }

  return children;
}
