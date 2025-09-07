// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import AdminSidebar from "../../components/AdminSidebar";
import "../../styles/AdminLayout.css";
import "./AdminDashboard-modern.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

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
      setErr(""); // Clear previous errors
      try {
        console.log("AdminDashboard - Starting data fetch...");
        
        const [metricsRes, queueRes] = await Promise.all([
          api.get("/admin/dashboard/stats").catch((error) => {
            console.warn("Dashboard stats failed:", error.response?.status, error.response?.data?.message);
            return { data: null };
          }),
          api.get("/admin/verification-queue").catch((error) => {
            console.warn("Verification queue failed:", error.response?.status, error.response?.data?.message);
            return { data: [] };
          })
        ]);

        console.log("AdminDashboard - Metrics response:", metricsRes.data);
        console.log("AdminDashboard - Queue response:", queueRes.data);

        // Handle dashboard stats
        if (metricsRes.data && typeof metricsRes.data === 'object') {
          setKpis(metricsRes.data);
          console.log("AdminDashboard - KPIs updated:", metricsRes.data);
        } else {
          console.warn("AdminDashboard - Invalid metrics data, using defaults");
        }
        
        // Process verification queue data - backend returns array of users
        if (queueRes.data && Array.isArray(queueRes.data)) {
          const tutors = queueRes.data.filter(user => user.role === 'tutor' && user.verificationStatus === 'pending');
          const students = queueRes.data.filter(user => user.role === 'student' && user.verificationStatus === 'pending');
          
          console.log("AdminDashboard - Filtered pending tutors:", tutors.length);
          console.log("AdminDashboard - Filtered pending students:", students.length);
          
          setPending({ tutors, students });
          
          // Update KPIs with actual pending count if not available from stats
          if (!metricsRes.data?.pendingVerification) {
            setKpis(prevKpis => ({
              ...prevKpis,
              pendingVerification: tutors.length + students.length
            }));
          }
          
        } else {
          console.warn("AdminDashboard - Invalid queue data, clearing pending users");
          setPending({ tutors: [], students: [] });
        }
        
        console.log("AdminDashboard - Data fetch completed successfully");
        
      } catch (error) {
        console.error("AdminDashboard - Fetch error:", error);
        setErr(`Failed to load dashboard data: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Auto-refresh every 30 seconds to show new pending users
    const interval = setInterval(() => {
      console.log("AdminDashboard - Auto-refresh triggered");
      fetchData();
    }, 30000);
    
    return () => {
      console.log("AdminDashboard - Cleaning up auto-refresh interval");
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className="admin-main">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="admin-layout">
        <AdminSidebar isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className="admin-main">
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
    <div className="admin-layout">
      <AdminSidebar isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      <div className="admin-main">
        {/* Header */}
        <div className="admin-header">
          <div className="header-left">
            <h1 className="page-title">🖥️ Admin Dashboard</h1>
            <p className="page-subtitle">Platform overview, user management, and system administration</p>
          </div>
        </div>

        <div className="main-content">

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

        {/* DEDICATED VERIFICATION QUEUE SECTION */}
        <div className="verification-queue-section">
          <div className="verification-header">
            <h2 className="verification-title">📋 User Verification Queue</h2>
            <div className="verification-controls">
              <button 
                onClick={() => window.location.reload()} 
                className="refresh-btn"
                title="Refresh verification queue"
              >
                🔄 Refresh
              </button>
              <span className="last-updated">
                Auto-refresh: 30s • Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <div className="verification-content">
            {loading ? (
              <div className="verification-loading">
                <div className="loading-spinner"></div>
                <p>Loading verification queue...</p>
              </div>
            ) : (pending.tutors.length === 0 && pending.students.length === 0) ? (
              <div className="verification-empty">
                <div className="empty-icon">✅</div>
                <h3>All Verifications Complete!</h3>
                <p>No users currently pending verification</p>
                <p className="debug-info">
                  {process.env.NODE_ENV === 'development' && `Debug: Total KPI pending = ${kpis.pendingVerification || 0}`}
                </p>
              </div>
            ) : (
              <div className="verification-grid">
                {/* Pending Tutors */}
                {pending.tutors.length > 0 && (
                  <div className="verification-card tutor-card">
                    <div className="card-header">
                      <div className="card-icon">👨‍🏫</div>
                      <div className="card-title">
                        <h3>Tutors Awaiting Verification</h3>
                        <span className="card-count">{pending.tutors.length} pending</span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="user-preview">
                        {pending.tutors.slice(0, 3).map((tutor, index) => (
                          <div key={tutor._id || index} className="user-item">
                            <span className="user-name">{tutor.name || 'Unknown'}</span>
                            <span className="user-email">{tutor.email}</span>
                          </div>
                        ))}
                        {pending.tutors.length > 3 && (
                          <div className="user-item more">
                            +{pending.tutors.length - 3} more tutors
                          </div>
                        )}
                      </div>
                      <div className="card-actions">
                        <a href="/admin/verification" className="review-btn primary">
                          Review All Tutors
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pending Students */}
                {pending.students.length > 0 && (
                  <div className="verification-card student-card">
                    <div className="card-header">
                      <div className="card-icon">🎓</div>
                      <div className="card-title">
                        <h3>Students Awaiting Verification</h3>
                        <span className="card-count">{pending.students.length} pending</span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="user-preview">
                        {pending.students.slice(0, 3).map((student, index) => (
                          <div key={student._id || index} className="user-item">
                            <span className="user-name">{student.name || 'Unknown'}</span>
                            <span className="user-email">{student.email}</span>
                          </div>
                        ))}
                        {pending.students.length > 3 && (
                          <div className="user-item more">
                            +{pending.students.length - 3} more students
                          </div>
                        )}
                      </div>
                      <div className="card-actions">
                        <a href="/admin/verification" className="review-btn primary">
                          Review All Students
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Debug Information */}
            {process.env.NODE_ENV === 'development' && (
              <div className="debug-panel">
                <h4>🔍 Debug Information</h4>
                <div className="debug-grid">
                  <div className="debug-item">
                    <strong>API Status:</strong> {err ? `Error: ${err}` : 'OK'}
                  </div>
                  <div className="debug-item">
                    <strong>Pending Tutors:</strong> {pending.tutors.length}
                  </div>
                  <div className="debug-item">
                    <strong>Pending Students:</strong> {pending.students.length}
                  </div>
                  <div className="debug-item">
                    <strong>Total KPI:</strong> {kpis.pendingVerification || 0}
                  </div>
                  <div className="debug-item">
                    <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
                  </div>
                  <div className="debug-item">
                    <strong>Last Refresh:</strong> {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}
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
            <div className="action-icon">�</div>
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

          {/* Recent Activity & Pending Users */}
          <div className="activity-section">
            <div className="activity-header">
              <h3 className="activity-title">📋 Pending Verifications & Recent Activity</h3>
              <p className="activity-subtitle">Real-time updates every 30 seconds</p>
            </div>
            <ul className="activity-list">
              {/* Debug information (remove in production) */}
              {process.env.NODE_ENV === 'development' && (
                <li className="activity-item debug-info">
                  <div className="activity-icon">🔍</div>
                  <div className="activity-content">
                    <p className="activity-text">Debug: Tutors={pending.tutors.length}, Students={pending.students.length}</p>
                    <p className="activity-time">Development mode</p>
                  </div>
                </li>
              )}
              
              {/* Pending Tutors */}
              {pending.tutors.length > 0 && (
                <li className="activity-item priority-high">
                  <div className="activity-icon">👨‍🏫</div>
                  <div className="activity-content">
                    <p className="activity-text">
                      <strong>{pending.tutors.length} tutor{pending.tutors.length !== 1 ? 's' : ''}</strong> awaiting verification
                    </p>
                    <p className="activity-time">
                      Requires document review • 
                      <a href="/admin/verification" className="activity-link">Review Now</a>
                    </p>
                  </div>
                </li>
              )}
              
              {/* Pending Students */}
              {pending.students.length > 0 && (
                <li className="activity-item priority-high">
                  <div className="activity-icon">🎓</div>
                  <div className="activity-content">
                    <p className="activity-text">
                      <strong>{pending.students.length} student{pending.students.length !== 1 ? 's' : ''}</strong> awaiting verification
                    </p>
                    <p className="activity-time">
                      Requires document review • 
                      <a href="/admin/verification" className="activity-link">Review Now</a>
                    </p>
                  </div>
                </li>
              )}
              
              {/* All Clear Message */}
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
    </div>
  );
}
