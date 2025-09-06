// frontend/src/pages/tutor/TutorApplications.jsx
import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import TutorSidebar from "../../components/TutorSidebar";
import "./TutorApplications-modern.css";

export default function TutorApplications() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [apps, setApps] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const response = await api.get("/tutor/applications");
      console.log("Applications API response:", response.data);
      
      if (response.data && response.data.applications) {
        setApps(Array.isArray(response.data.applications) ? response.data.applications : []);
      } else if (Array.isArray(response.data)) {
        setApps(response.data);
      } else {
        setApps([]);
      }
    } catch (e) {
      console.error("Applications API error:", e);
      setErr(e?.response?.data?.message || "Failed to load applications");
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter and search applications
  const filteredApps = apps.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = !searchTerm || 
      app.post?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.post?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.post?.area?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Get status counts
  const statusCounts = {
    all: apps.length,
    submitted: apps.filter(app => app.status === 'submitted').length,
    shortlisted: apps.filter(app => app.status === 'shortlisted').length,
    accepted: apps.filter(app => app.status === 'accepted').length,
    rejected: apps.filter(app => app.status === 'rejected').length
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'submitted': 'status-submitted',
      'shortlisted': 'status-shortlisted', 
      'accepted': 'status-accepted',
      'rejected': 'status-rejected'
    };
    return statusClasses[status] || 'status-submitted';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'submitted': '📋',
      'shortlisted': '🎯',
      'accepted': '✅',
      'rejected': '❌'
    };
    return icons[status] || '📋';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="tutor-applications-container">
      <TutorSidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      {/* Mobile overlay */}
      {!isSidebarCollapsed && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
      
      <div className={`tutor-applications-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>📋 My Applications</h1>
            <p>Track your job applications and their current status</p>
          </div>
          <button 
            className="refresh-btn"
            onClick={load}
            disabled={loading}
            title="Refresh applications"
          >
            {loading ? '⏳' : '🔄'}
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="filter-tabs">
          {[
            { key: 'all', label: 'All Applications', icon: '📊' },
            { key: 'submitted', label: 'Submitted', icon: '📋' },
            { key: 'shortlisted', label: 'Shortlisted', icon: '🎯' },
            { key: 'accepted', label: 'Accepted', icon: '✅' },
            { key: 'rejected', label: 'Rejected', icon: '❌' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
              onClick={() => setFilter(tab.key)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              <span className="tab-count">({statusCounts[tab.key]})</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by job title, subject, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* Error Message */}
        {err && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{err}</span>
          </div>
        )}

        {/* Applications Content */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h3>Loading applications...</h3>
            <p>Please wait while we fetch your application data</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {searchTerm || filter !== 'all' ? '�' : '�📋'}
            </div>
            <h3>
              {searchTerm || filter !== 'all' 
                ? 'No applications found' 
                : 'No applications yet'
              }
            </h3>
            <p>
              {searchTerm || filter !== 'all'
                ? `Try adjusting your ${searchTerm ? 'search terms' : 'filters'} to find applications`
                : 'Start browsing jobs and apply to begin your tutoring journey!'
              }
            </p>
            {(searchTerm || filter !== 'all') && (
              <button 
                className="clear-filters-btn"
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="applications-container">
            <div className="applications-summary">
              <h3>
                {filteredApps.length} 
                {filter === 'all' ? ' Total Applications' : ` ${filter.charAt(0).toUpperCase() + filter.slice(1)} Applications`}
              </h3>
            </div>
            
            <div className="applications-grid">
              {filteredApps.map((app) => (
                <div key={app._id} className={`application-card ${app.status}`}>
                  {/* Card Header */}
                  <div className="application-header">
                    <div className="application-title-section">
                      <h4 className="application-title">
                        {app.post?.title || 'Job Application'}
                      </h4>
                      <div className="application-subjects">
                        {Array.isArray(app.post?.subjects) 
                          ? app.post.subjects.slice(0, 3).map((subject, idx) => (
                              <span key={idx} className="subject-tag">{subject}</span>
                            ))
                          : app.post?.subject && <span className="subject-tag">{app.post.subject}</span>
                        }
                      </div>
                    </div>
                    <div className="status-section">
                      <span className={`status-badge ${getStatusBadgeClass(app.status)}`}>
                        <span className="status-icon">{getStatusIcon(app.status)}</span>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="application-content">
                    {/* Key Info */}
                    <div className="application-meta">
                      <div className="meta-item">
                        <span className="meta-icon">🎓</span>
                        <span className="meta-text">{app.post?.educationLevel || 'Level not specified'}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">📍</span>
                        <span className="meta-text">{app.post?.area || 'Location not specified'}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">💰</span>
                        <span className="meta-text">৳{app.post?.budgetAmount || 'Budget not specified'}/month</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span className="meta-text">{formatDate(app.createdAt)}</span>
                      </div>
                    </div>

                    {/* Description */}
                    {app.post?.description && (
                      <div className="application-description">
                        <p>{app.post.description}</p>
                      </div>
                    )}

                    {/* Your Application Message */}
                    {app.message && (
                      <div className="application-message">
                        <div className="message-header">
                          <span className="message-icon">💬</span>
                          <span className="message-label">Your Application Note:</span>
                        </div>
                        <p className="message-content">{app.message}</p>
                      </div>
                    )}

                    {/* Student Info */}
                    {app.post?.student && (
                      <div className="student-info">
                        <div className="student-avatar">
                          {app.post.student.name?.charAt(0)?.toUpperCase() || '👤'}
                        </div>
                        <div className="student-details">
                          <span className="student-name">{app.post.student.name}</span>
                          {app.post.student.location && (
                            <span className="student-location">📍 {app.post.student.location}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="application-actions">
                    {app.status === 'shortlisted' && (
                      <div className="action-message">
                        <span className="action-icon">🎉</span>
                        <span>You've been shortlisted! The student can now contact you.</span>
                      </div>
                    )}
                    {app.status === 'accepted' && (
                      <div className="action-message success">
                        <span className="action-icon">✨</span>
                        <span>Congratulations! You got the job. Contact the student to get started.</span>
                      </div>
                    )}
                    {app.status === 'rejected' && (
                      <div className="action-message rejected">
                        <span className="action-icon">💙</span>
                        <span>Keep applying! More opportunities are waiting for you.</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
