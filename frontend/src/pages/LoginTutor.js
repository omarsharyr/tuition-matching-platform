import React, { useState } from "react";
import api from "../utils/api";
import { useNavigate, Link } from "react-router-dom";
import "../styles/LoginTutor.css";

export default function LoginTutor() {
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
      const res = await api.post("/api/auth/login", {
        email: form.email.trim(),
        password: form.password
      });

      const { token, user } = res.data;

      // Fetch full profile to check verification status
      const me = await api.get("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Save token + user in localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));
      localStorage.setItem("authProfile", JSON.stringify(me.data));

      // Gate by role and verification
      if (user.role !== "tutor") {
        setErrMsg("This login is for Tutor accounts only.");
        localStorage.clear();
        return;
      }

      if (!me.data.isVerified) {
        setInfoMsg("Your account is pending admin verification. You'll get access once approved.");
        return;
      }

      // Success → go to dashboard
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed. Check your credentials.";
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Tutor Login</h2>
      <p>Log in to browse tuition posts and apply (after admin verification).</p>
      
      {errMsg && (
        <div style={{ color: 'red', marginBottom: '10px' }}>{errMsg}</div>
      )}
      {infoMsg && (
        <div style={{ color: 'orange', marginBottom: '10px' }}>{infoMsg}</div>
      )}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer' 
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Don't have an account? <Link to="/tutor/register">Register here</Link>
      </p>
    </div>
  );
}
