// frontend/src/pages/LoginAdmin.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import "../styles/AuthForms.css";

export default function LoginAdmin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    email: "admin@tuition.local", // Pre-filled for easy testing
    password: "Admin123!" 
  });
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrMsg(""); 
    setLoading(true);
    
    try {
      console.log("Admin attempting login with:", { 
        email: (form.email || "").trim(), 
        password: form.password ? "***" : "empty"
      });
      
      const { data } = await api.post("/auth/login", {
        email: (form.email || "").trim(),
        password: form.password,
      });
      
      console.log("Admin login response:", data);
      const { token, user } = data;

      // Clear any existing data
      localStorage.clear();

      // Store the token and user data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Stored in localStorage:", {
        token: token ? "STORED" : "NOT STORED",
        user: user,
        retrievedUser: JSON.parse(localStorage.getItem("user") || "null")
      });

      // Check the user's role and redirect accordingly
      const role = String(user?.role || "").toLowerCase();
      console.log("User role detected:", role);
      
      if (role === "admin") {
        console.log("Redirecting to admin dashboard...");
        navigate("/admin/dashboard", { replace: true });
      } else {
        setErrMsg(`Invalid role: ${role}. Expected admin role.`);
      }
    } catch (err) {
      console.error("Admin login error:", err);
      const msg = err.response?.data?.message || "Login failed";
      setErrMsg(msg);
      
      // Handle verification status
      if (err.response?.status === 423) {
        const status = err.response?.data?.verificationStatus;
        if (status === "pending") {
          setErrMsg("Your account is awaiting admin verification.");
        } else if (status === "rejected") {
          setErrMsg("Your account verification was rejected. Please contact support.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar showAuthButtons={false} />
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Admin Login</h2>
          <p className="auth-subtitle">Access the admin dashboard to manage users, jobs, and platform operations.</p>

        {errMsg && (
          <div className="auth-error">
            {errMsg}
          </div>
        )}

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-actions">
            <button 
              className="btn-primary" 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', marginBottom: '15px' }}
            >
              {loading ? "Logging in..." : "Login as Admin"}
            </button>
            <div className="auth-footer">
              Regular user? <Link to="/login/student">Student Login</Link> | <Link to="/login/tutor">Tutor Login</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
