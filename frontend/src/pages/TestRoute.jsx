import React, { useEffect } from "react";

export default function TestRoute() {
  useEffect(() => {
    console.log("🧪 TestRoute component mounted");
    console.log("🔍 Current location:", window.location.href);
    console.log("🔍 Token exists:", !!localStorage.getItem("token"));
    console.log("🔍 User data:", localStorage.getItem("user"));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Route</h1>
      <p>This is a test route to debug navigation issues.</p>
      <p>Check the console for debug information.</p>
      <div>
        <h3>Current Authentication State:</h3>
        <p>Token: {localStorage.getItem("token") ? "Present" : "Missing"}</p>
        <p>User: {localStorage.getItem("user") || "None"}</p>
      </div>
      <div>
        <h3>Navigation Test:</h3>
        <button onClick={() => window.location.href = "/tutor/jobs"}>
          Direct Navigate to /tutor/jobs
        </button>
      </div>
    </div>
  );
}
