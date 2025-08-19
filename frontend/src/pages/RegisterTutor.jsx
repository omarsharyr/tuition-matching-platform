// src/pages/RegisterTutor.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import "../styles/RegisterTutor.css";

export default function RegisterTutor() {
  const navigate = useNavigate();

  // Text fields
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Files
  const [studentId, setStudentId] = useState(null);
  const [educationDocument, setEducationDocument] = useState(null);

  // UI
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setSuccessMsg("");

    if (form.password !== form.confirmPassword) {
      return setErrMsg("Passwords do not match.");
    }
    if (!studentId) return setErrMsg("Please upload your Student ID (or equivalent).");
    if (!educationDocument) return setErrMsg("Please upload your Education Document.");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("phone", form.phone);
      fd.append("password", form.password);
      fd.append("role", "tutor");
      fd.append("studentId", studentId);
      fd.append("educationDocument", educationDocument);

      await axios.post("/api/auth/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg("Registration successful! Please wait for admin verification.");
      setTimeout(() => navigate("/tutor/login"), 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed.";
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rt-wrapper">
      <div className="rt-card">
        <header className="rt-header">
          <h2 className="rt-title">Tutor Registration</h2>
          <p className="rt-subtitle">
            Create an account to browse tuition posts and apply to teach. Admin verification is required before login.
          </p>
        </header>

        {errMsg ? <div className="rt-alert rt-alert-error">{errMsg}</div> : null}
        {successMsg ? <div className="rt-alert rt-alert-success">{successMsg}</div> : null}

        <form className="rt-form" onSubmit={onSubmit}>
          <div className="rt-grid">
            <div className="rt-field">
              <label htmlFor="name" className="rt-label">Full Name</label>
              <input
                id="name"
                name="name"
                className="rt-input"
                type="text"
                placeholder="e.g., Tanvir Ahmed"
                value={form.name}
                onChange={onChange}
                required
              />
            </div>

            <div className="rt-field">
              <label htmlFor="email" className="rt-label">Email Address</label>
              <input
                id="email"
                name="email"
                className="rt-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={onChange}
                required
              />
            </div>

            <div className="rt-field">
              <label htmlFor="phone" className="rt-label">Phone Number</label>
              <input
                id="phone"
                name="phone"
                className="rt-input"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={form.phone}
                onChange={onChange}
                required
              />
            </div>

            <div className="rt-field">
              <label htmlFor="password" className="rt-label">Password</label>
              <input
                id="password"
                name="password"
                className="rt-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                required
                minLength={6}
              />
              <small className="rt-hint">At least 6 characters</small>
            </div>

            <div className="rt-field">
              <label htmlFor="confirmPassword" className="rt-label">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                className="rt-input"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="rt-divider" />

          <div className="rt-upload">
            <div className="rt-field">
              <label className="rt-label">Student ID or Equivalent Credential</label>
              <FileUpload
                onFileSelect={(files) => setStudentId(files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png"
                multiple={false}
                placeholder="Click to upload or drag & drop (PDF, JPG, PNG)"
              />
              <small className="rt-hint">Required for tutor verification</small>
            </div>

            <div className="rt-field">
              <label className="rt-label">Education Document</label>
              <FileUpload
                onFileSelect={(files) => setEducationDocument(files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png"
                multiple={false}
                placeholder="Click to upload or drag & drop (PDF, JPG, PNG)"
              />
              <small className="rt-hint">Certificate or transcript</small>
            </div>
          </div>

          <div className="rt-actions">
            <button className="rt-btn rt-btn-primary" type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
            <span className="rt-login-text">
              Already have an account? <Link to="/tutor/login">Login</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
