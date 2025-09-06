// frontend/src/pages/student/MyPosts.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import StudentSidebar from "../../components/StudentSidebar";
import PostWizard from "../../components/PostWizard/PostWizard";
import JobDetailDrawer from "./JobDetailDrawer";
import useSidebar from "../../hooks/useSidebar";
import "./MyPosts.css";

const statusTabs = [
  { key: 'active', label: 'Active', description: 'Open for applications' },
  { key: 'interviewing', label: 'Interviewing', description: 'Reviewing candidates' },
  { key: 'matched', label: 'Matched', description: 'Tutor selected' },
  { key: 'fulfilled', label: 'Fulfilled', description: 'Successfully completed' },
  { key: 'closed', label: 'Closed', description: 'No longer active' }
];

const statusColors = {
  active: 'status-active',
  interviewing: 'status-interviewing', 
  matched: 'status-matched',
  fulfilled: 'status-fulfilled',
  closed: 'status-closed'
};

export default function MyPosts() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isCollapsed, toggleSidebar, closeSidebar } = useSidebar(false);
  const [isPostWizardOpen, setIsPostWizardOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Data
  const [posts, setPosts] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  
  // Filters
  const activeTab = searchParams.get('status') || 'active';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'newest';

  // Load posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch posts with filters
      const params = new URLSearchParams();
      if (activeTab && activeTab !== 'all') params.append('status', activeTab);
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy) params.append('sort', sortBy);

      const response = await api.get(`/student/posts?${params}`);
      const { posts: fetchedPosts } = response.data;

      setPosts(fetchedPosts || []);
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
      setError("Failed to load posts. Please try again.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, sortBy]);

  // Load status counts
  const fetchStatusCounts = useCallback(async () => {
    try {
      const response = await api.get('/student/posts/status-counts');
      setStatusCounts(response.data || {});
    } catch (error) {
      console.error("❌ Error fetching status counts:", error);
      setStatusCounts({});
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchStatusCounts();
  }, [fetchPosts, fetchStatusCounts]);

  // Create post handler
  const handleCreatePost = async (postData) => {
    try {
      const response = await api.post("/student/posts", postData);
      console.log("✅ Post created successfully:", response.data);
      
      // Refresh posts and status counts
      await Promise.all([fetchPosts(), fetchStatusCounts()]);
      
      return response.data;
    } catch (error) {
      console.error("❌ Error creating post:", error);
      throw error;
    }
  };

  // Tab change handler
  const handleTabChange = (tabKey) => {
    const params = new URLSearchParams(searchParams);
    if (tabKey === 'all') {
      params.delete('status');
    } else {
      params.set('status', tabKey);
    }
    setSearchParams(params);
  };

  // Search handler
  const handleSearch = (query) => {
    const params = new URLSearchParams(searchParams);
    if (query.trim()) {
      params.set('search', query.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  // Sort handler
  const handleSort = (sortOption) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sortOption);
    setSearchParams(params);
  };

  // Job action handlers
  const handleJobAction = async (jobId, action) => {
    try {
      let endpoint;
      switch (action) {
        case 'view':
          const job = posts.find(p => p._id === jobId);
          setSelectedJob(job);
          setIsDetailOpen(true);
          return;
        case 'edit':
          navigate(`/s/jobs/${jobId}/edit`);
          return;
        case 'close':
          endpoint = `/student/posts/${jobId}/close`;
          break;
        case 'reopen':
          endpoint = `/student/posts/${jobId}/reopen`;
          break;
        case 'fulfill':
          endpoint = `/student/posts/${jobId}/fulfill`;
          break;
        case 'applications':
          navigate(`/s/applications?job=${jobId}`);
          return;
        default:
          return;
      }

      // Call API for action
      await api.post(endpoint);
      
      // Show success message
      const actionMessages = {
        close: 'Post closed successfully',
        reopen: 'Post reopened successfully', 
        fulfill: 'Post marked as fulfilled'
      };
      
      // You could add a toast notification here
      console.log(`✅ ${actionMessages[action]}`);
      
      // Refresh posts and status counts
      await Promise.all([fetchPosts(), fetchStatusCounts()]);
      
    } catch (error) {
      console.error(`❌ Error with ${action}:`, error);
      // You could add error toast here
    }
  };

  // Format budget display
  const formatBudget = (post) => {
    if (post.budgetAmount) {
      const typeMap = {
        hourly: '/hour',
        monthly: '/month', 
        per_session: '/session',
        package: ''
      };
      return `৳${post.budgetAmount}${typeMap[post.paymentType] || ''}`;
    }
    
    if (post.budget && typeof post.budget === 'object' && post.budget.min && post.budget.max) {
      return `৳${post.budget.min} - ৳${post.budget.max}`;
    }
    
    if (post.budget) {
      return `৳${post.budget}`;
    }
    
    return 'Not set';
  };

  // Get available actions for a job
  const getJobActions = (job) => {
    const actions = [
      { key: 'view', label: 'View', icon: '👁️' },
      { key: 'applications', label: 'Applications', icon: '👥', badge: job.applicationsCount }
    ];

    if (job.status === 'active') {
      actions.push(
        { key: 'edit', label: 'Edit', icon: '✏️' },
        { key: 'close', label: 'Close', icon: '🔒', variant: 'danger' }
      );
    }

    if (job.status === 'interviewing') {
      actions.push(
        { key: 'close', label: 'Close', icon: '🔒', variant: 'danger' }
      );
    }

    if (job.status === 'matched') {
      actions.push(
        { key: 'fulfill', label: 'Mark Fulfilled', icon: '✅', variant: 'success' }
      );
    }

    if (job.status === 'closed') {
      actions.push(
        { key: 'reopen', label: 'Reopen', icon: '🔓', variant: 'primary' }
      );
    }

    return actions;
  };

  // Filter posts based on current tab
  const getFilteredPosts = () => {
    let filtered = posts;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title?.toLowerCase().includes(query) ||
        post.subjects?.some(subject => subject.toLowerCase().includes(query)) ||
        post.area?.toLowerCase().includes(query)
      );
    }

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'budget_high':
          return (b.budgetAmount || b.budget?.max || 0) - (a.budgetAmount || a.budget?.max || 0);
        case 'budget_low':
          return (a.budgetAmount || a.budget?.min || 0) - (b.budgetAmount || b.budget?.min || 0);
        case 'applicants':
          return (b.applicationsCount || 0) - (a.applicationsCount || 0);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  };

  if (loading) {
    return (
      <div className="my-posts-container">
        <StudentSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <div className="my-posts-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-posts-container">
      <StudentSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="mobile-overlay"
          onClick={closeSidebar}
        />
      )}
      
      <div className="my-posts-content">
        {/* Header */}
        <div className="my-posts-header">
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
          >
            ☰
          </button>
          <div className="header-left">
            <h1>My Posts</h1>
            <p className="header-subtitle">Manage your job postings and applications</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-primary"
              onClick={() => setIsPostWizardOpen(true)}
            >
              📝 Post New Job
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="posts-filters">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search posts by title, subject, or area..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <div className="sort-dropdown">
              <select 
                value={sortBy} 
                onChange={(e) => handleSort(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="budget_high">Budget: High to Low</option>
                <option value="budget_low">Budget: Low to High</option>
                <option value="applicants">Most Applicants</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="status-tabs">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              <span className="tab-label">{tab.label}</span>
              {statusCounts[tab.key] > 0 && (
                <span className="tab-count">{statusCounts[tab.key]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Posts Table */}
        <div className="posts-table-container">
          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              <button onClick={fetchPosts} className="retry-btn">Retry</button>
            </div>
          )}

          {getFilteredPosts().length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No posts found</h3>
              <p>
                {searchQuery 
                  ? `No posts match "${searchQuery}". Try adjusting your search.`
                  : activeTab === 'active' 
                    ? "You haven't posted any jobs yet. Create your first post to get started!"
                    : `No ${activeTab} posts found.`
                }
              </p>
              {!searchQuery && activeTab === 'active' && (
                <button 
                  className="btn-primary"
                  onClick={() => setIsPostWizardOpen(true)}
                >
                  Post Your First Job
                </button>
              )}
            </div>
          ) : (
            <div className="posts-table">
              <div className="table-header">
                <div className="col-title">Title & Details</div>
                <div className="col-budget">Budget</div>
                <div className="col-applicants">Applicants</div>
                <div className="col-status">Status</div>
                <div className="col-posted">Posted</div>
                <div className="col-actions">Actions</div>
              </div>
              
              <div className="table-body">
                {getFilteredPosts().map(post => (
                  <div key={post._id} className="table-row">
                    <div className="col-title">
                      <div className="post-title">{post.title}</div>
                      <div className="post-details">
                        <span className="detail-chip">{post.educationLevel || post.classLevel}</span>
                        <span className="detail-chip">
                          {Array.isArray(post.subjects) ? post.subjects.slice(0, 2).join(', ') : post.subject}
                          {Array.isArray(post.subjects) && post.subjects.length > 2 && ` +${post.subjects.length - 2}`}
                        </span>
                        <span className="detail-chip">{post.area}</span>
                        <span className="detail-chip mode-chip">{post.teachingMode || post.mode}</span>
                      </div>
                    </div>
                    
                    <div className="col-budget">
                      <span className="budget-amount">{formatBudget(post)}</span>
                    </div>
                    
                    <div className="col-applicants">
                      <span className="applicants-count">{post.applicationsCount || 0}</span>
                    </div>
                    
                    <div className="col-status">
                      <span className={`status-badge ${statusColors[post.status]}`}>
                        {post.status}
                      </span>
                    </div>
                    
                    <div className="col-posted">
                      <span className="posted-date">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="col-actions">
                      <div className="action-buttons">
                        {getJobActions(post).map(action => (
                          <button
                            key={action.key}
                            className={`action-btn ${action.variant || ''}`}
                            onClick={() => handleJobAction(post._id, action.key)}
                            title={action.label}
                          >
                            <span className="action-icon">{action.icon}</span>
                            {action.badge && (
                              <span className="action-badge">{action.badge}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Creation Wizard */}
      <PostWizard
        isOpen={isPostWizardOpen}
        onClose={() => setIsPostWizardOpen(false)}
        onSubmit={handleCreatePost}
      />

      {/* Job Detail Drawer */}
      {selectedJob && (
        <JobDetailDrawer
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
          onAction={handleJobAction}
        />
      )}
    </div>
  );
}
