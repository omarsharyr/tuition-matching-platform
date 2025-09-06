// frontend/src/components/SessionManager.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './SessionManager.css';

export default function SessionManager({ applicationId, onSessionCreated, userRole }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  
  // Form state for creating session
  const [sessionForm, setSessionForm] = useState({
    scheduledAt: '',
    duration: 60,
    sessionType: 'individual',
    notes: ''
  });

  // Fetch sessions
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sessions');
      setSessions(response.data?.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create session
  const createSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const sessionData = {
        applicationId,
        ...sessionForm,
        scheduledAt: new Date(sessionForm.scheduledAt).toISOString()
      };
      
      const response = await api.post('/sessions', sessionData);
      setSessions(prev => [response.data.session, ...prev]);
      setShowCreateModal(false);
      setSessionForm({ scheduledAt: '', duration: 60, sessionType: 'individual', notes: '' });
      
      if (onSessionCreated) {
        onSessionCreated(response.data.session);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update session status
  const updateSessionStatus = async (sessionId, action, data = {}) => {
    try {
      let response;
      
      switch (action) {
        case 'start':
          response = await api.put(`/sessions/${sessionId}/start`);
          break;
        case 'cancel':
          response = await api.delete(`/sessions/${sessionId}`, { data });
          break;
        case 'attendance':
          response = await api.put(`/sessions/${sessionId}/attendance`, data);
          break;
        default:
          response = await api.put(`/sessions/${sessionId}`, data);
      }

      setSessions(prev =>
        prev.map(session =>
          session._id === sessionId ? response.data.session : session
        )
      );
    } catch (error) {
      console.error(`Failed to ${action} session:`, error);
      alert(`Failed to ${action} session. Please try again.`);
    }
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      'scheduled': 'status-scheduled',
      'in-progress': 'status-in-progress',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-default';
  };

  // Filter sessions for current application if provided
  const relevantSessions = applicationId 
    ? sessions.filter(session => session.application?._id === applicationId)
    : sessions;

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="session-manager">
      <div className="session-header">
        <h3>Sessions</h3>
        {applicationId && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            disabled={loading}
          >
            Schedule Session
          </button>
        )}
      </div>

      {loading && <div className="loading-spinner">Loading sessions...</div>}

      {/* Sessions List */}
      <div className="sessions-list">
        {relevantSessions.length === 0 ? (
          <div className="no-sessions">
            {applicationId ? 'No sessions scheduled for this application' : 'No sessions found'}
          </div>
        ) : (
          relevantSessions.map(session => {
            const { date, time } = formatDateTime(session.scheduledAt);
            return (
              <div key={session._id} className="session-card">
                <div className="session-info">
                  <div className="session-header-info">
                    <h4>{session.post?.title || 'Session'}</h4>
                    <span className={`status-badge ${getStatusClass(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                  
                  <div className="session-details">
                    <div className="detail-item">
                      <span className="detail-label">📅 Date:</span>
                      <span>{date}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">⏰ Time:</span>
                      <span>{time}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">⏱️ Duration:</span>
                      <span>{session.duration} minutes</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">👥 Type:</span>
                      <span>{session.sessionType}</span>
                    </div>
                    
                    {userRole === 'student' ? (
                      <div className="detail-item">
                        <span className="detail-label">👨‍🏫 Tutor:</span>
                        <span>{session.tutor?.name}</span>
                      </div>
                    ) : (
                      <div className="detail-item">
                        <span className="detail-label">🎓 Student:</span>
                        <span>{session.student?.name}</span>
                      </div>
                    )}
                    
                    {session.attendance && (
                      <div className="detail-item">
                        <span className="detail-label">✅ Attendance:</span>
                        <span className={`attendance-${session.attendance}`}>
                          {session.attendance}
                        </span>
                      </div>
                    )}
                  </div>

                  {session.notes && (
                    <div className="session-notes">
                      <strong>Notes:</strong> {session.notes}
                    </div>
                  )}
                </div>

                {/* Session Actions */}
                <div className="session-actions">
                  {session.status === 'scheduled' && (
                    <>
                      <button 
                        onClick={() => updateSessionStatus(session._id, 'start')}
                        className="btn-success btn-sm"
                      >
                        Start Session
                      </button>
                      <button 
                        onClick={() => updateSessionStatus(session._id, 'cancel', { 
                          reason: 'Cancelled by user' 
                        })}
                        className="btn-danger btn-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  
                  {session.status === 'in-progress' && userRole === 'tutor' && (
                    <select 
                      onChange={(e) => updateSessionStatus(session._id, 'attendance', { 
                        attendance: e.target.value 
                      })}
                      className="attendance-select"
                      defaultValue=""
                    >
                      <option value="" disabled>Mark Attendance</option>
                      <option value="attended">Attended</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                  )}
                  
                  <button 
                    onClick={() => setSelectedSession(session)}
                    className="btn-outline btn-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Schedule New Session</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={createSession} className="modal-body">
              <div className="form-group">
                <label htmlFor="scheduledAt">Date & Time:</label>
                <input
                  type="datetime-local"
                  id="scheduledAt"
                  value={sessionForm.scheduledAt}
                  onChange={(e) => setSessionForm(prev => ({
                    ...prev,
                    scheduledAt: e.target.value
                  }))}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="duration">Duration (minutes):</label>
                <select
                  id="duration"
                  value={sessionForm.duration}
                  onChange={(e) => setSessionForm(prev => ({
                    ...prev,
                    duration: parseInt(e.target.value)
                  }))}
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="sessionType">Session Type:</label>
                <select
                  id="sessionType"
                  value={sessionForm.sessionType}
                  onChange={(e) => setSessionForm(prev => ({
                    ...prev,
                    sessionType: e.target.value
                  }))}
                >
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes (optional):</label>
                <textarea
                  id="notes"
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="Add any special instructions or notes..."
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Session Details</h3>
              <button 
                onClick={() => setSelectedSession(null)}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="session-detail-view">
                <h4>{selectedSession.post?.title}</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span className={`status-badge ${getStatusClass(selectedSession.status)}`}>
                      {selectedSession.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Scheduled:</strong>
                    <span>{formatDateTime(selectedSession.scheduledAt).date} at {formatDateTime(selectedSession.scheduledAt).time}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Duration:</strong>
                    <span>{selectedSession.duration} minutes</span>
                  </div>
                  <div className="detail-item">
                    <strong>Type:</strong>
                    <span>{selectedSession.sessionType}</span>
                  </div>
                  {selectedSession.attendance && (
                    <div className="detail-item">
                      <strong>Attendance:</strong>
                      <span className={`attendance-${selectedSession.attendance}`}>
                        {selectedSession.attendance}
                      </span>
                    </div>
                  )}
                </div>
                {selectedSession.notes && (
                  <div className="notes-section">
                    <strong>Notes:</strong>
                    <p>{selectedSession.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setSelectedSession(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
