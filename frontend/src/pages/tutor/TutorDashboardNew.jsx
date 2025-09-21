// frontend/src/pages/tutor/TutorDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import TutorSidebar from "../../components/TutorSidebar";
import ChatButton from "../../components/ChatButton";
import useSidebar from "../../hooks/useSidebar";
import "./TutorDashboardNew.css";

export default function TutorDashboard() {
  const navigate = useNavigate();
  const { isCollapsed, toggleSidebar, closeSidebar } = useSidebar(true);
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Dashboard data
  const [kpis, setKpis] = useState({ 
    eligibleJobs: 0, 
    appliedJobs: 0, 
    shortlistedJobs: 0, 
    hiredJobs: 0 
  });
  
  const [activityFeed, setActivityFeed] = useState([]);
  const [recentJobs] = useState([]);
  const [myApplications] = useState([]);

  // auth
  const user = useMemo(() => {
    try { 
      const userData = localStorage.getItem("user") || localStorage.getItem("authUser");
      return userData ? JSON.parse(userData) : {};
    }
    catch { return {}; }
  }, []);
  const role = String(user?.role || "").toLowerCase();
  
  useEffect(() => {
    if (role !== "tutor") {
      console.log("TutorDashboard: Access denied, role:", role);
      navigate("/forbidden", { replace: true });
    }
  }, [role, navigate, user]);

  // Load dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch dashboard stats
      const statsRes = await api.get("/tutor/dashboard/stats");
      console.log("✅ Dashboard stats API response:", statsRes.status, statsRes.data);
      
      // Fetch jobs
      const jobsRes = await api.get("/tutor/jobs");
      console.log("✅ Jobs API response:", jobsRes.status, jobsRes.data?.posts?.length || 0, "jobs");
      const jobs = jobsRes.data?.posts || [];
      
      // Fetch applications
      const applicationsRes = await api.get("/tutor/applications");
      console.log("✅ Applications API response:", applicationsRes.status, applicationsRes.data?.applications?.length || 0, "applications");
      const applications = applicationsRes.data?.applications || [];
      
      // Fetch activity feed (simulate based on applications and jobs)
      const activity = [];
      applications.slice(0, 5).forEach(app => {
        activity.push({
          id: app._id,
          type: 'application_update',
          title: `Application ${app.status}`,
          description: `Your application for ${app.jobTitle || 'a position'} was ${app.status}`,
          createdAt: app.updatedAt || app.createdAt,
          jobId: app.jobId
        });
      });

      setActivityFeed(activity);

      // Calculate KPIs from real data
      const eligibleJobs = jobs.filter(job => job.status === 'open').length;
      const appliedJobs = applications.filter(app => app.status === 'applied').length;
      const shortlistedJobs = applications.filter(app => app.status === 'shortlisted').length;
      const hiredJobs = applications.filter(app => app.status === 'accepted').length;

      setKpis({
        eligibleJobs: eligibleJobs || statsRes.data?.eligibleJobs || 0,
        appliedJobs: appliedJobs || statsRes.data?.appliedJobs || 0,
        shortlistedJobs: shortlistedJobs || statsRes.data?.shortlistedJobs || 0,
        hiredJobs: hiredJobs || statsRes.data?.hiredJobs || 0
      });

      // setRecentJobs(jobs);
      // setMyApplications(applications);
      console.log("Recent jobs:", jobs);
      console.log("My applications:", applications);

    } catch (error) {
      console.error("❌ Tutor dashboard fetch error:", error);
      setError("Failed to load dashboard data. Please check your connection and try again.");
      
      // Set empty state on error
      setKpis({
        eligibleJobs: 0,
        appliedJobs: 0,
        shortlistedJobs: 0,
        hiredJobs: 0
      });
      // setRecentJobs([]);
      // setMyApplications([]);
      setActivityFeed([]);
    } finally {
      setLoading(false);
    }
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case 'browse_jobs':
        navigate('/tutor/jobs');
        break;
      case 'view_applications':
        navigate('/tutor/applications');
        break;
      case 'open_messages':
        navigate('/tutor/messages');
        break;
      case 'view_schedule':
        navigate('/tutor/schedule');
        break;
      default:
        break;
    }
  };

  // Activity item click handler
  const handleActivityClick = (activity) => {
    switch (activity.type) {
      case 'application_update':
        navigate(`/tutor/applications`);
        break;
      case 'new_message':
        navigate(`/tutor/messages`);
        break;
      case 'schedule_update':
        navigate(`/tutor/schedule`);
        break;
      default:
        break;
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="dashboard-container">
        <TutorSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <div className="dashboard-content">
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-container">
        <TutorSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <div className="dashboard-content">
          <div className="dashboard-error">
            <div className="error-icon">⚠️</div>
            <h3>Unable to load dashboard</h3>
            <p>{error}</p>
            <button 
              className="btn-primary"
              onClick={fetchDashboardData}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <TutorSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="mobile-overlay"
          onClick={closeSidebar}
        />
      )}

      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
          >
            ☰
          </button>
          
          <h1>Welcome back, {user.name || 'Tutor'}!</h1>
          
          <div className="header-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/tutor/jobs')}
            >
              <span>🔍</span>
              Browse Jobs
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          {/* Left Panel - KPIs and Quick Actions */}
          <div className="dashboard-left">
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card" onClick={() => navigate('/tutor/jobs')}>
                <div className="kpi-icon">💼</div>
                <div className="kpi-content">
                  <div className="kpi-value">{kpis.eligibleJobs}</div>
                  <div className="kpi-label">Eligible Jobs</div>
                  <div className="kpi-sublabel">Available positions</div>
                </div>
              </div>

              <div className="kpi-card" onClick={() => navigate('/tutor/applications')}>
                <div className="kpi-icon">📋</div>
                <div className="kpi-content">
                  <div className="kpi-value">{kpis.appliedJobs}</div>
                  <div className="kpi-label">Applied Jobs</div>
                  <div className="kpi-sublabel">Pending applications</div>
                </div>
              </div>

              <div className="kpi-card" onClick={() => navigate('/tutor/applications?status=shortlisted')}>
                <div className="kpi-icon">⭐</div>
                <div className="kpi-content">
                  <div className="kpi-value">{kpis.shortlistedJobs}</div>
                  <div className="kpi-label">Shortlisted</div>
                  <div className="kpi-sublabel">Interview stage</div>
                </div>
              </div>

              <div className="kpi-card" onClick={() => navigate('/tutor/students')}>
                <div className="kpi-icon">✅</div>
                <div className="kpi-content">
                  <div className="kpi-value">{kpis.hiredJobs}</div>
                  <div className="kpi-label">Active Students</div>
                  <div className="kpi-sublabel">Current teaching</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions-list">
                <button 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('browse_jobs')}
                >
                  <span className="action-icon">🔍</span>
                  Browse Available Jobs
                </button>
                
                <button 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('view_applications')}
                >
                  <span className="action-icon">📋</span>
                  View My Applications
                </button>
                
                <button 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('open_messages')}
                >
                  <span className="action-icon">💬</span>
                  Open Messages
                </button>
                
                <button 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('view_schedule')}
                >
                  <span className="action-icon">📅</span>
                  View Schedule
                </button>
              </div>
            </div>

            {/* First Time User Guidance */}
            {kpis.appliedJobs === 0 && (
              <div className="first-time-card">
                <h3>🚀 Get Started as a Tutor</h3>
                <p>Ready to begin your teaching journey? Start by browsing available positions and applying to jobs that match your expertise.</p>
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/tutor/jobs')}
                >
                  Browse Jobs Now
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Activity Feed */}
          <div className="dashboard-right">
            <div className="activity-feed-card">
              <h3>Recent Activity</h3>
              
              {activityFeed.length === 0 ? (
                <div className="activity-empty">
                  <div className="empty-icon">📱</div>
                  <p>No recent activity</p>
                  <p className="empty-subtitle">Activity will appear here as you apply to jobs and interact with students</p>
                </div>
              ) : (
                <div className="activity-list">
                  {activityFeed.map((activity, index) => (
                    <div 
                      key={activity.id || index}
                      className="activity-item"
                      onClick={() => handleActivityClick(activity)}
                    >
                      <div className="activity-icon">
                        {activity.type === 'application_update' && '📋'}
                        {activity.type === 'new_message' && '💬'}
                        {activity.type === 'schedule_update' && '📅'}
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">{activity.title}</div>
                        <div className="activity-description">{activity.description}</div>
                        <div className="activity-time">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <ChatButton isStudent={false} />
    </div>
  );
}
