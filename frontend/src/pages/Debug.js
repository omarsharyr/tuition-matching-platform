// frontend/src/pages/Debug.js
import React from "react";

export default function Debug() {
  const token = localStorage.getItem("token");
  const authToken = localStorage.getItem("authToken");
  const userRaw = localStorage.getItem("user");
  const authUserRaw = localStorage.getItem("authUser");
  
  let user = null;
  let authUser = null;
  
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch (e) {
    console.error("Error parsing user:", e);
  }
  
  try {
    authUser = authUserRaw ? JSON.parse(authUserRaw) : null;
  } catch (e) {
    console.error("Error parsing authUser:", e);
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>LocalStorage Debug</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Tokens:</h3>
        <p><strong>token:</strong> {token ? `${token.substring(0, 50)}...` : 'NOT FOUND'}</p>
        <p><strong>authToken:</strong> {authToken ? `${authToken.substring(0, 50)}...` : 'NOT FOUND'}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>User Objects:</h3>
        <p><strong>user:</strong></p>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {user ? JSON.stringify(user, null, 2) : 'NOT FOUND'}
        </pre>
        
        <p><strong>authUser:</strong></p>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {authUser ? JSON.stringify(authUser, null, 2) : 'NOT FOUND'}
        </pre>
      </div>
      
      <div>
        <h3>All localStorage keys:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(Object.keys(localStorage), null, 2)}
        </pre>
      </div>
    </div>
  );
}
