import React, { useEffect, useState } from "react";
import api from "../../utils/api";

export default function AdminPosts() {
  const [rows, setRows] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      // Expecting an admin endpoint; adjust if yours differs:
      const { data } = await api.get("/admin/posts");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load posts.");
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    try {
      setBusyId(id);
      await api.delete(`/admin/posts/${id}`);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete post.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h2 className="ad-title">Posts</h2>
      <p className="ad-sub">Manage all tuition posts.</p>

      {err && <div className="ad-card" style={{borderColor:"#fecaca", color:"#991b1b"}}>{err}</div>}

      <div className="ad-card">
        <table className="ad-table">
          <thead>
            <tr>
              <th>Title</th><th>Subject</th><th>City/Area</th><th>By</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan="5" style={{padding:"16px", color:"#6b7280"}}>No posts.</td></tr>
            ) : rows.map(p => (
              <tr key={p._id}>
                <td>{p.title || p.subject || "—"}</td>
                <td>{p.subject || "—"}</td>
                <td>{[p.city, p.area].filter(Boolean).join(", ") || "—"}</td>
                <td>{p?.student?.name || p?.studentName || "—"}</td>
                <td>
                  <button className="ad-btn danger" disabled={busyId===p._id} onClick={() => remove(p._id)}>
                    {busyId===p._id ? "..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
