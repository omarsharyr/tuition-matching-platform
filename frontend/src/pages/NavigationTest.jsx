import React from "react";
import { useNavigate } from "react-router-dom";

export default function NavigationTest() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    console.log(`🧭 Navigating to: ${path}`);
    navigate(path);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Navigation Test</h1>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => handleNavigation("/tutor/dashboard")}>
          Go to Tutor Dashboard
        </button>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => handleNavigation("/tutor/jobs")}>
          Go to Tutor Jobs (Protected)
        </button>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => handleNavigation("/tutor/jobs-debug")}>
          Go to Tutor Jobs (Unprotected)
        </button>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => window.location.href = "/tutor/jobs"}>
          Direct Window Navigation to Jobs
        </button>
      </div>
      <div style={{ marginTop: "20px" }}>
        <h3>Current Authentication:</h3>
        <p>Token: {localStorage.getItem("token") ? "Present" : "Missing"}</p>
        <p>User: {JSON.parse(localStorage.getItem("user") || '{}').email || "None"}</p>
        <p>Role: {JSON.parse(localStorage.getItem("user") || '{}').role || "None"}</p>
      </div>
    </div>
  );
}
