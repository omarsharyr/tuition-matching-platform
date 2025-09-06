// frontend/src/components/PrivateRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function PrivateRoute({ role, children }) {
  const location = useLocation();

  // Get token and user from localStorage
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  
  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch (e) {
    console.error("Error parsing user data:", e);
    user = null;
  }

  // Not logged in - redirect to landing
  if (!token || !user) {
    console.log("❌ No authentication - redirecting to home", { token: !!token, user: !!user, path: location.pathname });
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If no role requirement, allow access
  if (!role) {
    return children;
  }

  // Check role match
  const userRole = String(user.role || "").toLowerCase().trim();
  const requiredRoles = Array.isArray(role) ? role.map(r => String(r).toLowerCase().trim()) : [String(role).toLowerCase().trim()];
  
  const hasAccess = requiredRoles.includes(userRole);
  
  console.log("🔍 Role check DETAILED:", {
    path: location.pathname,
    userRole: `"${userRole}"`,
    requiredRole: `"${role}"`,
    requiredRoles: requiredRoles.map(r => `"${r}"`),
    hasAccess: hasAccess,
    userRoleLength: userRole.length,
    requiredRoleLength: String(role).length,
    userRoleCharCodes: userRole.split('').map(c => c.charCodeAt(0)),
    requiredRoleCharCodes: String(role).split('').map(c => c.charCodeAt(0))
  });

  if (!hasAccess) {
    console.log("❌ Access denied - redirecting to forbidden");
    return <Navigate to="/forbidden" replace />;
  }

  // Access granted - render the children
  return children;
}
