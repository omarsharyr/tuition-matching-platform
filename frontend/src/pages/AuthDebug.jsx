import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AuthDebug() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    
    let user = null;
    try {
      user = userRaw ? JSON.parse(userRaw) : null;
    } catch (e) {
      console.error("Error parsing user data:", e);
    }

    const state = {
      hasToken: !!token,
      tokenValue: token ? token.substring(0, 20) + "..." : null,
      hasUser: !!user,
      userRole: user?.role,
      userEmail: user?.email,
      currentPath: location.pathname,
      userFullData: user
    };

    setAuthState(state);
    console.log("🔍 Auth Debug State:", state);
  }, [location]);

  const testTutorRoute = () => {
    console.log("🧪 Testing navigation to /tutor/jobs");
    navigate("/tutor/jobs");
  };

  const testTutorDebugRoute = () => {
    console.log("🧪 Testing navigation to /tutor/jobs-debug");
    navigate("/tutor/jobs-debug");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>🔍 Authentication Debug</h1>
      
      <div style={{ background: "#f5f5f5", padding: "15px", margin: "10px 0" }}>
        <h3>Current State:</h3>
        <p><strong>Path:</strong> {authState.currentPath}</p>
        <p><strong>Has Token:</strong> {authState.hasToken ? "✅ Yes" : "❌ No"}</p>
        <p><strong>Token:</strong> {authState.tokenValue || "None"}</p>
        <p><strong>Has User:</strong> {authState.hasUser ? "✅ Yes" : "❌ No"}</p>
        <p><strong>User Role:</strong> {authState.userRole || "None"}</p>
        <p><strong>User Email:</strong> {authState.userEmail || "None"}</p>
      </div>

      <div style={{ background: "#e8f4fd", padding: "15px", margin: "10px 0" }}>
        <h3>Full User Data:</h3>
        <pre>{JSON.stringify(authState.userFullData, null, 2)}</pre>
      </div>

      <div style={{ background: "#fff3cd", padding: "15px", margin: "10px 0" }}>
        <h3>Navigation Tests:</h3>
        <button onClick={testTutorRoute} style={{ margin: "5px", padding: "10px" }}>
          Navigate to /tutor/jobs (with PrivateRoute)
        </button>
        <button onClick={testTutorDebugRoute} style={{ margin: "5px", padding: "10px" }}>
          Navigate to /tutor/jobs-debug (without PrivateRoute)
        </button>
      </div>
    </div>
  );
}
