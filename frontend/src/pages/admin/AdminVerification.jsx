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
      
      if (queue.length > 0 && !selectedUser) {
        setSelectedUser(queue[0]);
        console.log('👤 AdminVerification: Selected first user:', queue[0]);
      }
      
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
      
      // Remove from queue and select next user
      const newQueue = verificationQueue.filter(user => user._id !== userId);
      setVerificationQueue(newQueue);
      
      if (selectedUser?._id === userId) {
        setSelectedUser(newQueue.length > 0 ? newQueue[0] : null);
      }
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

  return (
    <div className="admin-layout">
      <AdminSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      <div className={`admin-content ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        {/* DEBUG SECTION - Remove in production */}
        <div style={{background: '#f0f0f0', padding: '10px', margin: '10px', fontSize: '12px'}}>
          <strong>🔍 DEBUG INFO:</strong><br/>
          Loading: {loading ? 'YES' : 'NO'}<br/>
          Queue Length: {verificationQueue.length}<br/>
          Selected User: {selectedUser ? selectedUser.name : 'None'}<br/>
          Processing: {processing ? 'YES' : 'NO'}
        </div>
        
        <header className="admin-header">
          <div className="header-left">
            <h1 className="page-title">Verification Queue</h1>
            <p className="page-subtitle">Review and approve user documents</p>
          </div>
          <div className="header-right">
            <div className="queue-stats">
              <span className="queue-count">{verificationQueue.length}</span>
              <span className="queue-label">Pending</span>
            </div>
          </div>
        </header>

        <div className="verification-container">
          {/* User List Sidebar */}
          <div className="user-list-panel">
            <div className="user-list-header">
              <h3>Pending Users</h3>
              <button 
                className="refresh-btn"
                onClick={fetchVerificationQueue}
                disabled={loading}
              >
                🔄
              </button>
            </div>
            
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading queue...</p>
                <p className="debug-info">Debug: Fetching pending verifications...</p>
              </div>
            ) : verificationQueue.length === 0 ? (
              <div className="empty-queue">
                <span className="empty-icon">🎉</span>
                <h4>No pending verifications!</h4>
                <p>All users have been processed.</p>
                <p className="debug-info">Debug: Queue length is {verificationQueue.length}</p>
              </div>
            ) : (
              <div className="user-list">
                <div className="debug-info">Debug: Showing {verificationQueue.length} users</div>
                {verificationQueue.map((user) => (
                  <div
                    key={user._id}
                    className={`user-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="user-avatar">
                      {user.type === 'Student' ? '🎓' : '👨‍🏫'}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.name || 'No name'}</div>
                      <div className="user-type">{user.type}</div>
                      <div className="user-email">{user.email || 'No email'}</div>
                    </div>
                    <div className="user-status">
                      <span className="status-badge pending">Pending</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document Viewer & Decision Panel */}
          {selectedUser ? (
            <div className="verification-panel">
              {/* User Details Header */}
              <div className="user-details-header">
                <div className="user-avatar-large">
                  {selectedUser.type === 'Student' ? '🎓' : '👨‍🏫'}
                </div>
                <div className="user-details">
                  <h2>{selectedUser.name || 'No name'}</h2>
                  <p className="user-email">{selectedUser.email || 'No email'}</p>
                  <div className="user-meta">
                    <span className="meta-item">
                      <span className="meta-label">Type:</span>
                      <span className="meta-value">{selectedUser.type}</span>
                    </span>
                    <span className="meta-item">
                      <span className="meta-label">Phone:</span>
                      <span className="meta-value">{selectedUser.phone || 'Not provided'}</span>
                    </span>
                    <span className="meta-item">
                      <span className="meta-label">Registered:</span>
                      <span className="meta-value">
                        {new Date(selectedUser.user?.createdAt || selectedUser.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="documents-section">
                <h3>Uploaded Documents</h3>
                
                {selectedUser.documents && selectedUser.documents.length > 0 ? (
                  <div className="documents-grid">
                    {selectedUser.documents.map((doc, index) => (
                      <div key={index} className="document-card">
                        <div className="document-preview">
                          {doc.mimetype?.startsWith('image/') ? (
                            <img 
                              src={`http://localhost:5000${doc.url}`} 
                              alt={doc.filename}
                              className="document-image"
                            />
                          ) : (
                            <div className="document-placeholder">
                              <span className="file-icon">📄</span>
                              <span className="file-type">
                                {doc.filename?.split('.').pop()?.toUpperCase() || 'FILE'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="document-info">
                          <div className="document-name">{doc.filename}</div>
                          <div className="document-size">
                            {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                          </div>
                        </div>
                        <div className="document-actions">
                          <button 
                            className="btn-view"
                            onClick={() => window.open(`http://localhost:5000${doc.url}`, '_blank')}
                          >
                            View Full
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-documents">
                    <span className="no-docs-icon">📋</span>
                    <p>No documents uploaded</p>
                  </div>
                )}
              </div>

              {/* Decision Panel */}
              <div className="decision-panel">
                <div className="decision-header">
                  <h3>Verification Decision</h3>
                  <div className="decision-timer">
                    <span className="timer-icon">⏱️</span>
                    <span>Review time: 2.3 min avg</span>
                  </div>
                </div>

                <div className="decision-actions">
                  <button
                    className="decision-btn approve"
                    onClick={() => handleDecision(selectedUser._id, 'approve')}
                    disabled={processing}
                  >
                    <span className="btn-icon">✅</span>
                    <span className="btn-text">
                      {processing ? 'Processing...' : 'Approve User'}
                    </span>
                  </button>

                  <button
                    className="decision-btn reject"
                    onClick={() => {
                      const reason = prompt('Enter rejection reason (optional):');
                      if (reason !== null) { // User didn't cancel
                        handleDecision(selectedUser._id, 'reject', reason);
                      }
                    }}
                    disabled={processing}
                  >
                    <span className="btn-icon">❌</span>
                    <span className="btn-text">Reject User</span>
                  </button>
                </div>

                <div className="decision-notes">
                  <h4>Verification Guidelines</h4>
                  <ul>
                    <li>✅ Clear, readable documents</li>
                    <li>✅ Valid student/tutor credentials</li>
                    <li>✅ Contact information matches</li>
                    <li>❌ Blurry or fake documents</li>
                    <li>❌ Suspicious or incomplete info</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <span className="no-selection-icon">📋</span>
              <h3>Select a user to review</h3>
              <p>Choose a user from the list to view their documents and make a verification decision.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVerification;
