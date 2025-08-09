import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function LoginStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setInfoMsg("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: form.email.trim(),
        password: form.password
      }, { headers: { "Content-Type": "application/json" } });

      const { token, user } = res.data;

      // fetch full profile to check verification status
      const me = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // store session
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));
      localStorage.setItem("authProfile", JSON.stringify(me.data));

      if (user.role !== "student") {
        setErrMsg("This login is for Student/Guardian accounts only.");
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        localStorage.removeItem("authProfile");
        return;
      }

      if (!me.data.isVerified) {
        setInfoMsg("Your account is pending admin verification. You’ll get access once approved.");
        // optionally clear token if you want to force a fresh login later:
        // localStorage.removeItem("authToken");
        return;
      }

      navigate("/dashboard"); // later: navigate("/student/dashboard")
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed. Check your credentials.";
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: "16px" }}>
      <h2 style={{ marginBottom: 8 }}>Student / Guardian Login</h2>
      <p style={{ color: "#666", marginBottom: 16 }}>
        Log in to post tuition jobs and manage applications (after admin verification).
      </p>

      {errMsg ? (
        <div style={{ background: "#fee", color: "#900", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          {errMsg}
        </div>
      ) : null}

      {infoMsg ? (
        <div style={{ background: "#eef6ff", color: "#174ea6", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          {infoMsg}
        </div>
      ) : null}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={form.email}
          onChange={onChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <div style={{ marginTop: 12 }}>
        Don’t have an account? <Link to="/student/register">Register as Student/Guardian</Link>
      </div>
      <div style={{ marginTop: 6 }}>
        Are you a Tutor? <Link to="/tutor/login">Login here</Link>
      </div>
    </div>
  );
}
