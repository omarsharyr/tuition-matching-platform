import React, { useEffect, useState } from "react";
import DashboardFrame from "../../components/DashboardFrame";
import api from "../../utils/api";
import "../../styles/DashboardLayout.css";

export default function AdminApplications() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const { data } = await api.get("/admin/applications");
      setRows(data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <DashboardFrame role="admin" title="Applications">
      {err && <div className="alert error">{err}</div>}
      <div className="panel">
        <h2 className="panel-title">All Applications</h2>
        {loading ? (
          <div className="skeleton" style={{ height: 200 }} />
        ) : rows.length === 0 ? (
          <div className="empty">No applications found.</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Job</th><th>Tutor</th><th>Student</th><th>Status</th><th>Created</th></tr>
            </thead>
            <tbody>
              {rows.map(a => (
                <tr key={a._id}>
                  <td>{a.job?.title || "-"}</td>
                  <td>{a.tutor?.name || "-"}</td>
                  <td>{a.student?.name || "-"}</td>
                  <td>{a.status}</td>
                  <td>{new Date(a.createdAt || Date.now()).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardFrame>
  );
}
