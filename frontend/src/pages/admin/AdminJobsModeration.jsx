import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import '../../styles/AdminLayout.css';
import './AdminJobsModeration.css';

const AdminJobsModeration = () => {
  const [posts, setPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch posts
      const postsResponse = await fetch('/api/admin/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData);
      }

      // Fetch applications
      const appsResponse = await fetch('/api/admin/applications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setApplications(appsData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter and sort functions
  const filterPosts = () => {
    let filtered = posts.filter(post => {
      const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.subjects?.join(' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  };

  const filterApplications = () => {
    let filtered = applications.filter(app => {
      const matchesSearch = app.post?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.tutor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.post?.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortBy] || a.createdAt;
      let bValue = b[sortBy] || b.createdAt;
      
      if (sortBy === 'createdAt' || !a[sortBy]) {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  };

  // Action handlers
  const handlePostAction = async (postId, action) => {
    try {
      setProcessing(true);
      
      let endpoint = '';
      let method = 'POST';
      
      switch (action) {
        case 'approve':
          endpoint = `/api/admin/posts/${postId}/approve`;
          break;
        case 'reject':
          endpoint = `/api/admin/posts/${postId}/reject`;
          break;
        case 'delete':
          endpoint = `/api/admin/posts/${postId}`;
          method = 'DELETE';
          break;
        default:
          return;
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        if (action === 'delete') {
          setPosts(prev => prev.filter(p => p._id !== postId));
        } else {
          const updatedPost = await response.json();
          setPosts(prev => prev.map(p => p._id === postId ? updatedPost : p));
        }
      }
    } catch (error) {
      console.error('Error handling post action:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleApplicationAction = async (appId, action) => {
    try {
      setProcessing(true);
      
      let endpoint = '';
      let method = 'POST';
      
      switch (action) {
        case 'approve':
          endpoint = `/api/admin/applications/${appId}/approve`;
          break;
        case 'reject':
          endpoint = `/api/admin/applications/${appId}/reject`;
          break;
        case 'delete':
          endpoint = `/api/admin/applications/${appId}`;
          method = 'DELETE';
          break;
        default:
          return;
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        if (action === 'delete') {
          setApplications(prev => prev.filter(a => a._id !== appId));
        } else {
          const updatedApp = await response.json();
          setApplications(prev => prev.map(a => a._id === appId ? updatedApp : a));
        }
      }
    } catch (error) {
      console.error('Error handling application action:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className="admin-main">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading posts and applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="admin-main">
        <div className="admin-header">
          <div className="header-left">
            <h1 className="page-title">Jobs & Applications Moderation</h1>
            <p className="page-subtitle">Review and manage tuition posts and applications</p>
          </div>
          <div className="header-right">
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-value">{posts.length}</span>
                <span className="stat-label">Total Posts</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{applications.length}</span>
                <span className="stat-label">Applications</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {posts.filter(p => p.status === 'pending').length}
                </span>
                <span className="stat-label">Pending Review</span>
              </div>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="admin-jobs-moderation">
            <div className="tab-switcher">
              <button 
                className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('posts')}
              >
                Posts ({posts.length})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
                onClick={() => setActiveTab('applications')}
              >
                Applications ({applications.length})
              </button>
            </div>

            <div className="control-group">
              <div className="search-control">
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-control">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="frozen">Frozen</option>
                </select>
              </div>

              <div className="sort-control">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="sort-select"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                  <option value="status-asc">Status A-Z</option>
                </select>
              </div>

              <button 
                onClick={fetchData}
                className="refresh-btn"
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="content-container">
            {activeTab === 'posts' ? (
              <div className="posts-grid">
                {filterPosts().length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No posts found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  filterPosts().map(post => (
                    <div key={post._id} className="post-card">
                      <div className="post-header">
                        <h3 className="post-title">{post.title}</h3>
                        <div className={`post-status status-${post.status}`}>
                          {post.status}
                        </div>
                      </div>
                      
                      <div className="post-details">
                        <div className="detail-row">
                          <span className="label">Subjects:</span>
                          <span className="value">
                            {post.subjects?.join(', ') || 'Not specified'}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Grade:</span>
                          <span className="value">{post.grade || 'Not specified'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Student:</span>
                          <span className="value">{post.studentName || 'Not specified'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Location:</span>
                          <span className="value">
                            {post.location?.area && post.location?.district 
                              ? `${post.location.area}, ${post.location.district}`
                              : post.location || 'Not specified'}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Budget:</span>
                          <span className="value">
                            ৳{post.budget?.min || 0} - ৳{post.budget?.max || 0}/month
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Posted:</span>
                          <span className="value">{formatDate(post.createdAt)}</span>
                        </div>
                      </div>

                      <div className="post-actions">
                        {post.status === 'pending' && (
                          <>
                            <button 
                              className="action-btn approve"
                              onClick={() => handlePostAction(post._id, 'approve')}
                              disabled={processing}
                            >
                              ✅ Approve
                            </button>
                            <button 
                              className="action-btn reject"
                              onClick={() => handlePostAction(post._id, 'reject')}
                              disabled={processing}
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                        <button 
                          className="action-btn delete"
                          onClick={() => handlePostAction(post._id, 'delete')}
                          disabled={processing}
                          title="Delete post permanently"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="applications-list">
                {filterApplications().length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No applications found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  filterApplications().map(app => (
                    <div key={app._id} className="application-card">
                      <div className="app-header">
                        <div className="app-info">
                          <h3 className="app-title">
                            {app.post?.title || 'Untitled Post'}
                          </h3>
                          <p className="app-subtitle">
                            Application by {app.tutor?.name || 'Unknown Tutor'}
                          </p>
                        </div>
                        <div className={`app-status status-${app.status}`}>
                          {app.status}
                        </div>
                      </div>

                      <div className="app-details">
                        <div className="app-meta">
                          <div className="meta-item">
                            <strong>Tutor:</strong> {app.tutor?.name || 'Unknown'}
                          </div>
                          <div className="meta-item">
                            <strong>Email:</strong> {app.tutor?.email || 'Not provided'}
                          </div>
                          <div className="meta-item">
                            <strong>Experience:</strong> {app.experience || 'Not specified'}
                          </div>
                          <div className="meta-item">
                            <strong>Expected Rate:</strong> ৳{app.expectedRate || 'Not specified'}/month
                          </div>
                          <div className="meta-item">
                            <strong>Applied:</strong> {formatDate(app.createdAt)}
                          </div>
                        </div>
                        
                        {app.message && (
                          <div className="cover-letter">
                            <strong>Message:</strong>
                            <p>{app.message}</p>
                          </div>
                        )}
                      </div>

                      <div className="app-actions">
                        {app.status === 'pending' && (
                          <>
                            <button 
                              className="action-btn approve"
                              onClick={() => handleApplicationAction(app._id, 'approve')}
                              disabled={processing}
                            >
                              ✅ Approve
                            </button>
                            <button 
                              className="action-btn reject"
                              onClick={() => handleApplicationAction(app._id, 'reject')}
                              disabled={processing}
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                        <button 
                          className="action-btn delete"
                          onClick={() => handleApplicationAction(app._id, 'delete')}
                          disabled={processing}
                          title="Delete application permanently"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {processing && (
              <div className="processing-overlay">
                <div className="processing-modal">
                  <div className="processing-spinner"></div>
                  <p>Processing request...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobsModeration;
