// frontend/src/pages/admin/AdminJobsModeration.jsx
import React, { useState, useEffect } from 'react';
import './AdminJobsModeration.css';

const AdminJobsModeration = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Mock data for demonstration
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Mock posts data
      const mockPosts = [
        {
          _id: '1',
          title: 'Mathematics Tutor Needed for Grade 10',
          subject: 'Mathematics',
          grade: 'Grade 10',
          location: 'Dhaka, Bangladesh',
          budget: 8000,
          status: 'active',
          student: {
            name: 'Ahmed Hassan',
            email: 'ahmed@email.com'
          },
          applicationsCount: 5,
          created_at: '2024-01-15T10:30:00Z',
          frozen: false
        },
        {
          _id: '2',
          title: 'English Literature Help for A-Level',
          subject: 'English',
          grade: 'A-Level',
          location: 'Chittagong, Bangladesh',
          budget: 12000,
          status: 'pending',
          student: {
            name: 'Fatima Rahman',
            email: 'fatima@email.com'
          },
          applicationsCount: 8,
          created_at: '2024-01-14T15:45:00Z',
          frozen: false
        },
        {
          _id: '3',
          title: 'Physics Tutor for HSC Preparation',
          subject: 'Physics',
          grade: 'HSC',
          location: 'Sylhet, Bangladesh',
          budget: 15000,
          status: 'frozen',
          student: {
            name: 'Karim Ahmed',
            email: 'karim@email.com'
          },
          applicationsCount: 12,
          created_at: '2024-01-13T09:20:00Z',
          frozen: true
        }
      ];

      // Mock applications data
      const mockApplications = [
        {
          _id: 'app1',
          post: {
            title: 'Mathematics Tutor Needed for Grade 10',
            student: 'Ahmed Hassan'
          },
          tutor: {
            name: 'Dr. Sarah Khan',
            email: 'sarah@email.com',
            experience: '5 years'
          },
          status: 'pending',
          coverLetter: 'I have extensive experience teaching mathematics...',
          proposedRate: 8500,
          created_at: '2024-01-15T14:20:00Z'
        },
        {
          _id: 'app2',
          post: {
            title: 'English Literature Help for A-Level',
            student: 'Fatima Rahman'
          },
          tutor: {
            name: 'Prof. Mike Johnson',
            email: 'mike@email.com',
            experience: '8 years'
          },
          status: 'approved',
          coverLetter: 'I specialize in A-Level English Literature...',
          proposedRate: 12000,
          created_at: '2024-01-14T16:30:00Z'
        },
        {
          _id: 'app3',
          post: {
            title: 'Physics Tutor for HSC Preparation',
            student: 'Karim Ahmed'
          },
          tutor: {
            name: 'Dr. Lisa Chen',
            email: 'lisa@email.com',
            experience: '10 years'
          },
          status: 'rejected',
          coverLetter: 'I am a physics professor with extensive experience...',
          proposedRate: 16000,
          created_at: '2024-01-13T11:45:00Z'
        }
      ];

      setPosts(mockPosts);
      setApplications(mockApplications);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Filter and sort functions
  const filterPosts = () => {
    let filtered = posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_at') {
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
      const matchesSearch = app.post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.post.student.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortBy] || a.created_at;
      let bValue = b[sortBy] || b.created_at;
      
      if (sortBy === 'created_at' || !a[sortBy]) {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  };

  // Action handlers
  const handlePostAction = (postId, action) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post._id === postId) {
          switch (action) {
            case 'approve':
              return { ...post, status: 'active' };
            case 'reject':
              return { ...post, status: 'rejected' };
            case 'freeze':
              return { ...post, status: 'frozen', frozen: true };
            case 'unfreeze':
              return { ...post, status: 'active', frozen: false };
            default:
              return post;
          }
        }
        return post;
      })
    );
  };

  const handleApplicationAction = (appId, action) => {
    setApplications(prevApps => 
      prevApps.map(app => {
        if (app._id === appId) {
          switch (action) {
            case 'approve':
              return { ...app, status: 'approved' };
            case 'reject':
              return { ...app, status: 'rejected' };
            default:
              return app;
          }
        }
        return app;
      })
    );
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

  const getStatusCounts = () => {
    if (activeTab === 'posts') {
      return {
        all: posts.length,
        active: posts.filter(p => p.status === 'active').length,
        pending: posts.filter(p => p.status === 'pending').length,
        frozen: posts.filter(p => p.status === 'frozen').length,
        rejected: posts.filter(p => p.status === 'rejected').length
      };
    } else {
      return {
        all: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length
      };
    }
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="jobs-moderation-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Loading Jobs & Applications...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-moderation-container">
      {/* Header */}
      <div className="jobs-header">
        <div className="header-content">
          <h2>📋 Jobs & Applications Moderation</h2>
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
              <span className="stat-value">{statusCounts.pending || 0}</span>
              <span className="stat-label">Pending Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            📝 Tuition Posts ({posts.length})
          </button>
          <button 
            className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            📨 Applications ({applications.length})
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="status-tabs">
          <button 
            className={`status-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({statusCounts.all})
          </button>
          {activeTab === 'posts' ? (
            <>
              <button 
                className={`status-tab ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                Pending ({statusCounts.pending})
              </button>
              <button 
                className={`status-tab ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                Active ({statusCounts.active})
              </button>
              <button 
                className={`status-tab ${statusFilter === 'frozen' ? 'active' : ''}`}
                onClick={() => setStatusFilter('frozen')}
              >
                Frozen ({statusCounts.frozen})
              </button>
            </>
          ) : (
            <>
              <button 
                className={`status-tab ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                Pending ({statusCounts.pending})
              </button>
              <button 
                className={`status-tab ${statusFilter === 'approved' ? 'active' : ''}`}
                onClick={() => setStatusFilter('approved')}
              >
                Approved ({statusCounts.approved})
              </button>
              <button 
                className={`status-tab ${statusFilter === 'rejected' ? 'active' : ''}`}
                onClick={() => setStatusFilter('rejected')}
              >
                Rejected ({statusCounts.rejected})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search and Sort */}
      <div className="search-sort-container">
        <div className="search-box">
          <i className="search-icon">🔍</i>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="sort-controls">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="created_at">Date Created</option>
            {activeTab === 'posts' && (
              <>
                <option value="title">Title</option>
                <option value="budget">Budget</option>
                <option value="applicationsCount">Applications</option>
              </>
            )}
            {activeTab === 'applications' && (
              <>
                <option value="proposedRate">Proposed Rate</option>
                <option value="status">Status</option>
              </>
            )}
          </select>
          <button 
            className={`sort-order-btn ${sortOrder}`}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content-container">
        {activeTab === 'posts' ? (
          <div className="posts-grid">
            {filterPosts().map(post => (
              <div key={post._id} className="post-card">
                <div className="post-header">
                  <h3 className="post-title">{post.title}</h3>
                  <div className={`post-status status-${post.status}`}>
                    {post.status}
                  </div>
                </div>
                
                <div className="post-details">
                  <div className="detail-row">
                    <span className="label">Subject:</span>
                    <span className="value">{post.subject} - {post.grade}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Student:</span>
                    <span className="value">{post.student.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Location:</span>
                    <span className="value">{post.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Budget:</span>
                    <span className="value">৳{post.budget.toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Applications:</span>
                    <span className="value">{post.applicationsCount} received</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Posted:</span>
                    <span className="value">{formatDate(post.created_at)}</span>
                  </div>
                </div>

                <div className="post-actions">
                  {post.status === 'pending' && (
                    <>
                      <button 
                        className="action-btn approve"
                        onClick={() => handlePostAction(post._id, 'approve')}
                      >
                        ✅ Approve
                      </button>
                      <button 
                        className="action-btn reject"
                        onClick={() => handlePostAction(post._id, 'reject')}
                      >
                        ❌ Reject
                      </button>
                    </>
                  )}
                  {post.status === 'active' && !post.frozen && (
                    <button 
                      className="action-btn freeze"
                      onClick={() => handlePostAction(post._id, 'freeze')}
                    >
                      🧊 Freeze
                    </button>
                  )}
                  {post.frozen && (
                    <button 
                      className="action-btn unfreeze"
                      onClick={() => handlePostAction(post._id, 'unfreeze')}
                    >
                      🔥 Unfreeze
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="applications-list">
            {filterApplications().map(app => (
              <div key={app._id} className="application-card">
                <div className="app-header">
                  <div className="app-info">
                    <h3 className="app-title">{app.post.title}</h3>
                    <p className="app-subtitle">Application by {app.tutor.name}</p>
                  </div>
                  <div className={`app-status status-${app.status}`}>
                    {app.status}
                  </div>
                </div>

                <div className="app-details">
                  <div className="app-meta">
                    <div className="meta-item">
                      <strong>Tutor:</strong> {app.tutor.name}
                    </div>
                    <div className="meta-item">
                      <strong>Experience:</strong> {app.tutor.experience}
                    </div>
                    <div className="meta-item">
                      <strong>Proposed Rate:</strong> ৳{app.proposedRate.toLocaleString()}
                    </div>
                    <div className="meta-item">
                      <strong>Applied:</strong> {formatDate(app.created_at)}
                    </div>
                  </div>
                  
                  <div className="cover-letter">
                    <strong>Cover Letter:</strong>
                    <p>{app.coverLetter}</p>
                  </div>
                </div>

                {app.status === 'pending' && (
                  <div className="app-actions">
                    <button 
                      className="action-btn approve"
                      onClick={() => handleApplicationAction(app._id, 'approve')}
                    >
                      ✅ Approve
                    </button>
                    <button 
                      className="action-btn reject"
                      onClick={() => handleApplicationAction(app._id, 'reject')}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'posts' && filterPosts().length === 0) || 
          (activeTab === 'applications' && filterApplications().length === 0)) && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No {activeTab} found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobsModeration;
