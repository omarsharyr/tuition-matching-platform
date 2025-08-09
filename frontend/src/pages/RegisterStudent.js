import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
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
    setLoading(true);

    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        { ...form, role: "student" },
        { headers: { "Content-Type": "application/json" } }
      );

      setSuccessMsg("Registration successful! Please wait for admin verification.");
      setTimeout(() => navigate("/student/login"), 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed.";
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: "16px" }}>
      <h2 style={{ marginBottom: 8 }}>Student / Guardian Registration</h2>
      <p style={{ color: "#666", marginBottom: 16 }}>
        Fill in your details to post tuition jobs (Admin verification required before login).
      </p>

      {errMsg && <div style={{ background: "#fee", color: "#900", padding: 10, borderRadius: 8 }}>{errMsg}</div>}
      {successMsg && <div style={{ background: "#e6ffed", color: "#065f46", padding: 10, borderRadius: 8 }}>{successMsg}</div>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={onChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={onChange} required />
        <input type="tel" name="phone" placeholder="Phone Number" value={form.phone} onChange={onChange} required />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <div style={{ marginTop: 12 }}>
        Already have an account? <Link to="/student/login">Login</Link>
      </div>
    </div>
  );
}
