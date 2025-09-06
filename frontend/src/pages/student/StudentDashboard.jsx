// frontend/src/pages/student/StudentDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { logout } from "../../utils/auth";
import StudentSidebar from "../../components/StudentSidebar";
import PostWizard from "../../components/PostWizard/PostWizard";
import ApplicationManager from "../../components/ApplicationManager";
import useSidebar from "../../hooks/useSidebar";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const navigate = useNavigate();
  
  // Sidebar state
  const { isCollapsed, toggleSidebar, closeSidebar } = useSidebar(false);

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
    if (role !== "student") {
      console.log("StudentDashboard: Access denied, role:", role);
      navigate("/forbidden", { replace: true });
    }
  }, [role, navigate, user]);

  // state
  const [kpis, setKpis] = useState({ 
    activeJobs: 0, 
    totalApplicants: 0, 
    activeChats: 0, 
    fulfilledJobs: 0 
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [isPostWizardOpen, setIsPostWizardOpen] = useState(false);
  const [applicationManagerOpen, setApplicationManagerOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErr("");
      try {
        console.log("🔍 Starting dashboard data fetch...");
        
        // First fetch posts
        const jobsRes = await api.get("/student/posts");
        console.log("✅ Posts API response:", jobsRes.status, jobsRes.data?.posts?.length || 0, "posts");
        
        const jobs = jobsRes.data?.posts || [];
        
        // Then fetch applications for all posts
        console.log("🔍 Getting applications for", jobs.length, "posts");
        let applications = [];
        if (jobs.length > 0) {
          const applicationsPromises = jobs.map(post => 
            api.get(`/student/posts/${post._id}/applications`).catch(() => ({ data: [] }))
          );
          const allApplicationsRes = await Promise.all(applicationsPromises);
          applications = allApplicationsRes.flatMap(res => res.data || []);
          console.log("✅ Applications fetched:", applications.length, "total applications");
        }
        
        // Finally fetch dashboard stats
        const statsRes = await api.get("/student/dashboard/stats");
        console.log("✅ Dashboard stats API response:", statsRes.status, statsRes.data);
        const stats = statsRes.data || {};

        // Calculate KPIs from real data
        const activeJobs = jobs.filter(job => job.status === 'active').length;
        const totalApplicants = applications.length;
        const activeChats = applications.filter(app => 
          app.status === 'shortlisted' || app.status === 'accepted'
        ).length;
        const fulfilledJobs = jobs.filter(job => job.status === 'fulfilled').length;

        setKpis({
          activeJobs: activeJobs || stats.activeJobs || 0,
          totalApplicants: totalApplicants || stats.totalApplicants || 0,
          activeChats: activeChats || stats.activeChats || 0,
          fulfilledJobs: fulfilledJobs || stats.fulfilledJobs || 0
        });

        setRecentJobs(jobs);
        setRecentApplications(applications);

      } catch (error) {
        console.error("❌ Dashboard fetch error:", error);
        setErr("Failed to load dashboard data. Please check your connection and try again.");
        
        // Set empty state on error
        setKpis({
          activeJobs: 0,
          totalApplicants: 0,
          activeChats: 0,
          fulfilledJobs: 0
        });
        setRecentJobs([]);
        setRecentApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create post function
  const handleCreatePost = async (postData) => {
    try {
      const response = await api.post("/student/posts", postData);
      console.log("✅ Post created successfully:", response.data);
      
      // Refresh the posts list
      const jobsRes = await api.get("/student/posts");
      const jobs = jobsRes.data?.posts || [];
      setRecentJobs(jobs);
      
      // Update KPIs
      const activeJobs = jobs.filter(job => job.status === 'active').length;
      setKpis(prev => ({ ...prev, activeJobs }));
      
      return response.data;
    } catch (error) {
      console.error("❌ Error creating post:", error);
      throw error;
    }
  };

  // Helper functions for filtering and actions
  const getFilteredJobs = () => {
    if (activeTab === "active") return recentJobs.filter(job => job.status === "active");
    if (activeTab === "fulfilled") return recentJobs.filter(job => job.status === "fulfilled");
    return recentJobs;
  };

  // Handle shortlisting tutor
  const handleShortlistTutor = async (applicationId) => {
    try {
      await api.patch(`/student/applications/${applicationId}/shortlist`);
      
      // Refresh applications by getting all applications for all posts
      const postsRes = await api.get("/student/posts");
      const allApplications = await Promise.all(
        (postsRes.data || []).map(post => 
          api.get(`/student/posts/${post._id}/applications`).catch(() => ({ data: [] }))
        )
      );
      setRecentApplications(allApplications.flatMap(app => app.data || []));
      
      // Update KPIs
      setKpis(prev => ({
        ...prev,
        activeChats: prev.activeChats + 1
      }));
      
    } catch (error) {
      console.error("Shortlist tutor error:", error);
      setErr("Failed to shortlist tutor. Please try again.");
    }
  };

  // Handle accepting tutor (final hire)
  const handleAcceptTutor = async (applicationId) => {
    try {
      await api.patch(`/student/applications/${applicationId}/accept`);
      
      // Refresh applications
      const applicationsRes = await api.get("/student/applications");
      setRecentApplications(applicationsRes.data || []);
      
      // Update KPIs
      setKpis(prev => ({
        ...prev,
        activeChats: prev.activeChats + 1
      }));
      
    } catch (error) {
      console.error("Accept tutor error:", error);
      setErr("Failed to accept tutor. Please try again.");
    }
  };

  const handleStartChat = async (postId, tutorId) => {
    try {
      const response = await api.post('/chat/rooms', {
        postId: postId,
        tutorId: tutorId
      });
      const chatRoomId = response.data._id;
      navigate(`/chat/${chatRoomId}`);
    } catch (error) {
      console.error("Start chat error:", error);
      setErr("Failed to start chat. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="student-dashboard">
        <div className="error-container">
          <h2>Error Loading Dashboard</h2>
          <p>{err}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`student-layout ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      <StudentSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      
      <div className="student-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="page-title">Welcome back, {user.name || 'Student'}!</h1>
            <p className="page-subtitle">Manage your tuition requests and track progress</p>
          </div>
          <div className="header-right">
            <button 
              className="btn-primary"
              onClick={() => setIsPostWizardOpen(true)}
            >
              <span className="btn-icon">➕</span>
              Create New Post
            </button>
            <button 
              className="btn-outline-danger"
              onClick={logout}
              title="Logout"
            >
              <span className="btn-icon">🚪</span>
              Logout
            </button>
            <div className="user-badge">
              <span className="badge-icon">🎓</span>
              <span className="badge-text">Student</span>
            </div>
          </div>
        </header>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {/* Active Jobs Card */}
        <div className="kpi-card active-jobs">
          <div className="kpi-header">
            <div className="kpi-icon">
              <span>📚</span>
            </div>
            <div className="kpi-trend positive">
              <span className="trend-dot"></span>
              Active
            </div>
          </div>
          <div className="kpi-main">
            <div className="kpi-value">{kpis.activeJobs}</div>
            <div className="kpi-label">Active Jobs</div>
            <div className="kpi-description">Currently open positions</div>
          </div>
          <div className="kpi-stats">
            <div className="stat-row">
              <span className="stat-label">
                <span className="stat-icon">🔍</span>
                Open Positions
              </span>
              <span className="stat-value">{kpis.activeJobs}</span>
            </div>
          </div>
        </div>

        {/* Applicants Card */}
        <div className="kpi-card applicants">
          <div className="kpi-header">
            <div className="kpi-icon">
              <span>👨‍🏫</span>
            </div>
            <div className="kpi-trend active">
              <span className="trend-dot active"></span>
              Interested
            </div>
          </div>
          <div className="kpi-main">
            <div className="kpi-value">{kpis.totalApplicants}</div>
            <div className="kpi-label">Applicants</div>
            <div className="kpi-description">Tutors who submitted</div>
          </div>
          <div className="kpi-stats">
            <div className="stat-row">
              <span className="stat-label">
                <span className="stat-icon">📝</span>
                Total Applications
              </span>
              <span className="stat-value">{kpis.totalApplicants}</span>
            </div>
          </div>
        </div>

        {/* Active Chats Card */}
        <div className="kpi-card chats">
          <div className="kpi-header">
            <div className="kpi-icon">
              <span>💬</span>
            </div>
            <div className="kpi-trend positive">
              <span className="trend-dot"></span>
              Online
            </div>
          </div>
          <div className="kpi-main">
            <div className="kpi-value">{kpis.activeChats}</div>
            <div className="kpi-label">Active Chats</div>
            <div className="kpi-description">Ongoing conversations</div>
          </div>
          <div className="kpi-stats">
            <div className="stat-row">
              <span className="stat-label">
                <span className="stat-icon">🗨️</span>
                Conversations
              </span>
              <span className="stat-value">{kpis.activeChats}</span>
            </div>
          </div>
        </div>

        {/* Fulfilled Jobs Card */}
        <div className="kpi-card fulfilled">
          <div className="kpi-header">
            <div className="kpi-icon">
              <span>✅</span>
            </div>
            <div className="kpi-trend success">
              <span className="trend-dot success"></span>
              Completed
            </div>
          </div>
          <div className="kpi-main">
            <div className="kpi-value">{kpis.fulfilledJobs}</div>
            <div className="kpi-label">Fulfilled</div>
            <div className="kpi-description">Successfully completed</div>
          </div>
          <div className="kpi-stats">
            <div className="stat-row">
              <span className="stat-label">
                <span className="stat-icon">🎯</span>
                Success Rate
              </span>
              <span className="stat-value">73%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Sections */}
      <div className="dashboard-sections">
        {/* My Jobs Section */}
        <div className="section-card jobs-section">
          <div className="section-header">
            <h3 className="section-title">
              <span className="section-icon">📋</span>
              My Jobs
            </h3>
            <div className="section-tabs">
              <button 
                className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
              >
                Active ({recentJobs.filter(job => job.status === 'active').length})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'fulfilled' ? 'active' : ''}`}
                onClick={() => setActiveTab('fulfilled')}
              >
                Fulfilled ({recentJobs.filter(job => job.status === 'fulfilled').length})
              </button>
            </div>
          </div>
          
          <div className="jobs-list">
            {getFilteredJobs().length === 0 ? (
              <div className="empty-state">
                <p>No {activeTab} jobs found.</p>
                {activeTab === 'active' && (
                  <button 
                    className="btn-primary"
                    onClick={() => navigate('/student/post-job')}
                  >
                    Post Your First Job
                  </button>
                )}
              </div>
            ) : (
              getFilteredJobs().map((job) => (
                <div key={job._id || job.id} className="job-item">
                  <div className="job-info">
                    <div className="job-title">{job.title}</div>
                    <div className="job-meta">
                      <span className="job-subject">{job.subjects && job.subjects.length > 0 ? job.subjects.join(', ') : 'Subject'}</span>
                      <span className="job-budget">
                        {job.budgetAmount ? `৳${job.budgetAmount}` : 
                         (job.budget && typeof job.budget === 'object' && job.budget.min && job.budget.max) ? 
                         `৳${job.budget.min} - ৳${job.budget.max}` : 
                         job.budget ? `৳${job.budget}` : 'Budget not set'}
                        {job.paymentType === 'hourly' ? '/hour' : 
                         job.paymentType === 'monthly' ? '/month' : 
                         job.paymentType === 'per_session' ? '/session' : ''}
                      </span>
                      <span className="job-date">{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="job-stats">
                      <span className="applicants-count">{job.applicationsCount || 0} applicants</span>
                    </div>
                  </div>
                  <div className="job-actions">
                    <button 
                      className="btn-view" 
                      title="View details"
                      onClick={() => navigate(`/student/jobs/${job._id}`)}
                    >
                      👁️
                    </button>
                    <button 
                      className="btn-edit" 
                      title="Edit job"
                      onClick={() => navigate(`/student/jobs/${job._id}/edit`)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-message" 
                      title="Manage applications"
                      onClick={() => {
                        setSelectedPostId(job._id);
                        setApplicationManagerOpen(true);
                      }}
                    >
                      � Manage
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="section-footer">
            <button 
              className="view-all-btn"
              onClick={() => navigate('/student/jobs')}
            >
              View All Jobs →
            </button>
          </div>
        </div>

        {/* Recent Applications Section */}
        <div className="section-card applications-section">
          <h3 className="section-title">
            <span className="section-icon">📋</span>
            Recent Applications
          </h3>
          
          <div className="applications-list">
            {recentApplications.length === 0 ? (
              <div className="empty-state">
                <p>No applications yet. Your posted jobs will show applicants here.</p>
              </div>
            ) : (
              recentApplications.map((application) => (
                <div key={application._id || application.id} className="application-item">
                  <div className="application-info">
                    <div className="tutor-name">{application.tutorName || application.tutor?.name}</div>
                    <div className="application-meta">
                      <span className="subject">
                        {application.post?.subjects && application.post.subjects.length > 0 
                          ? application.post.subjects.join(', ') 
                          : 'Subject'
                        }
                      </span>
                      <span className="experience">{application.experience || application.tutor?.experience} years</span>
                    </div>
                    <div className="application-date">{new Date(application.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="application-status">
                    <span className={`status-badge ${application.status}`}>
                      {application.status}
                    </span>
                  </div>
                  <div className="application-actions">
                    {application.status === 'pending' && (
                      <button 
                        className="btn-shortlist" 
                        title="Add to shortlist"
                        onClick={() => handleShortlistTutor(application._id)}
                      >
                        ⭐
                      </button>
                    )}
                    {application.status === 'shortlisted' && (
                      <button 
                        className="btn-accept" 
                        title="Accept tutor"
                        onClick={() => handleAcceptTutor(application._id)}
                      >
                        ✅
                      </button>
                    )}
                    {(application.status === 'shortlisted' || application.status === 'accepted') && (
                      <button 
                        className="btn-message" 
                        title="Send message"
                        onClick={() => handleStartChat(application.post._id || application.postId, application.tutor?._id || application.tutorId)}
                      >
                        💬
                      </button>
                    )}
                    <button 
                      className="btn-view-profile" 
                      title="View tutor profile"
                      onClick={() => navigate(`/student/tutors/${application.tutor?._id || application.tutorId}`)}
                    >
                      👤
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="section-footer">
            <button 
              className="view-all-btn"
              onClick={() => navigate('/student/applications')}
            >
              View All Applications →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3 className="quick-actions-title">Quick Actions</h3>
        <div className="actions-grid">
          <button 
            className="action-card"
            onClick={() => navigate('/student/post-job')}
          >
            <span className="action-icon">➕</span>
            <span className="action-text">Post New Job</span>
          </button>
          <button 
            className="action-card"
            onClick={() => navigate('/student/messages')}
          >
            <span className="action-icon">💬</span>
            <span className="action-text">Messages</span>
          </button>
          <button 
            className="action-card"
            onClick={() => navigate('/student/schedule')}
          >
            <span className="action-icon">📅</span>
            <span className="action-text">Schedule</span>
          </button>
          <button 
            className="action-card"
            onClick={() => navigate('/student/profile')}
          >
            <span className="action-icon">👤</span>
            <span className="action-text">Profile</span>
          </button>
        </div>
      </div>
      </div>
      
      {/* Post Creation Wizard */}
      <PostWizard
        isOpen={isPostWizardOpen}
        onClose={() => setIsPostWizardOpen(false)}
        onSubmit={handleCreatePost}
      />
      
      {/* Application Manager Modal */}
      {applicationManagerOpen && selectedPostId && (
        <ApplicationManager
          postId={selectedPostId}
          onClose={() => {
            setApplicationManagerOpen(false);
            setSelectedPostId(null);
          }}
        />
      )}
    </div>
  );
}
