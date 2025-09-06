import React, { useEffect, useState, useCallback } from "react";
import DashboardFrame from "../../components/DashboardFrame";
import api from "../../utils/api";
import "../../styles/DashboardLayout.css";

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ role: "", verificationStatus: "" });

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const { data } = await api.get("/admin/users", { params: filters });
      // Handle the API response structure: { users: [...], pagination: {...} }
      setRows(data?.users || []);
      setPagination(data?.pagination || { current: 1, pages: 1, total: 0 });
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load users.");
      setRows([]); // Ensure rows is always an array
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  return (
    <DashboardFrame role="admin" title="Users">
      {err && <div className="alert error">{err}</div>}

      <div className="panel">
        <div className="toolbar">
          <h2 className="panel-title">All Users ({pagination.total})</h2>
          <div className="filters">
            <select className="select" value={filters.role} onChange={(e)=>setFilters(f=>({...f, role:e.target.value}))}>
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
              <option value="admin">Admin</option>
            </select>
            <select className="select" value={filters.verificationStatus} onChange={(e)=>setFilters(f=>({...f, verificationStatus:e.target.value}))}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="btn" onClick={load}>Refresh</button>
          </div>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 200 }} />
        ) : !Array.isArray(rows) || rows.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
            No users found.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Verified</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                  <td>
                    <span className={`badge ${
                      u.verificationStatus === 'verified' ? 'green' : 
                      u.verificationStatus === 'rejected' ? '' : 'blue'
                    }`}>
                      {u.verificationStatus || 'pending'}
                    </span>
                  </td>
                  <td>{u.verificationStatus === 'verified' ? "✓" : "✗"}</td>
                  <td>
                    <button className="btn danger" onClick={async ()=>{
                      if (!window.confirm(`Delete user "${u.name}"?`)) return;
                      try { 
                        await api.delete(`/admin/users/${u._id}`); 
                        load(); 
                      } catch(e){ 
                        alert(e?.response?.data?.message || "Delete failed"); 
                      }
                    }} style={{ fontSize: '12px', padding: '4px 8px' }}>
                      Delete
                    </button>
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
