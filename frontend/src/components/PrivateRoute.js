import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}
