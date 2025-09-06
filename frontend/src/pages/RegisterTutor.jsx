import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";
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
    gender: "",
  });

  // Files: studentId = single File, educationDocuments = File[]
  const [studentId, setStudentId] = useState(null);
  const [educationDocuments, setEducationDocuments] = useState([]);

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

    // basic validations
    if (form.password !== form.confirmPassword) {
      return setErrMsg("Passwords do not match.");
    }
    if (!form.gender) {
      return setErrMsg("Please select a gender.");
    }
    if (!studentId) return setErrMsg("Please upload your Student ID (required).");
    if (!educationDocuments.length) {
      return setErrMsg("Please upload at least one Education Document.");
    }

    try {
      setLoading(true);

      // Build multipart body compatible with backend multer.fields([
      //   { name: 'studentId', maxCount: 1 },
      //   { name: 'educationDocument', maxCount: 10 }
      // ])
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("phone", form.phone.trim());
      fd.append("password", form.password);
      fd.append("gender", form.gender);
      fd.append("role", "tutor"); // <<< IMPORTANT

      // Single Student ID
      fd.append("studentId", studentId);

      // Multiple Education Documents (same field repeated)
      educationDocuments.forEach((file) => {
        fd.append("educationDocument", file);
      });

      // POST to /api/auth/register via axios instance
      await api.post("/auth/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg("Registration successful! Please wait for admin verification.");
      // Optional: clear inputs (FileUpload handles its own state; no need to force reset)
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      setStudentId(null);
      setEducationDocuments([]);

      // Redirect to tutor login
      setTimeout(() => navigate("/tutor/login"), 1500);
    } catch (err) {
      // capture backend message (e.g., enum validation, missing files, duplicate email)
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed.";
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar showAuthButtons={false} />
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
              <label htmlFor="gender" className="rt-label">Gender</label>
              <select
                id="gender"
                name="gender"
                className="rt-input"
                value={form.gender}
                onChange={onChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
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
            {/* Student ID: single */}
            <div className="rt-field">
              <label className="rt-label">Student ID or Equivalent Credential</label>
              <FileUpload
                multiple={false}
                accept=".pdf,.jpg,.jpeg,.png"
                placeholder="Click to upload or drag & drop (PDF, JPG, PNG)"
                onFileSelect={(files) => setStudentId(files?.[0] || null)}
              />
              <small className="rt-hint">Required for tutor verification</small>
            </div>

            {/* Education Documents: multiple */}
            <div className="rt-field">
              <label className="rt-label">Education Document(s)</label>
              <FileUpload
                multiple={true}
                accept=".pdf,.jpg,.jpeg,.png"
                placeholder="Click to upload or drag & drop multiple files (PDF, JPG, PNG)"
                onFileSelect={(files) => setEducationDocuments(files || [])}
              />
              <small className="rt-hint">Upload one or more certificates/transcripts</small>
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
    </>
  );
}
