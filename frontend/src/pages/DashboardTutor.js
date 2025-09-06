// frontend/src/pages/DashboardTutor.js
import React, { useMemo } from "react";
import "../styles/global.css"; // keep your existing styles if present

export default function DashboardTutor() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("authUser") || "{}");
    } catch {
      return {};
    }
  }, []);

  const name = user?.name || "Tutor";
  const role = String(user?.role || "").toLowerCase();
  const verified = Boolean(user?.isVerified);
  const status = String(user?.status || "").toUpperCase();

  // Always render *something* — do not go blank
  if (role !== "tutor") {
    return (
      <div className="tutor-dashboard">
        <div className="td-card">
          <h2 className="td-title">Not a Tutor</h2>
          <p className="td-subtitle">You’re logged in as: <b>{user?.role || "Unknown"}</b></p>
          <p className="td-note">Please log in as a tutor to view this dashboard.</p>
        </div>
      </div>
    );
  }

  // Pending verification: keep your light, white style
  if (!verified || status === "PENDING_VERIFICATION") {
    return (
      <div className="tutor-dashboard">
        <div className="td-card">
          <h2 className="td-title">Pending Verification</h2>
          <p className="td-subtitle">
            Your account is under review. Once an admin verifies your documents, your dashboard will unlock.
          </p>
          <ul className="td-list">
            <li>Status: <strong>{status || "UNKNOWN"}</strong></li>
            <li>Verified: <strong>{verified ? "Yes" : "No"}</strong></li>
          </ul>
        </div>
      </div>
    );
  }

  // Verified tutor: render base shell (no design change; minimal content)
  return (
    <div className="tutor-dashboard">
      <div className="td-card">
        <h2 className="td-title">Welcome, {name}</h2>
        <p className="td-subtitle">Browse and apply to tuition jobs.</p>
        {/* TODO: Your existing job board & filters go here; preserving your design */}
      </div>
    </div>
  );
}
