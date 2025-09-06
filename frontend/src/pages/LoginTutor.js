import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import "../styles/AuthForms.css";

export default function LoginTutor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(null);

  // Handle form changes
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    setErrMsg(""); 
    setVerificationStatus(null);
    setLoading(true);

    try {
      // Login API call
      const { data } = await api.post("/auth/login", {
        email: (form.email || "").trim(),
        password: form.password,
      });

      const { token, user } = data;

      // Store token and user data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Check the user's role - only allow tutors to login via tutor page
      const role = String(user?.role || "").toLowerCase();
      if (role !== "tutor") {
        setErrMsg("Access denied. This login page is only for tutors. Please use the correct login page for your role.");
        setLoading(false);
        return;
      }
      
      // Redirect to tutor dashboard
      navigate("/tutor/dashboard", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const responseData = err?.response?.data;
      
      if (status === 423) {
        // Verification required
        setVerificationStatus(responseData?.verificationStatus || "pending");
        setErrMsg(responseData?.message || "Account verification required.");
      } else {
        setErrMsg(responseData?.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getVerificationMessage = (status) => {
    switch (status) {
      case 'pending':
        return "Your account is awaiting admin verification. Please wait for approval or contact support if this is taking longer than expected.";
      case 'rejected':
        return "Your account verification was rejected. Please contact support or re-register with valid documents.";
      default:
        return errMsg;
    }
  };

  return (
    <>
      <Navbar showAuthButtons={false} />
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Tutor Login</h2>
          <p className="auth-subtitle">
            Sign in to browse tuition jobs and track your applications.
          </p>

        {errMsg && (
          <div 
            className="auth-error" 
            style={verificationStatus ? { 
              backgroundColor: `${getVerificationStatusColor(verificationStatus)}20`,
              borderColor: getVerificationStatusColor(verificationStatus),
              color: getVerificationStatusColor(verificationStatus)
            } : {}}
          >
            {getVerificationMessage(verificationStatus)}
          </div>
        )}

        {verificationStatus && (
          <div className="auth-info">
            <h4>What happens next?</h4>
            <ul>
              <li>Admin will review your submitted documents</li>
              <li>You'll receive email notification once verified</li>
              <li>After verification, you can browse jobs and apply</li>
            </ul>
            {verificationStatus === 'rejected' && (
              <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
                Need help? <a href="mailto:support@teachconnect.com">Contact Support</a>
              </p>
            )}
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
              placeholder="you@example.com"
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
              {loading ? "Logging in..." : "Login"}
            </button>
            <div className="auth-footer">
              New here? <Link to="/register/tutor">Register as Tutor</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
