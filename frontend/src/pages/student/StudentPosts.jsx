// frontend/src/pages/student/StudentPosts.jsx
import React, { useEffect, useState } from "react";
import api from "../../utils/api";

export default function StudentPosts() {
  const [posts, setPosts] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.get("/student/posts");
      setPosts(data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">My Tuition Posts</h2>
        <p className="auth-subtitle">Create and manage your tuition jobs.</p>

        {err && <div className="alert alert-danger">{err}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {posts.map((p) => (
              <div
                key={p._id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 14,
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 700 }}>{p.title}</div>
                <div style={{ color: "#6b7280", fontSize: 14 }}>
                  {p.classLevel} • {p.location} • {p.subjects?.join(", ")} • ৳
                  {p.expectedPayment}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span className="badge">{p.status}</span>
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button
                    className="btn"
                    onClick={() =>
                      (window.location.href = `/student/applicants/${p._id}`)
                    }
                  >
                    View Applicants
                  </button>
                  <button
                    className="btn"
                    onClick={() =>
                      (window.location.href = `/student/post/edit/${p._id}`)
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={async () => {
                      if (!window.confirm("Delete this post?")) return;
                      try {
                        await api.delete(`/student/posts/${p._id}`);
                        load();
                      } catch (e) {
                        alert(
                          e?.response?.data?.message || "Delete failed"
                        );
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!posts.length && (
              <div style={{ color: "#6b7280" }}>No posts yet.</div>
            )}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <button
            className="btn btn-primary"
            onClick={() => (window.location.href = "/student/post/new")}
          >
            Create New Post
          </button>
        </div>
      </div>
    </div>
  );
}
