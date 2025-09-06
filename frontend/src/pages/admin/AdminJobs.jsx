import React, { useEffect, useState, useCallback } from "react";
import DashboardFrame from "../../components/DashboardFrame";
import api from "../../utils/api";
import "../../styles/DashboardLayout.css";

export default function AdminJobs() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const { data } = await api.get("/admin/jobs", { params: { status } });
      setRows(data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  return (
    <DashboardFrame role="admin" title="Jobs">
      {err && <div className="alert error">{err}</div>}

      <div className="panel">
        <div className="toolbar">
          <h2 className="panel-title">All Jobs</h2>
          <div className="filters">
            <select className="select" value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
            <button className="btn" onClick={load}>Refresh</button>
          </div>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 200 }} />
        ) : rows.length === 0 ? (
          <div className="empty">No jobs found.</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Title</th><th>Student</th><th>Location</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.map(j => (
                <tr key={j._id}>
                  <td>{j.title || "-"}</td>
                  <td>{j.student?.name || "-"}</td>
                  <td>{j.location || "-"}</td>
                  <td><span className="badge">{j.status}</span></td>
                  <td>
                    <button className="btn danger" onClick={async ()=>{
                      if (!window.confirm("Delete this job?")) return;
                      try { await api.delete(`/admin/jobs/${j._id}`); load(); }
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
