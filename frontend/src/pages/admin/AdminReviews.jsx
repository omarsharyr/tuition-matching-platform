import React, { useEffect, useState } from "react";
import DashboardFrame from "../../components/DashboardFrame";
import api from "../../utils/api";
import "../../styles/DashboardLayout.css";

export default function AdminReviews() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const { data } = await api.get("/admin/reviews");
      setRows(data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <DashboardFrame role="admin" title="Reviews">
      {err && <div className="alert error">{err}</div>}
      <div className="panel">
        <h2 className="panel-title">Recent Reviews</h2>
        {loading ? (
          <div className="skeleton" style={{ height: 200 }} />
        ) : rows.length === 0 ? (
          <div className="empty">No reviews found.</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Tutor</th><th>Student</th><th>Rating</th><th>Comment</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r._id}>
                  <td>{r.tutor?.name || "-"}</td>
                  <td>{r.student?.name || "-"}</td>
                  <td>{r.rating}</td>
                  <td>{r.comment}</td>
                  <td>
                    <button className="btn danger" onClick={async ()=>{
                      if (!window.confirm("Remove this review?")) return;
                      try { await api.delete(`/admin/reviews/${r._id}`); load(); }
                      catch(e){ alert(e?.response?.data?.message || "Delete failed"); }
                    }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardFrame>
  );
}
