// frontend/src/pages/student/ApplicationsManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import StudentSidebar from "../../components/StudentSidebar";
import ChatWindow from "../../components/ChatWindow";
import "./ApplicationsManagement.css";

const statusTabs = [
  { key: 'all', label: 'All Applications', color: '#64748b' },
  { key: 'submitted', label: 'New', color: '#3b82f6' },
  { key: 'shortlisted', label: 'Shortlisted', color: '#f59e0b' },
  { key: 'accepted', label: 'Accepted', color: '#10b981' },
  { key: 'rejected', label: 'Rejected', color: '#ef4444' }
];

const ApplicationsManagement = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Chat State
  const [chatWindow, setChatWindow] = useState({
    isOpen: false,
    chatId: null,
    chatType: null,
    tutorName: '',
    postTitle: ''
  });
  
  // Data
  const [applications, setApplications] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  
  // Filters
  const activeTab = searchParams.get('status') || 'all';
  const selectedJob = searchParams.get('job') || '';
  const searchQuery = searchParams.get('search') || '';

  // Load applications
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Build query params
      const params = new URLSearchParams();
      if (activeTab && activeTab !== 'all') params.append('status', activeTab);
      if (selectedJob) params.append('post', selectedJob);
      if (searchQuery) params.append('search', searchQuery);

      console.log('🔄 Fetching applications with params:', params.toString());
      const response = await api.get(`/student/applications?${params}`);
      console.log('✅ Applications API response:', response.data);
      
      const { applications: fetchedApplications, counts } = response.data;

      setApplications(fetchedApplications || []);
      setStatusCounts(counts || {});
      
      console.log(`📊 Loaded ${fetchedApplications?.length || 0} applications`);
    } catch (error) {
      console.error("❌ Error fetching applications:", error);
      console.error("❌ Error details:", error.response?.data);
      setError("Failed to load applications. Please try again.");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedJob, searchQuery]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

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

  // Application action handlers
  const handleApplicationAction = async (applicationId, action, reason = '') => {
    try {
      const endpoint = `/student/applications/${applicationId}/${action}`;
      const payload = reason ? { reason } : {};
      
      await api.post(endpoint, payload);
      
      const actionMessages = {
        shortlist: 'Application shortlisted successfully',
        accept: 'Application accepted successfully',
        reject: 'Application rejected successfully'
      };
      
      console.log(`✅ ${actionMessages[action]}`);
      
      // If shortlisted or accepted, find the chat room and open it
      if (action === 'shortlist' || action === 'accept') {
        const application = applications.find(app => app._id === applicationId);
        if (application) {
          try {
            // Create or get existing chat room
            const chatResponse = await api.post('/chat/rooms', {
              postId: application.post._id,
              tutorId: application.tutor._id
            });
            
            // Open chat window
            setChatWindow({
              isOpen: true,
              chatId: chatResponse.data._id,
              chatType: action === 'accept' ? 'full' : 'interview',
              tutorName: application.tutor.name,
              postTitle: application.post.title
            });
            
            console.log(`📱 Opened ${action === 'accept' ? 'full' : 'interview'} chat`);
          } catch (chatError) {
            console.error('Failed to create chat room:', chatError);
            // Don't fail the whole action if chat creation fails
          }
        }
      }
      
      // Refresh applications
      await fetchApplications();
      
    } catch (error) {
      console.error(`❌ Error with ${action}:`, error);
      setError(error.response?.data?.message || `Failed to ${action} application`);
    }
  };

  // Open chat for existing applications
  const openChat = async (application) => {
    try {
      // Try to get existing chat room
      const chatRoomsResponse = await api.get('/chat/rooms', {
        params: { jobId: application.post._id }
      });
      
      const existingChat = chatRoomsResponse.data.find(
        chat => chat.tutor._id === application.tutor._id
      );
      
      if (existingChat) {
        setChatWindow({
          isOpen: true,
          chatId: existingChat._id,
          chatType: existingChat.chatType,
          tutorName: application.tutor.name,
          postTitle: application.post.title
        });
      } else {
        // Create new chat room if it doesn't exist
        const chatResponse = await api.post('/chat/rooms', {
          postId: application.post._id,
          tutorId: application.tutor._id
        });
        
        setChatWindow({
          isOpen: true,
          chatId: chatResponse.data._id,
          chatType: application.status === 'accepted' ? 'full' : 'interview',
          tutorName: application.tutor.name,
          postTitle: application.post.title
        });
      }
    } catch (error) {
      console.error('Failed to open chat:', error);
      setError('Failed to open chat. Please try again.');
    }
  };

  // Close chat window
  const closeChatWindow = () => {
    setChatWindow({
      isOpen: false,
      chatId: null,
      chatType: null,
      tutorName: '',
      postTitle: ''
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      submitted: 'status-submitted',
      shortlisted: 'status-shortlisted', 
      accepted: 'status-accepted',
      rejected: 'status-rejected'
    };
    return statusMap[status] || 'status-default';
  };

  // Format budget
  const formatBudget = (post) => {
    if (post?.budgetAmount) {
      const typeMap = {
        hourly: '/hour',
        monthly: '/month',
        per_session: '/session',
        total: ' total'
      };
      return `৳${post.budgetAmount}${typeMap[post.paymentType] || ''}`;
    }
    return 'Budget not specified';
  };

  return (
    <div className="applications-management">
      <StudentSidebar 
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
      
      <div className={`applications-content ${!isSidebarCollapsed ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Header */}
        <div className="applications-header">
          <div className="header-main">
            <h1 className="page-title">Applications Management</h1>
            <p className="page-subtitle">Review and manage tutor applications for your job posts</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="status-tabs">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              className={`status-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
              style={{ '--tab-color': tab.color }}
            >
              <span className="tab-label">{tab.label}</span>
              {statusCounts[tab.key] !== undefined && (
                <span className="tab-count">{statusCounts[tab.key]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="applications-filters">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search by tutor name, subject, or job title..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                if (e.target.value.trim()) {
                  params.set('search', e.target.value.trim());
                } else {
                  params.delete('search');
                }
                setSearchParams(params);
              }}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* Applications List */}
        <div className="applications-list">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No Applications Yet</h3>
              <p>When tutors apply to your job posts, you'll see them here.</p>
              <button 
                className="cta-button"
                onClick={() => navigate('/s/jobs')}
              >
                View My Job Posts
              </button>
            </div>
          ) : (
            <div className="applications-table">
              {applications.map(application => (
                <div key={application._id} className="application-card">
                  <div className="application-header">
                    <div className="tutor-info">
                      <div className="tutor-avatar">
                        {application.tutor?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="tutor-details">
                        <h3 className="tutor-name">{application.tutor?.name || 'Unknown Tutor'}</h3>
                        <p className="tutor-email">{application.tutor?.email}</p>
                      </div>
                    </div>
                    <div className="application-meta">
                      <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                        {application.status}
                      </span>
                      <span className="application-date">{formatDate(application.createdAt)}</span>
                    </div>
                  </div>

                  <div className="job-info">
                    <div className="job-title">
                      <strong>{application.post?.title || 'Untitled Job'}</strong>
                    </div>
                    <div className="job-details">
                      <span className="job-subjects">
                        {application.post?.subjects?.join(', ') || 'No subjects listed'}
                      </span>
                      <span className="job-budget">{formatBudget(application.post)}</span>
                    </div>
                  </div>

                  {application.message && (
                    <div className="application-message">
                      <p>{application.message}</p>
                    </div>
                  )}

                  <div className="application-actions">
                    <button
                      className="action-button view"
                      onClick={() => {
                        setSelectedApplication(application);
                        setShowDetailModal(true);
                      }}
                    >
                      <span className="action-icon">👁️</span>
                      View Details
                    </button>

                    {application.status === 'submitted' && (
                      <>
                        <button
                          className="action-button shortlist"
                          onClick={() => handleApplicationAction(application._id, 'shortlist')}
                        >
                          <span className="action-icon">⭐</span>
                          Shortlist
                        </button>
                        <button
                          className="action-button accept"
                          onClick={() => handleApplicationAction(application._id, 'accept')}
                        >
                          <span className="action-icon">✅</span>
                          Accept
                        </button>
                        <button
                          className="action-button reject"
                          onClick={() => handleApplicationAction(application._id, 'reject')}
                        >
                          <span className="action-icon">❌</span>
                          Reject
                        </button>
                      </>
                    )}

                    {application.status === 'shortlisted' && (
                      <>
                        <button
                          className="action-button chat"
                          onClick={() => openChat(application)}
                        >
                          <span className="action-icon">💬</span>
                          Interview Chat
                        </button>
                        <button
                          className="action-button accept"
                          onClick={() => handleApplicationAction(application._id, 'accept')}
                        >
                          <span className="action-icon">✅</span>
                          Accept
                        </button>
                        <button
                          className="action-button reject"
                          onClick={() => handleApplicationAction(application._id, 'reject')}
                        >
                          <span className="action-icon">❌</span>
                          Reject
                        </button>
                      </>
                    )}

                    {application.status === 'accepted' && (
                      <button
                        className="action-button chat"
                        onClick={() => openChat(application)}
                      >
                        <span className="action-icon">💬</span>
                        Full Chat
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="application-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application Details</h2>
              <button 
                className="close-button"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              {/* Tutor Information */}
              <div className="detail-section">
                <h3>Tutor Information</h3>
                <div className="tutor-profile">
                  <div className="profile-header">
                    <div className="tutor-avatar large">
                      {selectedApplication.tutor?.profilePicture ? (
                        <img 
                          src={selectedApplication.tutor.profilePicture} 
                          alt={selectedApplication.tutor?.name} 
                        />
                      ) : (
                        selectedApplication.tutor?.name?.[0]?.toUpperCase() || '?'
                      )}
                    </div>
                    <div className="profile-info">
                      <h4>{selectedApplication.tutor?.name}</h4>
                      <p className="email">📧 {selectedApplication.tutor?.email}</p>
                      {selectedApplication.tutor?.phone && (
                        <p className="phone">📞 {selectedApplication.tutor.phone}</p>
                      )}
                      <div className="verification-badge">
                        <span className={`status ${selectedApplication.tutor?.verificationStatus || 'pending'}`}>
                          {selectedApplication.tutor?.verificationStatus === 'verified' ? '✅ Verified' : '⏳ Pending'}
                        </span>
                      </div>
                      <p className="member-since">
                        👤 Member since {formatDate(selectedApplication.tutor?.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Enhanced Tutor Details */}
                  <div className="profile-details">
                    {selectedApplication.tutor?.bio && (
                      <div className="bio-section">
                        <h5>📝 About the Tutor</h5>
                        <p>{selectedApplication.tutor.bio}</p>
                      </div>
                    )}
                    
                    {/* Experience & Education */}
                    <div className="credentials-section">
                      <h5>🎓 Credentials & Experience</h5>
                      <div className="credentials-grid">
                        {selectedApplication.tutor?.experience && (
                          <div className="credential-item">
                            <strong>Experience:</strong> 
                            <span>{selectedApplication.tutor.experience} years</span>
                          </div>
                        )}
                        {selectedApplication.tutor?.education && (
                          <div className="credential-item">
                            <strong>Education:</strong> 
                            <span>{selectedApplication.tutor.education}</span>
                          </div>
                        )}
                        {selectedApplication.tutor?.specializations?.length > 0 && (
                          <div className="credential-item">
                            <strong>Specializations:</strong> 
                            <div className="specializations-tags">
                              {selectedApplication.tutor.specializations.map((spec, idx) => (
                                <span key={idx} className="specialization-tag">{spec}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedApplication.tutor?.location && (
                          <div className="credential-item">
                            <strong>📍 Location:</strong> 
                            <span>
                              {typeof selectedApplication.tutor.location === 'string' 
                                ? selectedApplication.tutor.location
                                : selectedApplication.tutor.location.address || 'Location specified'
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Ratings & Reviews */}
                    {(selectedApplication.tutor?.rating || selectedApplication.tutor?.reviewCount) && (
                      <div className="rating-section">
                        <h5>⭐ Ratings & Reviews</h5>
                        <div className="rating-display">
                          {selectedApplication.tutor?.rating && (
                            <div className="rating-stars">
                              <span className="rating-score">{selectedApplication.tutor.rating.toFixed(1)}</span>
                              <div className="stars">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={`star ${i < Math.floor(selectedApplication.tutor.rating) ? 'filled' : ''}`}>
                                    ⭐
                                  </span>
                                ))}
                              </div>
                              {selectedApplication.tutor?.reviewCount && (
                                <span className="review-count">({selectedApplication.tutor.reviewCount} reviews)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div className="detail-section">
                <h3>📚 Job Information</h3>
                <div className="job-summary">
                  <h4>{selectedApplication.post?.title}</h4>
                  <div className="job-meta-grid">
                    <div className="job-meta-item">
                      <strong>📚 Subjects:</strong>
                      <span>{selectedApplication.post?.subjects?.join(', ')}</span>
                    </div>
                    <div className="job-meta-item">
                      <strong>🎓 Education Level:</strong>
                      <span>{selectedApplication.post?.educationLevel}</span>
                    </div>
                    <div className="job-meta-item">
                      <strong>📍 Location:</strong>
                      <span>{selectedApplication.post?.area}</span>
                    </div>
                    <div className="job-meta-item">
                      <strong>💰 Budget:</strong>
                      <span>{formatBudget(selectedApplication.post)}</span>
                    </div>
                    {selectedApplication.post?.teachingMode && (
                      <div className="job-meta-item">
                        <strong>🏠 Teaching Mode:</strong>
                        <span>{selectedApplication.post.teachingMode.replace('_', ' ')}</span>
                      </div>
                    )}
                    <div className="job-meta-item">
                      <strong>📊 Status:</strong>
                      <span className={`status-badge ${selectedApplication.post?.status}`}>
                        {selectedApplication.post?.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div className="detail-section">
                <h3>📋 Application Details</h3>
                <div className="application-info">
                  <div className="app-detail-grid">
                    <div className="app-detail-item">
                      <strong>📅 Applied On:</strong>
                      <span>{formatDate(selectedApplication.createdAt)}</span>
                    </div>
                    <div className="app-detail-item">
                      <strong>⏰ Status:</strong>
                      <span className={`status-badge ${selectedApplication.status}`}>
                        {selectedApplication.status}
                      </span>
                    </div>
                    {selectedApplication.pitch && (
                      <div className="app-detail-item full-width">
                        <strong>💡 Tutor's Pitch:</strong>
                        <p className="pitch-content">{selectedApplication.pitch}</p>
                      </div>
                    )}
                    {selectedApplication.availability && selectedApplication.availability.length > 0 && (
                      <div className="app-detail-item full-width">
                        <strong>🗓️ Availability:</strong>
                        <div className="availability-list">
                          {selectedApplication.availability.map((slot, idx) => (
                            <span key={idx} className="availability-tag">
                              {slot.day} {slot.time}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Application Message */}
              {selectedApplication.message && (
                <div className="detail-section">
                  <h3>Application Message</h3>
                  <div className="message-content">
                    <p>{selectedApplication.message}</p>
                  </div>
                </div>
              )}

              {/* Application Timeline */}
              <div className="detail-section">
                <h3>Application Timeline</h3>
                <div className="timeline">
                  <div className="timeline-item completed">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-title">Application Submitted</div>
                      <div className="timeline-date">{formatDate(selectedApplication.createdAt)}</div>
                    </div>
                  </div>
                  
                  {selectedApplication.shortlistedAt && (
                    <div className="timeline-item completed">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Shortlisted</div>
                        <div className="timeline-date">{formatDate(selectedApplication.shortlistedAt)}</div>
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.status === 'accepted' && selectedApplication.acceptedAt && (
                    <div className="timeline-item completed">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Accepted</div>
                        <div className="timeline-date">{formatDate(selectedApplication.acceptedAt)}</div>
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.status === 'rejected' && selectedApplication.rejectedAt && (
                    <div className="timeline-item completed">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Rejected</div>
                        <div className="timeline-date">{formatDate(selectedApplication.rejectedAt)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-actions">
              {selectedApplication.status === 'submitted' && (
                <>
                  <button
                    className="action-button shortlist"
                    onClick={() => {
                      handleApplicationAction(selectedApplication._id, 'shortlist');
                      setShowDetailModal(false);
                    }}
                  >
                    ⭐ Shortlist
                  </button>
                  <button
                    className="action-button accept"
                    onClick={() => {
                      handleApplicationAction(selectedApplication._id, 'accept');
                      setShowDetailModal(false);
                    }}
                  >
                    ✅ Accept
                  </button>
                  <button
                    className="action-button reject"
                    onClick={() => {
                      handleApplicationAction(selectedApplication._id, 'reject');
                      setShowDetailModal(false);
                    }}
                  >
                    ❌ Reject
                  </button>
                </>
              )}

              {selectedApplication.status === 'shortlisted' && (
                <>
                  <button
                    className="action-button accept"
                    onClick={() => {
                      handleApplicationAction(selectedApplication._id, 'accept');
                      setShowDetailModal(false);
                    }}
                  >
                    ✅ Accept
                  </button>
                  <button
                    className="action-button reject"
                    onClick={() => {
                      handleApplicationAction(selectedApplication._id, 'reject');
                      setShowDetailModal(false);
                    }}
                  >
                    ❌ Reject
                  </button>
                </>
              )}

              {selectedApplication.status === 'accepted' && (
                <button
                  className="action-button contact"
                  onClick={() => {
                    navigate(`/chat/${selectedApplication.post._id}-${selectedApplication.tutor._id}`);
                    setShowDetailModal(false);
                  }}
                >
                  💬 Message Tutor
                </button>
              )}

              <button
                className="action-button secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      <ChatWindow
        chatId={chatWindow.chatId}
        chatType={chatWindow.chatType}
        tutorName={chatWindow.tutorName}
        postTitle={chatWindow.postTitle}
        isOpen={chatWindow.isOpen}
        onClose={closeChatWindow}
      />
    </div>
  );
};

export default ApplicationsManagement;
