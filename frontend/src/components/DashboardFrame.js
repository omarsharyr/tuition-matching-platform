import React from "react";
import Navbar from "./Navbar";            // ✅ component
import Sidebar from "./Sidebar";          // ✅ component
import NotificationCenter from "./NotificationCenter"; // ✅ component
import "../styles/DashboardLayout.css";   // ✅ CSS (side-effect)

export default function DashboardFrame({ role = "tutor", title = "", children }) {
  return (
    <div className="dash-root">
      <Navbar />
      <div className="dash-main">
        <Sidebar role={role} />
        <main className="dash-content" role="main" aria-label={title || "Dashboard"}>
          {title ? <h1 className="dash-title">{title}</h1> : null}
          {children}
        </main>
        {/* Right-side notification center */}
        <div className="notification-panel">
          <NotificationCenter />
        </div>
      </div>
    </div>
  );
}
