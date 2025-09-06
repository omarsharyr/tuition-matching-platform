// frontend/src/components/JobDetailDrawer.jsx
import React from "react";
import "./JobDetailDrawer.css";

export default function JobDetailDrawer({ isOpen, onClose, job, onAction }) {
  if (!isOpen || !job) return null;

  const formatBudget = (job) => {
    if (job.budgetAmount) {
      const typeMap = {
        hourly: '/hour',
        monthly: '/month', 
        per_session: '/session',
        package: ''
      };
      return `৳${job.budgetAmount}${typeMap[job.paymentType] || ''}`;
    }
    
    if (job.budget && typeof job.budget === 'object' && job.budget.min && job.budget.max) {
      return `৳${job.budget.min} - ৳${job.budget.max}`;
    }
    
    if (job.budget) {
      return `৳${job.budget}`;
    }
    
    return 'Not set';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#10b981',
      interviewing: '#f59e0b',
      matched: '#3b82f6',
      fulfilled: '#059669',
      closed: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getAvailableActions = () => {
    const actions = [
      { 
        key: 'applications', 
        label: 'View Applications', 
        icon: '👥', 
        variant: 'primary',
        badge: job.applicationsCount 
      }
    ];

    if (job.status === 'active') {
      actions.push(
        { key: 'edit', label: 'Edit Post', icon: '✏️', variant: 'secondary' },
        { key: 'close', label: 'Close Post', icon: '🔒', variant: 'danger' }
      );
    }

    if (job.status === 'interviewing') {
      actions.push(
        { key: 'close', label: 'Close Post', icon: '🔒', variant: 'danger' }
      );
    }

    if (job.status === 'matched') {
      actions.push(
        { key: 'fulfill', label: 'Mark as Fulfilled', icon: '✅', variant: 'success' }
      );
    }

    if (job.status === 'closed') {
      actions.push(
        { key: 'reopen', label: 'Reopen Post', icon: '🔓', variant: 'primary' }
      );
    }

    return actions;
  };

  const formatSchedule = (job) => {
    const days = job.preferredDays || job.days || [];
    const times = job.preferredTimes || job.timeSlots || [];
    
    if (days.length === 0 && times.length === 0) {
      return 'Not specified';
    }

    const dayText = days.length > 0 ? days.join(', ') : 'Any day';
    const timeText = times.length > 0 ? times.join(', ') : 'Any time';
    
    return `${dayText} • ${timeText}`;
  };

  return (
    <div className="job-detail-overlay" onClick={onClose}>
      <div className="job-detail-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="header-content">
            <h2>{job.title}</h2>
            <div className="job-chips">
              <span className="chip">{job.educationLevel || job.classLevel}</span>
              {Array.isArray(job.subjects) ? (
                job.subjects.slice(0, 3).map((subject, idx) => (
                  <span key={idx} className="chip subject-chip">{subject}</span>
                ))
              ) : (
                <span className="chip subject-chip">{job.subject}</span>
              )}
              {Array.isArray(job.subjects) && job.subjects.length > 3 && (
                <span className="chip more-chip">+{job.subjects.length - 3} more</span>
              )}
              <span className="chip area-chip">{job.area}</span>
              <span className="chip mode-chip">{job.teachingMode || job.mode}</span>
            </div>
            <div className="job-meta">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(job.status) }}
              >
                {job.status}
              </span>
              <span className="budget-badge">{formatBudget(job)}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Content */}
        <div className="drawer-content">
          {/* Job Information */}
          <div className="info-section">
            <h3>Job Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Education Level</label>
                <span>{job.educationLevel || job.classLevel}</span>
              </div>
              <div className="info-item">
                <label>Subjects</label>
                <span>
                  {Array.isArray(job.subjects) 
                    ? job.subjects.join(', ') 
                    : job.subject || 'Not specified'
                  }
                </span>
              </div>
              <div className="info-item">
                <label>Area</label>
                <span>{job.area}</span>
              </div>
              <div className="info-item">
                <label>Teaching Mode</label>
                <span>{job.teachingMode || job.mode}</span>
              </div>
              <div className="info-item">
                <label>Schedule Preference</label>
                <span>{formatSchedule(job)}</span>
              </div>
              <div className="info-item">
                <label>Sessions per Week</label>
                <span>{job.daysPerWeek || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <div className="info-section">
              <h3>Description</h3>
              <div className="description-text">
                {job.description}
              </div>
            </div>
          )}

          {/* Requirements */}
          {(job.preferredGender !== 'any' || job.experience !== 'any' || job.otherPreferences) && (
            <div className="info-section">
              <h3>Tutor Preferences</h3>
              <div className="preferences-list">
                {job.preferredGender && job.preferredGender !== 'any' && (
                  <div className="preference-item">
                    <span className="pref-label">Gender:</span>
                    <span className="pref-value">{job.preferredGender}</span>
                  </div>
                )}
                {job.experience && job.experience !== 'any' && (
                  <div className="preference-item">
                    <span className="pref-label">Experience:</span>
                    <span className="pref-value">{job.experience}</span>
                  </div>
                )}
                {job.otherPreferences && (
                  <div className="preference-item">
                    <span className="pref-label">Other:</span>
                    <span className="pref-value">{job.otherPreferences}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Applicants Panel */}
          <div className="info-section">
            <h3>Applications</h3>
            <div className="applicants-summary">
              <div className="applicant-count">
                <span className="count-number">{job.applicationsCount || 0}</span>
                <span className="count-label">Total Applications</span>
              </div>
              <button 
                className="view-applications-btn"
                onClick={() => onAction(job._id, 'applications')}
              >
                <span className="btn-icon">👥</span>
                View All Applications
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="info-section">
            <h3>Timeline</h3>
            <div className="timeline">
              <div className="timeline-item completed">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Posted</div>
                  <div className="timeline-date">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className={`timeline-item ${['interviewing', 'matched', 'fulfilled'].includes(job.status) ? 'completed' : ''}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Interviewing</div>
                  <div className="timeline-description">Reviewing applications</div>
                </div>
              </div>
              
              <div className={`timeline-item ${['matched', 'fulfilled'].includes(job.status) ? 'completed' : ''}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Matched</div>
                  <div className="timeline-description">Tutor selected</div>
                </div>
              </div>
              
              <div className={`timeline-item ${job.status === 'fulfilled' ? 'completed' : ''}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-title">Fulfilled</div>
                  <div className="timeline-description">Job completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Note */}
          <div className="safety-note">
            <div className="safety-icon">🔒</div>
            <div className="safety-text">
              <strong>Privacy Protection:</strong> Your exact address stays private until you choose to share it with your selected tutor.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="drawer-actions">
          {getAvailableActions().map(action => (
            <button
              key={action.key}
              className={`action-button ${action.variant}`}
              onClick={() => onAction(job._id, action.key)}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
              {action.badge && action.badge > 0 && (
                <span className="action-badge">{action.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
