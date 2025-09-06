// frontend/src/pages/AdminTest.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminTest() {
  const navigate = useNavigate();
  
  const testDirect = () => {
    // Clear everything first
    localStorage.clear();
    
    // Set admin data directly
    const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YWFlYWJkMDdiM2IxYWQ3YTMyZWIzNSIsInJvbGUiOiJhZG1pbiIsImlzVmVyaWZpZWQiOnRydWUsImlhdCI6MTc1NzAyMTM1NiwiZXhwIjoxNzU3MTk0MTU2fQ.xwQjKVJ5-lfU0dFalvNfRtJCrXyL6oEimxexQDVHFzM";
    const adminUser = {
      id: "68aaeabd07b3b1ad7a32eb35",
      name: "Platform Admin",
      email: "admin@tuition.local",
      role: "admin",
      isVerified: true,
      verificationStatus: "verified",
      status: "ACTIVE"
    };
    
    localStorage.setItem("token", adminToken);
    localStorage.setItem("user", JSON.stringify(adminUser));
    
    console.log("✅ Admin data set, navigating to dashboard...");
    navigate("/admin/dashboard", { replace: true });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Test Page</h2>
      <p>This will set admin credentials directly and navigate to dashboard</p>
      
      <button 
        onClick={testDirect}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Admin Access
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Current localStorage:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px' }}>
          {JSON.stringify({
            token: localStorage.getItem("token") ? "EXISTS" : "MISSING",
            user: localStorage.getItem("user") || "MISSING"
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
