// frontend/src/pages/student/StudentApplicants.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";

export default function StudentApplicants() {
  const { postId } = useParams();
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.get(`/student/posts/${postId}/applicants`);
      setList(data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const decide = async (appId, action) => {
    try {
      await api.post(`/student/applications/${appId}/decide`, { action });
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Applicants</h2>
        {err && <div className="alert alert-danger">{err}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {list.map((a) => (
              <div
                key={a._id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 14,
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  {a.tutor?.name || "Tutor"}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  {a.tutor?.email}
                </div>
                <div style={{ marginTop: 8, color: "#374151" }}>
                  {a.message}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span className="badge">{a.status}</span>
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => decide(a._id, "ACCEPTED")}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => decide(a._id, "REJECTED")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {!list.length && (
              <div style={{ color: "#6b7280" }}>No applications yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
