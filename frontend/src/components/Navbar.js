// frontend/src/components/Navbar.js
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css"; // ✅ correct single side-effect CSS import

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // read auth user (if you still want to conditionally show a Logout button)
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("authUser") || "null");
  } catch {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("authProfile");
    navigate("/", { replace: true });
  };

  // minimal, clean navbar without Login/Register links
  return (
    <nav className="navbar">
      <div className="container">
        {/* Brand always routes home */}
        <Link to="/" className="navbar-brand">Tuition Match</Link>

        {/* Right side: optional role-aware shortcuts (no login/register here) */}
        <div className="nav-links">
          {/* Show role-aware Dashboard shortcut if logged in */}
          {user?.role === "admin" && (
            <Link
              to="/dashboard/admin"
              className={`nav-link ${pathname.startsWith("/dashboard/admin") ? "active" : ""}`}
            >
              Admin
            </Link>
          )}
          {user?.role === "student" && (
            <Link
              to="/student/dashboard"
              className={`nav-link ${pathname.startsWith("/student") ? "active" : ""}`}
            >
              Student
            </Link>
          )}
          {user?.role === "tutor" && (
            <Link
              to="/tutor/dashboard"
              className={`nav-link ${pathname.startsWith("/tutor") ? "active" : ""}`}
            >
              Tutor
            </Link>
          )}

          {/* Logout only when logged in */}
          {user ? (
            <button type="button" className="nav-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
