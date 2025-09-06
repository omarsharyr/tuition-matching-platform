// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { logout } from "../../utils/auth";
import AdminSidebar from "../../components/AdminSidebar";
import "./AdminDashboard-modern.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // auth
  const user = useMemo(() => {
    try { 
      // Try both "user" and "authUser" keys for compatibility
      const userData = localStorage.getItem("user") || localStorage.getItem("authUser");
      return userData ? JSON.parse(userData) : {};
    }
    catch { return {}; }
  }, []);
  const role = String(user?.role || "").toLowerCase();
  useEffect(() => {
    if (role !== "admin") {
      console.log("AdminDashboard: Access denied, role:", role, "user:", user);
      navigate("/forbidden", { replace: true });
    } else {
      console.log("AdminDashboard: Access granted, role:", role);
    }
  }, [role, navigate, user]);

  // state
  const [kpis, setKpis] = useState({ 
    totalUsers: 0, 
    totalStudents: 0, 
    totalTutors: 0, 
    verifiedUsers: 0, 
    pendingVerification: 0, 
    totalJobs: 0, 
    activeJobs: 0 
  });
  const [pending, setPending] = useState({ tutors: [], students: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [metricsRes, queueRes] = await Promise.all([
          api.get("/admin/dashboard/stats").catch(() => ({ data: null })),
          api.get("/admin/verification-queue").catch(() => ({ data: [] })),
        ]);

        if (metricsRes.data) setKpis(metricsRes.data);
        
        // Process verification queue data - backend returns array of users
        if (queueRes.data && Array.isArray(queueRes.data)) {
          const tutors = queueRes.data.filter(user => user.role === 'tutor');
          const students = queueRes.data.filter(user => user.role === 'student');
          setPending({ tutors, students });
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        setErr("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <AdminSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className={`admin-dashboard-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="admin-dashboard-container">
        <AdminSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className={`admin-dashboard-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
          <div className="error-container">
            <h2>Error Loading Dashboard</h2>
            <p>{err}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      <div className={`admin-dashboard-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
        {/* Header */}
        <div className="dashboard-header">
          <h1>🖥️ Admin Dashboard</h1>
          <p>Platform overview, user management, and system administration</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="stats-grid">
          {/* Total Users */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">👥</div>
            </div>
            <div className="stat-value">{kpis.totalUsers || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>

          {/* Students */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">🎓</div>
            </div>
            <div className="stat-value">{kpis.totalStudents || 0}</div>
            <div className="stat-label">Students</div>
          </div>

          {/* Tutors */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">👨‍🏫</div>
            </div>
            <div className="stat-value">{kpis.totalTutors || 0}</div>
            <div className="stat-label">Tutors</div>
          </div>

          {/* Pending Verification */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">⏳</div>
            </div>
            <div className="stat-value">{kpis.pendingVerification || 0}</div>
            <div className="stat-label">Pending Verification</div>
          </div>

          {/* Active Jobs */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">💼</div>
            </div>
            <div className="stat-value">{kpis.activeJobs || 0}</div>
            <div className="stat-label">Active Jobs</div>
          </div>

          {/* Verified Users */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">✅</div>
            </div>
            <div className="stat-value">{kpis.verifiedUsers || 0}</div>
            <div className="stat-label">Verified Users</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <a href="/admin/verification" className="action-card">
            <div className="action-icon">✅</div>
            <div className="action-label">Review Verifications</div>
          </a>
          <a href="/admin/users-management" className="action-card">
            <div className="action-icon">👥</div>
            <div className="action-label">Manage Users</div>
          </a>
          <a href="/admin/jobs-moderation" className="action-card">
            <div className="action-icon">💼</div>
            <div className="action-label">Moderate Jobs</div>
          </a>
          <a href="/admin/reports" className="action-card">
            <div className="action-icon">🚨</div>
            <div className="action-label">Handle Reports</div>
          </a>
          <a href="/admin/analytics" className="action-card">
            <div className="action-icon">📈</div>
            <div className="action-label">View Analytics</div>
          </a>
          <a href="/admin/settings" className="action-card">
            <div className="action-icon">⚙️</div>
            <div className="action-label">System Settings</div>
          </a>
        </div>

        {/* Analytics and Recent Activity */}
        <div className="analytics-section">
          {/* Chart Container */}
          <div className="chart-container">
            <div className="chart-header">
              <h3 className="chart-title">Platform Analytics</h3>
            </div>
            <div className="chart-placeholder">
              📊 Analytics charts will be implemented here
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <div className="activity-header">
              <h3 className="activity-title">Recent Activity</h3>
            </div>
            <ul className="activity-list">
              {pending.tutors.length > 0 && (
                <li className="activity-item">
                  <div className="activity-icon">👨‍🏫</div>
                  <div className="activity-content">
                    <p className="activity-text">{pending.tutors.length} tutors awaiting verification</p>
                    <p className="activity-time">Pending review</p>
                  </div>
                </li>
              )}
              {pending.students.length > 0 && (
                <li className="activity-item">
                  <div className="activity-icon">🎓</div>
                  <div className="activity-content">
                    <p className="activity-text">{pending.students.length} students awaiting verification</p>
                    <p className="activity-time">Pending review</p>
                  </div>
                </li>
              )}
              {pending.tutors.length === 0 && pending.students.length === 0 && (
                <li className="activity-item">
                  <div className="activity-icon">✅</div>
                  <div className="activity-content">
                    <p className="activity-text">All verifications up to date</p>
                    <p className="activity-time">No pending reviews</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
