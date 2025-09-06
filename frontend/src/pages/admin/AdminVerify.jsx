import React, { useEffect, useState, useCallback } from "react";
import DashboardFrame from "../../components/DashboardFrame";
import api from "../../utils/api";
import "../../styles/DashboardLayout.css";

export default function AdminVerify() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, tutor, student
  const [verifyModal, setVerifyModal] = useState({ open: false, user: null, action: null });
  const [adminNote, setAdminNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const loadVerificationQueue = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const params = filter !== 'all' ? `?role=${filter}` : '';
      const response = await api.get(`/admin/verification-queue${params}`);
      const queue = response.data || [];
      setVerificationQueue(queue);
      console.log(`✅ Verification queue refreshed: ${queue.length} pending users (filter: ${filter})`);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load verification queue.");
      console.error('❌ Failed to load verification queue:', e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadVerificationQueue();
    
    // Auto-refresh every 30 seconds to show new registrations
    const refreshInterval = setInterval(() => {
      loadVerificationQueue();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [loadVerificationQueue]);

  const handleVerificationAction = async (userId, action, note = '', reason = '') => {
    setProcessing(true);
    try {
      const endpoint = action === 'approve' ? 'verify' : 'reject';
      const payload = action === 'approve' 
        ? { adminNote: note }
        : { reason, adminNote: note };

      await api.post(`/admin/users/${userId}/${endpoint}`, payload);
      
      // Refresh the queue
      await loadVerificationQueue();
      
      // Close modal
      setVerifyModal({ open: false, user: null, action: null });
      setAdminNote('');
      setRejectionReason('');
      
      alert(`User ${action === 'approve' ? 'verified' : 'rejected'} successfully!`);
    } catch (e) {
      alert(e?.response?.data?.message || "Action failed");
    } finally {
      setProcessing(false);
    }
  };

  const openVerificationModal = (user, action) => {
    setVerifyModal({ open: true, user, action });
    setAdminNote('');
    setRejectionReason('');
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

  const getStatusBadge = (status) => {
    const colors = {
      pending: '#f59e0b',
      verified: '#10b981',
      rejected: '#ef4444'
    };
    return (
      <span 
        style={{
          backgroundColor: colors[status] || '#6b7280',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          textTransform: 'capitalize'
        }}
      >
        {status}
      </span>
    );
  };

  const filteredQueue = verificationQueue.filter(user => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  return (
    <DashboardFrame role="admin" title="User Verification Queue">
      {err && <div className="alert error" style={{ margin: '16px 0' }}>{err}</div>}

      <div className="panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="panel-title">Verification Queue ({filteredQueue.length})</h2>
          <div className="filter-controls">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="all">All Users</option>
              <option value="tutor">Tutors Only</option>
              <option value="student">Students Only</option>
            </select>
            <button 
              onClick={loadVerificationQueue}
              style={{ marginLeft: '8px', padding: '8px 12px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 200 }} />
        ) : filteredQueue.length === 0 ? (
          <div className="empty">
            <p>No users pending verification.</p>
          </div>
        ) : (
          <div className="verification-grid">
            {filteredQueue.map(user => (
              <div key={user._id} className="verification-card" style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                backgroundColor: '#f9fafb'
              }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>{user.name}</h3>
                    <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>{user.email}</p>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)} • Registered {formatDate(user.createdAt)}
                    </p>
                  </div>
                  {getStatusBadge(user.verificationStatus)}
                </div>

                {user.documents && user.documents.length > 0 && (
                  <div className="documents-section" style={{ marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Documents:</h4>
                    <div className="documents-list">
                      {user.documents.map((doc, index) => (
                        <div key={doc._id || index} style={{ marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>{doc.type.replace('_', ' ')}: </span>
                          <a 
                            href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${doc.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '12px', color: '#2563eb' }}
                          >
                            View Document
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card-actions" style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => openVerificationModal(user, 'approve')}
                    disabled={processing}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openVerificationModal(user, 'reject')}
                    disabled={processing}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {verifyModal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 16px 0' }}>
              {verifyModal.action === 'approve' ? 'Approve' : 'Reject'} User Verification
            </h3>
            
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
              <p style={{ margin: '0', fontWeight: 'bold' }}>{verifyModal.user?.name}</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                {verifyModal.user?.email} • {verifyModal.user?.role}
              </p>
            </div>

            {verifyModal.action === 'reject' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                  Rejection Reason *
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  required
                >
                  <option value="">Select a reason...</option>
                  <option value="Documents unclear or unreadable">Documents unclear or unreadable</option>
                  <option value="Invalid or fake documents">Invalid or fake documents</option>
                  <option value="Missing required documents">Missing required documents</option>
                  <option value="Information mismatch">Information mismatch</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                Admin Note (Optional)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add any additional notes..."
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setVerifyModal({ open: false, user: null, action: null })}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerificationAction(
                  verifyModal.user._id,
                  verifyModal.action,
                  adminNote,
                  rejectionReason
                )}
                disabled={processing || (verifyModal.action === 'reject' && !rejectionReason)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: verifyModal.action === 'approve' ? '#10b981' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  opacity: (processing || (verifyModal.action === 'reject' && !rejectionReason)) ? 0.5 : 1
                }}
              >
                {processing ? 'Processing...' : (verifyModal.action === 'approve' ? 'Approve' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardFrame>
  );
}
