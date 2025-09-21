// frontend/src/pages/student/StudentDashboardNew.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import StudentSidebar from "../../components/StudentSidebar";
import PostWizard from "../../components/PostWizard/PostWizard";
import ChatButton from "../../components/ChatButton";
import useSidebar from "../../hooks/useSidebar";
import "./StudentDashboardNew.css";

export default function StudentDashboardNew() {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isCollapsed, toggleSidebar, closeSidebar } = useSidebar(false);
  const [isPostWizardOpen, setIsPostWizardOpen] = useState(false);

  // auth
  const user = useMemo(() => {
    try { 
      const userData = localStorage.getItem("user") || localStorage.getItem("authUser");
      return userData ? JSON.parse(userData) : {};
    }
    catch { return {}; }
  }, []);
  
  // Dashboard data
  const [kpis, setKpis] = useState({
    activePosts: 0,
    applicantsWaiting: 0,
    openChats: 0,
    fulfilledHires: 0
  });
  
  const [activityFeed, setActivityFeed] = useState([]);
  const [recommendations] = useState([]);

  // Load dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch KPIs
      const kpisRes = await api.get("/student/kpis");
      setKpis(kpisRes.data || {
        activePosts: 0,
        applicantsWaiting: 0,
        openChats: 0,
        fulfilledHires: 0
      });

      // Fetch activity feed
      const activityRes = await api.get("/student/activity?limit=20");
      setActivityFeed(activityRes.data?.activities || []);

      // Fetch job recommendations (optional)
      try {
        const recsRes = await api.get("/student/recommendations?limit=6");
        setRecommendations(recsRes.data?.recommendations || []);
      } catch (err) {
        // Recommendations are optional, don't fail the whole dashboard
        console.log("Recommendations not available:", err.message);
      }

    } catch (error) {
      console.error("❌ Dashboard fetch error:", error);
      setError("Failed to load dashboard data. Please check your connection and try again.");
      
      // Set empty state on error
      setKpis({
        activePosts: 0,
        applicantsWaiting: 0,
        openChats: 0,
        fulfilledHires: 0
      });
      setActivityFeed([]);
    } finally {
      setLoading(false);
    }
  };

  // Create post function
  const handleCreatePost = async (postData) => {
    try {
      const response = await api.post("/student/posts", postData);
      console.log("✅ Post created successfully:", response.data);
      
      // Refresh dashboard data
      await fetchDashboardData();
      
      return response.data;
    } catch (error) {
      console.error("❌ Error creating post:", error);
      throw error;
    }
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case 'post_job':
        setIsPostWizardOpen(true);
        break;
      case 'view_posts':
        navigate('/s/jobs');
        break;
      case 'open_messages':
        navigate('/s/messages');
        break;
      default:
        break;
    }
  };

  // Activity item click handler
  const handleActivityClick = (activity) => {
    switch (activity.type) {
      case 'new_application':
        navigate(`/s/applications?job=${activity.jobId}`);
        break;
      case 'tutor_shortlisted':
        navigate(`/s/applications/${activity.applicationId}`);
        break;
      case 'session_proposed':
        navigate(`/s/schedule?session=${activity.sessionId}`);
        break;
      case 'new_message':
        navigate(`/s/messages/${activity.chatId}`);
        break;
      case 'job_fulfilled':
        navigate(`/s/jobs/${activity.jobId}`);
        break;
      default:
        break;
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="dashboard-container">
        <StudentSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
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
        <StudentSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <div className="dashboard-content">
          <div className="dashboard-error">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button onClick={fetchDashboardData} className="btn-retry">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <StudentSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      
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
          <h1>Welcome back, {user.name || 'Student'}!</h1>
          <div className="header-actions">
            <button 
              className="btn-primary"
              onClick={() => handleQuickAction('post_job')}
            >
              📝 Post a Job
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          {/* Left Panel - KPIs and Quick Actions */}
          <div className="dashboard-left">
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card" onClick={() => navigate('/s/jobs?status=active,interviewing')}>
                <div className="kpi-icon">📋</div>
                <div className="kpi-content">
                  <div className="kpi-value">{kpis.activePosts}</div>
                  <div className="kpi-label">Active Posts</div>
                  <div className="kpi-sublabel">Active + Interviewing</div>
                </div>
              </div>

              <div className="kpi-card" onClick={() => navigate('/s/applications?status=submitted')}>
                <div className="kpi-icon">👥</div>
                <div className="kpi-content">
                  <div className="kpi-value">{kpis.applicantsWaiting}</div>
                  <div className="kpi-label">Applicants Waiting</div>
                  <div className="kpi-sublabel">New applications</div>
                </div>
              </div>

              <div className="kpi-card" onClick={() => navigate('/s/messages')}>
                <div className="kpi-icon">💬</div>
                <div className="kpi-content">
                  <div className="kpi-value">{kpis.openChats}</div>
                  <div className="kpi-label">Open Chats</div>
                  <div className="kpi-sublabel">Interview + Full</div>
                </div>
              </div>

              <div className="kpi-card" onClick={() => navigate('/s/jobs?status=fulfilled')}>
                <div className="kpi-icon">✅</div>
                <div className="kpi-content">
                  <div className="kpi-value">{kpis.fulfilledHires}</div>
                  <div className="kpi-label">Fulfilled Hires</div>
                  <div className="kpi-sublabel">Completed jobs</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions-list">
                <button 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('post_job')}
                >
                  <span className="action-icon">📝</span>
                  <span className="action-text">Post a Job</span>
                </button>
                <button 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('view_posts')}
                >
                  <span className="action-icon">📋</span>
                  <span className="action-text">View My Posts</span>
                </button>
                <button 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('open_messages')}
                >
                  <span className="action-icon">💬</span>
                  <span className="action-text">Open Messages</span>
                </button>
              </div>
            </div>

            {/* First-time user guidance */}
            {kpis.activePosts === 0 && activityFeed.length === 0 && (
              <div className="first-time-card">
                <div className="welcome-icon">🎯</div>
                <h3>Welcome to your dashboard, {user.name || 'Student'}!</h3>
                <p>Get started by posting your first job to find qualified tutors.</p>
                <button 
                  className="btn-primary"
                  onClick={() => setIsPostWizardOpen(true)}
                >
                  Create Your First Post
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
                  <p className="empty-subtitle">Activity will appear here as tutors apply to your posts</p>
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
                        {activity.type === 'new_application' && '👤'}
                        {activity.type === 'tutor_shortlisted' && '⭐'}
                        {activity.type === 'session_proposed' && '📅'}
                        {activity.type === 'new_message' && '💬'}
                        {activity.type === 'job_fulfilled' && '✅'}
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

      {/* Post Creation Wizard */}
      <PostWizard
        isOpen={isPostWizardOpen}
        onClose={() => setIsPostWizardOpen(false)}
        onSubmit={handleCreatePost}
      />

      {/* Chat Button */}
      <ChatButton isStudent={true} />
    </div>
  );
}
