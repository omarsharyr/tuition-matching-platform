import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './ApplicationManager.css';

const ApplicationManager = ({ postId, onClose }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const tabs = [
    { key: 'all', label: 'All Applications' },
    { key: 'applied', label: 'New' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'accepted', label: 'Accepted' }
  ];

  useEffect(() => {
    fetchApplications();
  }, [postId]);

  const fetchApplications = async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/applications/posts/${postId}/applications`);
      setApplications(response.data || []);
      console.log('✅ Applications fetched:', response.data?.length || 0);
    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId, action) => {
    try {
      await api.patch(`/applications/${applicationId}/${action}`);
      console.log(`✅ Application ${action}ed successfully`);
      
      // Refresh applications
      await fetchApplications();
    } catch (error) {
      console.error(`❌ Error ${action}ing application:`, error);
      alert(error.response?.data?.message || `Failed to ${action} application`);
    }
  };

  const getFilteredApplications = () => {
    if (selectedTab === 'all') return applications;
    if (selectedTab === 'applied') return applications.filter(app => app.status === 'applied');
    return applications.filter(app => app.status === selectedTab);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      applied: { class: 'status-applied', text: 'New Application' },
      shortlisted: { class: 'status-shortlisted', text: 'Shortlisted' },
      accepted: { class: 'status-accepted', text: 'Accepted' },
      rejected: { class: 'status-rejected', text: 'Rejected' }
    };

    const config = statusConfig[status] || { class: 'status-unknown', text: status };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (!postId) return null;

  return (
    <div className="application-manager">
      <div className="manager-header">
        <h3>Manage Applications</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="manager-tabs">
        <button
          className={`tab-btn ${selectedTab === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedTab('all')}
        >
          All ({applications.length})
        </button>
        <button
          className={`tab-btn ${selectedTab === 'applied' ? 'active' : ''}`}
          onClick={() => setSelectedTab('applied')}
        >
          New ({applications.filter(app => app.status === 'applied').length})
        </button>
        <button
          className={`tab-btn ${selectedTab === 'shortlisted' ? 'active' : ''}`}
          onClick={() => setSelectedTab('shortlisted')}
        >
          Shortlisted ({applications.filter(app => app.status === 'shortlisted').length})
        </button>
        <button
          className={`tab-btn ${selectedTab === 'accepted' ? 'active' : ''}`}
          onClick={() => setSelectedTab('accepted')}
        >
          Accepted ({applications.filter(app => app.status === 'accepted').length})
        </button>
      </div>

      <div className="applications-list">
        {loading ? (
          <div className="loading-state">Loading applications...</div>
        ) : getFilteredApplications().length === 0 ? (
          <div className="empty-state">
            <p>
              {selectedTab === 'all' 
                ? 'No applications received yet.'
                : `No ${selectedTab} applications.`
              }
            </p>
          </div>
        ) : (
          getFilteredApplications().map(application => (
            <div key={application._id} className="application-item">
              <div className="applicant-info">
                <div className="applicant-header">
                  <h4 className="applicant-name">{application.tutor?.name || 'Unknown Tutor'}</h4>
                  {getStatusBadge(application.status)}
                </div>
                
                <div className="applicant-details">
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{application.tutor?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{application.tutor?.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Experience:</span>
                    <span className="detail-value">{application.experience || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Expected Rate:</span>
                    <span className="detail-value">
                      ৳{application.expectedRate || 'Not specified'}/month
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Applied:</span>
                    <span className="detail-value">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {application.message && (
                  <div className="application-message">
                    <strong>Message:</strong>
                    <p>{application.message}</p>
                  </div>
                )}
              </div>

              <div className="application-actions">
                {application.status === 'applied' && (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleApplicationAction(application._id, 'shortlist')}
                    >
                      Shortlist
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleApplicationAction(application._id, 'reject')}
                    >
                      Reject
                    </button>
                  </>
                )}
                
                {application.status === 'shortlisted' && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => handleApplicationAction(application._id, 'select')}
                    >
                      Accept & Hire
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleApplicationAction(application._id, 'reject')}
                    >
                      Reject
                    </button>
                  </>
                )}
                
                {application.status === 'accepted' && (
                  <div className="accepted-info">
                    <span className="success-text">✅ Hired!</span>
                    <button className="btn btn-outline">
                      Contact Tutor
                    </button>
                  </div>
                )}
                
                {application.status === 'rejected' && (
                  <span className="rejected-text">❌ Rejected</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicationManager;
