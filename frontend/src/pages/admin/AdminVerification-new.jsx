// frontend/src/pages/admin/AdminVerification.jsx
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';
import './AdminVerification.css';

const AdminVerification = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, tutor, student
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  useEffect(() => {
    fetchVerificationQueue();
    
    // Auto-refresh every 30 seconds to show new registrations
    const refreshInterval = setInterval(() => {
      fetchVerificationQueue();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchVerificationQueue = async () => {
    try {
      setLoading(true);
      console.log('🔍 AdminVerification: Fetching verification queue...');
      const response = await api.get('/admin/verification-queue');
      console.log('📊 AdminVerification: API response:', response.data);
      
      // Backend returns a flat array of users
      const queue = response.data.map(user => ({ 
        ...user, 
        type: user.role === 'tutor' ? 'Tutor' : 'Student' 
      }));
      
      console.log('📋 AdminVerification: Processed queue:', queue);
      setVerificationQueue(queue);
      
      console.log(`✅ Verification queue refreshed: ${queue.length} pending users`);
    } catch (error) {
      console.error('❌ Failed to fetch verification queue:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
      console.log('🔄 AdminVerification: Loading state set to false');
    }
  };

  const handleDecision = async (userId, decision, reason = '') => {
    try {
      setProcessing(true);
      if (decision === 'approve') {
        await api.post(`/admin/users/${userId}/verify`);
      } else {
        await api.post(`/admin/users/${userId}/reject`, { reason });
      }
      
      // Remove processed user from queue and select next
      const newQueue = verificationQueue.filter(user => user._id !== userId);
      setVerificationQueue(newQueue);
      setSelectedUser(newQueue.length > 0 ? newQueue[0] : null);
    } catch (error) {
      console.error(`Failed to ${decision} user:`, error);
      alert(`Failed to ${decision} user. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Filter users based on selected filter
  const filteredUsers = verificationQueue.filter(user => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  const stats = {
    total: verificationQueue.length,
    tutors: verificationQueue.filter(u => u.role === 'tutor').length,
    students: verificationQueue.filter(u => u.role === 'student').length
  };

  return (
    <div className="admin-layout">
      <AdminSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      <div className={`admin-content ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        {/* Modern Header */}
        <header className="verification-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="page-title">
                <span className="title-icon">🔍</span>
                User Verification Center
              </h1>
              <p className="page-subtitle">Review and approve pending user registrations</p>
            </div>
            
            <div className="header-right">
              <div className="stats-summary">
                <div className="stat-item total">
                  <span className="stat-number">{stats.total}</span>
                  <span className="stat-label">Total Pending</span>
                </div>
                <div className="stat-item tutors">
                  <span className="stat-number">{stats.tutors}</span>
                  <span className="stat-label">Tutors</span>
                </div>
                <div className="stat-item students">
                  <span className="stat-number">{stats.students}</span>
                  <span className="stat-label">Students</span>
                </div>
              </div>
              
              <button 
                className="refresh-button"
                onClick={fetchVerificationQueue}
                disabled={loading}
                title="Refresh verification queue"
              >
                <span className="refresh-icon">🔄</span>
                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* Controls and Filters */}
        <div className="verification-controls">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Users ({stats.total})
            </button>
            <button 
              className={`filter-tab ${filter === 'tutor' ? 'active' : ''}`}
              onClick={() => setFilter('tutor')}
            >
              👨‍🏫 Tutors ({stats.tutors})
            </button>
            <button 
              className={`filter-tab ${filter === 'student' ? 'active' : ''}`}
              onClick={() => setFilter('student')}
            >
              🎓 Students ({stats.students})
            </button>
          </div>

          <div className="view-controls">
            <span className="view-label">View:</span>
            <div className="view-toggles">
              <button 
                className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                ⊞
              </button>
              <button 
                className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                ≡
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="verification-main">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <h3>Loading verification queue...</h3>
              <p>Fetching pending user registrations</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-container">
              <div className="empty-illustration">
                {filter === 'all' ? '🎉' : filter === 'tutor' ? '👨‍🏫' : '🎓'}
              </div>
              <h3>No {filter === 'all' ? '' : filter + ' '}users pending verification</h3>
              <p>
                {filter === 'all' 
                  ? 'All user registrations have been processed!' 
                  : `No ${filter}s currently awaiting verification.`}
              </p>
              <button className="refresh-empty-btn" onClick={fetchVerificationQueue}>
                🔄 Check for new registrations
              </button>
            </div>
          ) : (
            <>
              {/* User Cards */}
              <div className={`users-container ${viewMode}`}>
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className={`user-card ${selectedUser?._id === user._id ? 'selected' : ''} ${user.role}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="card-header">
                      <div className="user-avatar">
                        <span className="avatar-icon">
                          {user.type === 'Student' ? '🎓' : '👨‍🏫'}
                        </span>
                        <div className="user-type-badge">{user.type}</div>
                      </div>
                      <div className="user-basic-info">
                        <h4 className="user-name">{user.name || 'Unknown'}</h4>
                        <p className="user-email">{user.email}</p>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="user-details">
                        {user.phone && (
                          <div className="detail-item">
                            <span className="detail-icon">📞</span>
                            <span className="detail-text">{user.phone}</span>
                          </div>
                        )}
                        {user.location && (
                          <div className="detail-item">
                            <span className="detail-icon">📍</span>
                            <span className="detail-text">
                              {typeof user.location === 'object' 
                                ? `${user.location.area}, ${user.location.district}` 
                                : user.location}
                            </span>
                          </div>
                        )}
                        {user.subjects && user.subjects.length > 0 && (
                          <div className="detail-item">
                            <span className="detail-icon">📚</span>
                            <span className="detail-text">{user.subjects.join(', ')}</span>
                          </div>
                        )}
                        {user.grade && (
                          <div className="detail-item">
                            <span className="detail-icon">🎯</span>
                            <span className="detail-text">Grade {user.grade}</span>
                          </div>
                        )}
                      </div>

                      <div className="documents-info">
                        <div className="documents-count">
                          <span className="doc-icon">📄</span>
                          <span className="doc-text">
                            {user.documents ? user.documents.length : 0} documents
                          </span>
                        </div>
                        <div className="registration-date">
                          <span className="date-icon">📅</span>
                          <span className="date-text">
                            {user.createdAt 
                              ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Unknown date'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="card-actions">
                      <button
                        className="quick-approve"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecision(user._id, 'approve');
                        }}
                        disabled={processing}
                        title="Quick approve"
                      >
                        ✅ Approve
                      </button>
                      <button
                        className="quick-reject"
                        onClick={(e) => {
                          e.stopPropagation();
                          const reason = prompt('Enter rejection reason (optional):');
                          if (reason !== null) {
                            handleDecision(user._id, 'reject', reason);
                          }
                        }}
                        disabled={processing}
                        title="Quick reject"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected User Detail Panel */}
              {selectedUser && (
                <div className="user-detail-panel">
                  <div className="detail-header">
                    <h3>📋 Detailed Review: {selectedUser.name}</h3>
                    <button 
                      className="close-detail"
                      onClick={() => setSelectedUser(null)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="detail-content">
                    <div className="user-full-info">
                      <div className="info-section">
                        <h4>👤 Personal Information</h4>
                        <div className="info-grid">
                          <div className="info-item">
                            <label>Name:</label>
                            <span>{selectedUser.name || 'Not provided'}</span>
                          </div>
                          <div className="info-item">
                            <label>Email:</label>
                            <span>{selectedUser.email}</span>
                          </div>
                          <div className="info-item">
                            <label>Phone:</label>
                            <span>{selectedUser.phone || 'Not provided'}</span>
                          </div>
                          <div className="info-item">
                            <label>Role:</label>
                            <span className={`role-badge ${selectedUser.role}`}>
                              {selectedUser.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="info-section">
                        <h4>📚 Academic Information</h4>
                        <div className="info-grid">
                          {selectedUser.subjects && selectedUser.subjects.length > 0 && (
                            <div className="info-item full-width">
                              <label>Subjects:</label>
                              <div className="subjects-list">
                                {selectedUser.subjects.map((subject, index) => (
                                  <span key={index} className="subject-tag">{subject}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedUser.grade && (
                            <div className="info-item">
                              <label>Grade:</label>
                              <span>{selectedUser.grade}</span>
                            </div>
                          )}
                          {selectedUser.location && (
                            <div className="info-item">
                              <label>Location:</label>
                              <span>
                                {typeof selectedUser.location === 'object'
                                  ? `${selectedUser.location.area}, ${selectedUser.location.district}`
                                  : selectedUser.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="info-section">
                        <h4>📄 Uploaded Documents</h4>
                        {selectedUser.documents && selectedUser.documents.length > 0 ? (
                          <div className="documents-grid">
                            {selectedUser.documents.map((doc, index) => (
                              <div key={index} className="document-item">
                                <div className="doc-info">
                                  <span className="doc-icon">📎</span>
                                  <div className="doc-details">
                                    <span className="doc-name">{doc.name || `Document ${index + 1}`}</span>
                                    <span className="doc-type">{doc.type || 'Unknown type'}</span>
                                  </div>
                                </div>
                                {doc.url && (
                                  <a 
                                    href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${doc.url}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="view-doc-btn"
                                  >
                                    👁️ View
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="no-documents">
                            <span className="no-docs-icon">📭</span>
                            <p>No documents uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="decision-section">
                      <h4>⚖️ Verification Decision</h4>
                      
                      <div className="verification-guidelines">
                        <h5>📋 Verification Checklist:</h5>
                        <ul>
                          <li>✅ Clear, readable documents</li>
                          <li>✅ Valid student/tutor credentials</li>
                          <li>✅ Contact information matches</li>
                          <li>✅ Profile information complete</li>
                          <li>❌ Blurry or fake documents</li>
                          <li>❌ Suspicious or incomplete info</li>
                        </ul>
                      </div>

                      <div className="decision-buttons">
                        <button
                          className="decision-btn approve-btn"
                          onClick={() => handleDecision(selectedUser._id, 'approve')}
                          disabled={processing}
                        >
                          <span className="btn-icon">✅</span>
                          <div className="btn-content">
                            <span className="btn-title">Approve User</span>
                            <span className="btn-subtitle">Grant full access</span>
                          </div>
                        </button>

                        <button
                          className="decision-btn reject-btn"
                          onClick={() => {
                            const reason = prompt('Enter rejection reason (optional):');
                            if (reason !== null) {
                              handleDecision(selectedUser._id, 'reject', reason);
                            }
                          }}
                          disabled={processing}
                        >
                          <span className="btn-icon">❌</span>
                          <div className="btn-content">
                            <span className="btn-title">Reject User</span>
                            <span className="btn-subtitle">Deny access with reason</span>
                          </div>
                        </button>
                      </div>

                      {processing && (
                        <div className="processing-indicator">
                          <div className="processing-spinner"></div>
                          <span>Processing decision...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVerification;
