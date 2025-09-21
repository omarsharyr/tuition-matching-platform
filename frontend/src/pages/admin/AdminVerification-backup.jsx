// frontend/src/pages/admin/AdminVerification.jsx
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import DocumentViewer from '../../components/DocumentViewer';
import api from '../../utils/api';
import '../../styles/AdminLayout.css';
import './AdminVerification.css';

const AdminVerification = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, tutor, student
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [notification, setNotification] = useState(null);

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
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const openDocumentViewer = (document) => {
    setSelectedDocument(document);
    setDocumentViewerOpen(true);
  };

  const closeDocumentViewer = () => {
    setSelectedDocument(null);
    setDocumentViewerOpen(false);
  };

  // Helper function to check if a document is an image
  const isImageDocument = (doc) => {
    if (doc.mimetype && doc.mimetype.startsWith('image/')) return true;
    const extension = doc.filename?.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
  };

  // Helper function to get document URL
  const getDocumentUrl = (doc) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}${doc.url}`;
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
      <AdminSidebar isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      <div className="admin-main">
        <div className={`admin-content ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        {/* Page Header */}
        <div className="admin-header">
          <div className="header-left">
            <h1 className="page-title">
              <span className="title-icon">�</span>
              User Verification
            </h1>
            <p className="page-subtitle">Review and approve pending user registrations</p>
          </div>
          
          <div className="header-right">
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total Pending</div>
              </div>
              <div className="stat-card tutors">
                <div className="stat-number">{stats.tutors}</div>
                <div className="stat-label">Tutors</div>
              </div>
              <div className="stat-card students">
                <div className="stat-number">{stats.students}</div>
                <div className="stat-label">Students</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            <span className="notification-icon">
              {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotification(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="page-controls">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({stats.total})
            </button>
            <button 
              className={`filter-tab ${filter === 'tutor' ? 'active' : ''}`}
              onClick={() => setFilter('tutor')}
            >
              Tutors ({stats.tutors})
            </button>
            <button 
              className={`filter-tab ${filter === 'student' ? 'active' : ''}`}
              onClick={() => setFilter('student')}
            >
              Students ({stats.students})
            </button>
          </div>
          
          <button 
            className="refresh-btn"
            onClick={fetchVerificationQueue}
            disabled={loading}
          >
            <span className="btn-icon">🔄</span>
            Refresh
          </button>
        </div>

        {/* Main Content - Two Panel Layout */}
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
            <div className="verification-layout">
              {/* Left Panel - User List */}
              <div className="users-panel">
                <div className="users-header">
                  <h3>
                    {filter === 'all' ? 'All Users' : filter === 'tutor' ? 'Tutors' : 'Students'} 
                    ({filteredUsers.length})
                  </h3>
                  <div className="view-controls-compact">
                    <button 
                      className={`view-toggle-compact ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      title="Grid view"
                    >
                      ⊞
                    </button>
                    <button 
                      className={`view-toggle-compact ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                      title="List view"
                    >
                      ≡
                    </button>
                  </div>
                </div>
                
                <div className={`users-container-panel ${viewMode}`}>
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className={`user-card-compact ${selectedUser?._id === user._id ? 'selected' : ''} ${user.role}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="card-header-compact">
                        <div className="user-avatar-compact">
                          <span className="avatar-icon-compact">
                            {user.type === 'Student' ? '🎓' : '👨‍🏫'}
                          </span>
                        </div>
                        <div className="user-basic-info-compact">
                          <h4 className="user-name-compact">{user.name || 'Unknown'}</h4>
                          <p className="user-email-compact">{user.email}</p>
                        </div>
                        <div className="user-status-compact">
                          <span className="status-badge pending">Pending</span>
                        </div>
                      </div>

                      <div className="card-meta-compact">
                        <div className="meta-item">
                          <span className="meta-icon">📄</span>
                          <span className="meta-text">{user.documents ? user.documents.length : 0} docs</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-icon">📅</span>
                          <span className="meta-text">
                            {user.createdAt 
                              ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : 'Unknown'}
                          </span>
                        </div>
                      </div>

                      <div className="card-actions-compact">
                        <button
                          className="quick-approve-compact"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDecision(user._id, 'approve');
                          }}
                          disabled={processing}
                          title="Quick approve"
                        >
                          ✅
                        </button>
                        <button
                          className="quick-reject-compact"
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
                          ❌
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel - User Details */}
              <div className="detail-panel">
                {selectedUser ? (
                  <>
                    <div className="detail-header">
                      <div className="detail-user-info">
                        <div className="detail-avatar">
                          {selectedUser.type === 'Student' ? '🎓' : '👨‍🏫'}
                        </div>
                        <div className="detail-user-basic">
                          <h2>{selectedUser.name}</h2>
                          <p>{selectedUser.email}</p>
                          <span className={`role-badge-detail ${selectedUser.role}`}>
                            {selectedUser.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-content-scrollable">
                      <div className="info-sections">
                        <div className="info-section-inline">
                          <h4>� Contact</h4>
                          <div className="info-grid-compact">
                            <div className="info-item-compact">
                              <label>Phone:</label>
                              <span>{selectedUser.phone || 'Not provided'}</span>
                            </div>
                            <div className="info-item-compact">
                              <label>Location:</label>
                              <span>
                                {selectedUser.location 
                                  ? (typeof selectedUser.location === 'object'
                                      ? `${selectedUser.location.area}, ${selectedUser.location.district}`
                                      : selectedUser.location)
                                  : 'Not provided'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="info-section-inline">
                          <h4>📚 Academic</h4>
                          <div className="info-content">
                            {selectedUser.subjects && selectedUser.subjects.length > 0 && (
                              <div className="subjects-compact">
                                <label>Subjects:</label>
                                <div className="subjects-list-compact">
                                  {selectedUser.subjects.map((subject, index) => (
                                    <span key={index} className="subject-tag-compact">{subject}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selectedUser.grade && (
                              <div className="grade-info">
                                <label>Grade:</label>
                                <span>{selectedUser.grade}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="info-section-inline">
                          <h4>📄 Documents</h4>
                          <div className="documents-compact">
                            {selectedUser.documents && selectedUser.documents.length > 0 ? (
                              <div className="documents-grid-compact">
                                {selectedUser.documents.map((doc, index) => (
                                  <div key={index} className="document-item-compact">
                                    {/* Show image thumbnail for image files */}
                                    {isImageDocument(doc) && (
                                      <div className="doc-thumbnail-container">
                                        <img 
                                          src={getDocumentUrl(doc)}
                                          alt={doc.filename || `Document ${index + 1}`}
                                          className="doc-thumbnail"
                                          onClick={() => openDocumentViewer(doc)}
                                          style={{ cursor: 'pointer' }}
                                        />
                                      </div>
                                    )}
                                    
                                    <div className="doc-info-compact">
                                      <span className="doc-icon-compact">
                                        {isImageDocument(doc) ? '🖼️' : '📎'}
                                      </span>
                                      <div className="doc-details-compact">
                                        <span className="doc-name-compact">{doc.filename || doc.name || `Document ${index + 1}`}</span>
                                        <span className="doc-type-compact">
                                          {doc.type === 'STUDENT_ID' ? 'Student ID' : 
                                           doc.type === 'EDU_DOC' ? 'Education Certificate' : 
                                           doc.type === 'PARENT_NID' ? 'Parent NID' : 
                                           doc.type || 'Document'}
                                        </span>
                                      </div>
                                    </div>
                                    <button 
                                      className="view-doc-btn-compact"
                                      onClick={() => openDocumentViewer(doc)}
                                    >
                                      {isImageDocument(doc) ? '🔍 Full Size' : '👁️ View'}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              // Demo documents if no real documents exist
                              <div className="documents-grid-compact">
                                <div className="document-item-compact">
                                  <div className="doc-info-compact">
                                    <span className="doc-icon-compact">📎</span>
                                    <div className="doc-details-compact">
                                      <span className="doc-name-compact">sample-student-id.txt</span>
                                      <span className="doc-type-compact">Student ID</span>
                                    </div>
                                  </div>
                                  <button 
                                    className="view-doc-btn-compact"
                                    onClick={() => openDocumentViewer({
                                      filename: 'sample-student-id.txt',
                                      type: 'STUDENT_ID',
                                      url: '/uploads/sample-student-id.txt',
                                      mimetype: 'text/plain',
                                      size: 375
                                    })}
                                  >
                                    👁️ View
                                  </button>
                                </div>
                                <div className="document-item-compact">
                                  <div className="doc-info-compact">
                                    <span className="doc-icon-compact">�</span>
                                    <div className="doc-details-compact">
                                      <span className="doc-name-compact">sample-education-cert.txt</span>
                                      <span className="doc-type-compact">Education Certificate</span>
                                    </div>
                                  </div>
                                  <button 
                                    className="view-doc-btn-compact"
                                    onClick={() => openDocumentViewer({
                                      filename: 'sample-education-cert.txt',
                                      type: 'EDU_DOC',
                                      url: '/uploads/sample-education-cert.txt',
                                      mimetype: 'text/plain',
                                      size: 520
                                    })}
                                  >
                                    👁️ View
                                  </button>
                                </div>
                                <div className="no-documents-note">
                                  <small style={{ color: '#6b7280', fontStyle: 'italic' }}>
                                    📝 Demo documents shown (real documents will appear here when users upload them)
                                  </small>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="decision-footer">
                      <div className="decision-buttons-horizontal">
                        <button
                          className="decision-btn-compact approve-btn"
                          onClick={() => handleDecision(selectedUser._id, 'approve')}
                          disabled={processing}
                        >
                          <span className="btn-icon">✅</span>
                          <span className="btn-text">Approve</span>
                        </button>

                        <button
                          className="decision-btn-compact reject-btn"
                          onClick={() => {
                            const reason = prompt('Enter rejection reason (optional):');
                            if (reason !== null) {
                              handleDecision(selectedUser._id, 'reject', reason);
                            }
                          }}
                          disabled={processing}
                        >
                          <span className="btn-icon">❌</span>
                          <span className="btn-text">Reject</span>
                        </button>
                      </div>

                      {processing && (
                        <div className="processing-indicator-compact">
                          <div className="processing-spinner-compact"></div>
                          <span>Processing...</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="no-selection">
                    <div className="no-selection-content">
                      <span className="no-selection-icon">👆</span>
                      <h3>Select a user to review</h3>
                      <p>Choose a user from the list to view their details and make verification decisions.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Document Viewer Modal */}
      <DocumentViewer
        document={selectedDocument}
        isOpen={documentViewerOpen}
        onClose={closeDocumentViewer}
      />
    </div>
  );
};

export default AdminVerification;
