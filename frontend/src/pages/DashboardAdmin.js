// frontend/src/pages/DashboardAdmin.js
import React, { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

function SectionTabs({ active, onChange }) {
  const tabs = ["Overview", "Users", "Posts", "Applications"];
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      {tabs.map((t) => (
        <button
          key={t}
          className={`btn ${active === t ? "btn-primary" : ""}`}
          onClick={() => onChange(t)}
          type="button"
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div
      style={{
        padding: 16,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        background: "#fff",
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default function DashboardAdmin() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("authUser") || "{}");
    } catch {
      return {};
    }
  }, []);

  // tabs
  const [tab, setTab] = useState("Overview");

  // Overview stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingTutors: 0,
    pendingStudents: 0,
    openPosts: 0,
    pendingApplications: 0,
  });

  // Users tab
  const [pendingTutors, setPendingTutors] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [usersErr, setUsersErr] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

  // Posts tab
  const [posts, setPosts] = useState([]);
  const [postsErr, setPostsErr] = useState("");
  const [postsLoading, setPostsLoading] = useState(false);

  // Applications tab
  const [apps, setApps] = useState([]);
  const [appsErr, setAppsErr] = useState("");
  const [appsLoading, setAppsLoading] = useState(false);

  // ---------- Loaders ----------
  const loadOverview = async () => {
    try {
      // If you have a single stats endpoint, use it here instead:
      // const { data } = await api.get("/admin/stats");
      // setStats(data);

      // Otherwise we can compute rough stats by calling the same lists:
      const [tutRes, stuRes, postRes, appRes] = await Promise.all([
        api.get("/admin/users/pending?role=tutor"),
        api.get("/admin/users/pending?role=student"),
        api.get("/admin/posts"),
        api.get("/admin/applications/pending"),
      ]);

      setStats({
        totalUsers: (tutRes.data?.length || 0) + (stuRes.data?.length || 0), // pending only (adjust if you want total)
        pendingTutors: tutRes.data?.length || 0,
        pendingStudents: stuRes.data?.length || 0,
        openPosts: (postRes.data || []).filter((p) => p.status === "OPEN")
          .length,
        pendingApplications: appRes.data?.length || 0,
      });
    } catch {
      // silent
    }
  };

  const loadUsers = async () => {
    setUsersErr("");
    setUsersLoading(true);
    try {
      const [tutRes, stuRes] = await Promise.all([
        api.get("/admin/users/pending?role=tutor"),
        api.get("/admin/users/pending?role=student"),
      ]);
      setPendingTutors(tutRes.data || []);
      setPendingStudents(stuRes.data || []);
    } catch (e) {
      setUsersErr(e?.response?.data?.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadPosts = async () => {
    setPostsErr("");
    setPostsLoading(true);
    try {
      const { data } = await api.get("/admin/posts");
      setPosts(data || []);
    } catch (e) {
      setPostsErr(e?.response?.data?.message || "Failed to load posts");
    } finally {
      setPostsLoading(false);
    }
  };

  const loadApps = async () => {
    setAppsErr("");
    setAppsLoading(true);
    try {
      const { data } = await api.get("/admin/applications/pending");
      setApps(data || []);
    } catch (e) {
      setAppsErr(e?.response?.data?.message || "Failed to load applications");
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === "Users") loadUsers();
    if (tab === "Posts") loadPosts();
    if (tab === "Applications") loadApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ---------- Actions ----------
  const verifyUser = async (id) => {
    if (!window.confirm("Verify this user?")) return;
    try {
      await api.post(`/admin/users/${id}/verify`);
      loadUsers();
      loadOverview();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to verify");
    }
  };

  const rejectUser = async (id) => {
    if (!window.confirm("Reject / deactivate this user?")) return;
    try {
      await api.post(`/admin/users/${id}/reject`);
      loadUsers();
      loadOverview();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to reject");
    }
  };

  const viewDocs = async (userId) => {
    try {
      const { data } = await api.get(`/admin/documents?userId=${userId}`);
      if (!data || !data.length) return alert("No documents uploaded.");
      // simple preview: open each url in a new tab (you serve /uploads)
      data.forEach((d) => {
        if (d.url) window.open(d.url, "_blank", "noopener,noreferrer");
      });
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to fetch documents");
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      loadPosts();
      loadOverview();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to delete post");
    }
  };

  const deleteApplication = async (appId) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      await api.delete(`/admin/applications/${appId}`);
      loadApps();
      loadOverview();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to delete application");
    }
  };

  // ---------- Render ----------
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Admin Dashboard</h2>
        <p className="auth-subtitle">Welcome, {user?.name || "Admin"}.</p>

        <SectionTabs active={tab} onChange={setTab} />

        {tab === "Overview" && (
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(5, 1fr)" }}>
            <StatBox label="Total Pending Users" value={stats.totalUsers} />
            <StatBox label="Pending Tutors" value={stats.pendingTutors} />
            <StatBox label="Pending Students" value={stats.pendingStudents} />
            <StatBox label="Open Posts" value={stats.openPosts} />
            <StatBox label="Pending Applications" value={stats.pendingApplications} />
          </div>
        )}

        {tab === "Users" && (
          <>
            {usersErr && <div className="alert alert-danger">{usersErr}</div>}
            {usersLoading ? (
              <div>Loading...</div>
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <h3 style={{ margin: "12px 0 8px" }}>Pending Tutors</h3>
                  <div style={{ display: "grid", gap: 10 }}>
                    {pendingTutors.map((u) => (
                      <div
                        key={u._id}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: 12,
                          padding: 14,
                          background: "#fff",
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{u.name}</div>
                        <div style={{ color: "#6b7280", fontSize: 14 }}>
                          {u.email} • role: {u.role}
                        </div>
                        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                          <button className="btn" onClick={() => viewDocs(u._id)}>
                            View Docs
                          </button>
                          <button className="btn btn-primary" onClick={() => verifyUser(u._id)}>
                            Verify
                          </button>
                          <button className="btn btn-danger" onClick={() => rejectUser(u._id)}>
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                    {!pendingTutors.length && (
                      <div style={{ color: "#6b7280" }}>No pending tutors.</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 style={{ margin: "12px 0 8px" }}>Pending Students</h3>
                  <div style={{ display: "grid", gap: 10 }}>
                    {pendingStudents.map((u) => (
                      <div
                        key={u._id}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: 12,
                          padding: 14,
                          background: "#fff",
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{u.name}</div>
                        <div style={{ color: "#6b7280", fontSize: 14 }}>
                          {u.email} • role: {u.role}
                        </div>
                        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                          <button className="btn" onClick={() => viewDocs(u._id)}>
                            View Docs
                          </button>
                          <button className="btn btn-primary" onClick={() => verifyUser(u._id)}>
                            Verify
                          </button>
                          <button className="btn btn-danger" onClick={() => rejectUser(u._id)}>
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                    {!pendingStudents.length && (
                      <div style={{ color: "#6b7280" }}>No pending students.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "Posts" && (
          <>
            {postsErr && <div className="alert alert-danger">{postsErr}</div>}
            {postsLoading ? (
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
                      {p.expectedPayment} • status: {p.status}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <button className="btn btn-danger" onClick={() => deletePost(p._id)}>
                        Delete Post
                      </button>
                    </div>
                  </div>
                ))}
                {!posts.length && (
                  <div style={{ color: "#6b7280" }}>No posts found.</div>
                )}
              </div>
            )}
          </>
        )}

        {tab === "Applications" && (
          <>
            {appsErr && <div className="alert alert-danger">{appsErr}</div>}
            {appsLoading ? (
              <div>Loading...</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {apps.map((a) => (
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
                      {a.post?.title || "Post"} — {a.tutor?.name || "Tutor"}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: 14 }}>
                      status: {a.status} • {a.tutor?.email}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <button className="btn btn-danger" onClick={() => deleteApplication(a._id)}>
                        Delete Application
                      </button>
                    </div>
                  </div>
                ))}
                {!apps.length && (
                  <div style={{ color: "#6b7280" }}>No pending applications.</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
