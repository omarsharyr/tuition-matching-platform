// Debug component to test authentication
import React from 'react';

export default function AuthDebug() {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  
  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch (e) {
    console.error("Error parsing user data:", e);
  }

  return (
    <div style={{ padding: 20, backgroundColor: '#f0f0f0', margin: 20 }}>
      <h3>🔍 Authentication Debug</h3>
      <p><strong>Token exists:</strong> {token ? "✅ Yes" : "❌ No"}</p>
      <p><strong>User exists:</strong> {user ? "✅ Yes" : "❌ No"}</p>
      {user && (
        <div>
          <p><strong>User role:</strong> {user.role}</p>
          <p><strong>User name:</strong> {user.name}</p>
          <p><strong>User email:</strong> {user.email}</p>
          <p><strong>User verified:</strong> {user.isVerified ? "✅ Yes" : "❌ No"}</p>
        </div>
      )}
      {token && (
        <p><strong>Token preview:</strong> {token.substring(0, 20)}...</p>
      )}
    </div>
  );
}
