// frontend/src/pages/admin/AdminReportsKanban.jsx
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './AdminReportsKanban.css';

const AdminReportsKanban = () => {
  const [reports, setReports] = useState({
    new: [],
    inReview: [],
    resolved: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Mock data for demonstration
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      
      const mockReports = {
        new: [
          {
            id: 'rpt-001',
            title: 'Tutor not showing up for classes',
            type: 'conduct',
            priority: 'high',
            reporter: {
              name: 'Ahmed Hassan',
              email: 'ahmed@email.com',
              role: 'student'
            },
            reportedUser: {
              name: 'Dr. Sarah Khan',
              email: 'sarah@email.com',
              role: 'tutor'
            },
            description: 'The tutor has missed 3 scheduled classes without prior notice...',
            createdAt: '2024-01-15T10:30:00Z',
            evidence: ['screenshot1.jpg', 'messages.pdf']
          },
          {
            id: 'rpt-002',
            title: 'Payment dispute for completed sessions',
            type: 'payment',
            priority: 'medium',
            reporter: {
              name: 'Dr. Mike Johnson',
              email: 'mike@email.com',
              role: 'tutor'
            },
            reportedUser: {
              name: 'Fatima Rahman',
              email: 'fatima@email.com',
              role: 'student'
            },
            description: 'Student is refusing to pay for 5 completed tutoring sessions...',
            createdAt: '2024-01-15T09:15:00Z',
            evidence: ['session_logs.pdf']
          },
          {
            id: 'rpt-003',
            title: 'Inappropriate behavior in chat',
            type: 'harassment',
            priority: 'high',
            reporter: {
              name: 'Lisa Chen',
              email: 'lisa@email.com',
              role: 'student'
            },
            reportedUser: {
              name: 'John Smith',
              email: 'john@email.com',
              role: 'tutor'
            },
            description: 'Tutor sent inappropriate messages during tutoring session...',
            createdAt: '2024-01-14T16:45:00Z',
            evidence: ['chat_screenshot.png', 'session_recording.mp4']
          }
        ],
        inReview: [
          {
            id: 'rpt-004',
            title: 'Fake credentials reported',
            type: 'fraud',
            priority: 'high',
            reporter: {
              name: 'Anonymous Student',
              email: 'anonymous@email.com',
              role: 'student'
            },
            reportedUser: {
              name: 'Prof. Williams',
              email: 'williams@email.com',
              role: 'tutor'
            },
            description: 'This tutor claims to have a PhD but verification shows otherwise...',
            createdAt: '2024-01-13T14:20:00Z',
            evidence: ['fake_certificate.jpg'],
            assignedTo: 'Admin Team',
            reviewStarted: '2024-01-14T09:00:00Z'
          },
          {
            id: 'rpt-005',
            title: 'Student not attending sessions',
            type: 'conduct',
            priority: 'low',
            reporter: {
              name: 'Dr. Rahman',
              email: 'rahman@email.com',
              role: 'tutor'
            },
            reportedUser: {
              name: 'Ali Khan',
              email: 'ali@email.com',
              role: 'student'
            },
            description: 'Student has been absent for multiple scheduled sessions...',
            createdAt: '2024-01-12T11:30:00Z',
            evidence: [],
            assignedTo: 'Support Team',
            reviewStarted: '2024-01-13T10:00:00Z'
          }
        ],
        resolved: [
          {
            id: 'rpt-006',
            title: 'Quality of teaching concerns',
            type: 'quality',
            priority: 'medium',
            reporter: {
              name: 'Karim Ahmed',
              email: 'karim@email.com',
              role: 'student'
            },
            reportedUser: {
              name: 'Ms. Jennifer',
              email: 'jennifer@email.com',
              role: 'tutor'
            },
            description: 'Tutor teaching methods are not effective for advanced topics...',
            createdAt: '2024-01-10T13:15:00Z',
            evidence: ['feedback_form.pdf'],
            assignedTo: 'Quality Team',
            reviewStarted: '2024-01-11T09:00:00Z',
            resolvedAt: '2024-01-14T15:30:00Z',
            resolution: 'Tutor was provided additional training and student was offered a replacement tutor.',
            outcome: 'warning_issued'
          }
        ]
      };

      setReports(mockReports);
      setLoading(false);
    };

    fetchReports();
  }, []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const sourceColumn = reports[source.droppableId];
    const destColumn = reports[destination.droppableId];
    const draggedItem = sourceColumn.find(item => item.id === draggableId);

    // Update item with new status
    const updatedItem = {
      ...draggedItem,
      ...(destination.droppableId === 'inReview' && {
        assignedTo: 'Admin Team',
        reviewStarted: new Date().toISOString()
      }),
      ...(destination.droppableId === 'resolved' && {
        resolvedAt: new Date().toISOString(),
        resolution: 'Moved to resolved - awaiting details',
        outcome: 'pending'
      })
    };

    const newReports = {
      ...reports,
      [source.droppableId]: sourceColumn.filter(item => item.id !== draggableId),
      [destination.droppableId]: [...destColumn, updatedItem]
    };

    setReports(newReports);
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  const filterReports = (columnReports) => {
    return columnReports.filter(report => {
      const typeMatch = filterType === 'all' || report.type === filterType;
      const priorityMatch = filterPriority === 'all' || report.priority === filterPriority;
      return typeMatch && priorityMatch;
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#d97706';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'conduct': return '⚠️';
      case 'payment': return '💰';
      case 'harassment': return '🚨';
      case 'fraud': return '🔍';
      case 'quality': return '📚';
      default: return '📋';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="reports-kanban-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Loading Reports...</h3>
        </div>
      </div>
    );
  }

  const totalReports = Object.values(reports).flat().length;

  return (
    <div className="reports-kanban-container">
      {/* Header */}
      <div className="kanban-header">
        <div className="header-content">
          <h2>🚨 Reports & Disputes</h2>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{totalReports}</span>
              <span className="stat-label">Total Reports</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{reports.new.length}</span>
              <span className="stat-label">New</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{reports.inReview.length}</span>
              <span className="stat-label">In Review</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{reports.resolved.length}</span>
              <span className="stat-label">Resolved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <label>Filter by Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="conduct">Conduct</option>
            <option value="payment">Payment</option>
            <option value="harassment">Harassment</option>
            <option value="fraud">Fraud</option>
            <option value="quality">Quality</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Filter by Priority:</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {/* New Column */}
          <div className="kanban-column">
            <div className="column-header new">
              <h3>🆕 New ({filterReports(reports.new).length})</h3>
            </div>
            <Droppable droppableId="new">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`column-content ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                >
                  {filterReports(reports.new).map((report, index) => (
                    <Draggable key={report.id} draggableId={report.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`report-card ${snapshot.isDragging ? 'dragging' : ''}`}
                          onClick={() => handleReportClick(report)}
                        >
                          <div className="card-header">
                            <div className="type-badge">
                              <span className="type-icon">{getTypeIcon(report.type)}</span>
                              <span className="type-text">{report.type}</span>
                            </div>
                            <div 
                              className="priority-dot" 
                              style={{ backgroundColor: getPriorityColor(report.priority) }}
                              title={`${report.priority} priority`}
                            ></div>
                          </div>
                          <h4 className="report-title">{report.title}</h4>
                          <div className="report-meta">
                            <div className="meta-row">
                              <strong>Reporter:</strong> {report.reporter.name}
                            </div>
                            <div className="meta-row">
                              <strong>Reported:</strong> {report.reportedUser.name}
                            </div>
                            <div className="meta-row">
                              <strong>Time:</strong> {formatTimeAgo(report.createdAt)}
                            </div>
                            {report.evidence.length > 0 && (
                              <div className="evidence-count">
                                📎 {report.evidence.length} evidence file{report.evidence.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* In Review Column */}
          <div className="kanban-column">
            <div className="column-header in-review">
              <h3>🔍 In Review ({filterReports(reports.inReview).length})</h3>
            </div>
            <Droppable droppableId="inReview">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`column-content ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                >
                  {filterReports(reports.inReview).map((report, index) => (
                    <Draggable key={report.id} draggableId={report.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`report-card ${snapshot.isDragging ? 'dragging' : ''}`}
                          onClick={() => handleReportClick(report)}
                        >
                          <div className="card-header">
                            <div className="type-badge">
                              <span className="type-icon">{getTypeIcon(report.type)}</span>
                              <span className="type-text">{report.type}</span>
                            </div>
                            <div 
                              className="priority-dot" 
                              style={{ backgroundColor: getPriorityColor(report.priority) }}
                              title={`${report.priority} priority`}
                            ></div>
                          </div>
                          <h4 className="report-title">{report.title}</h4>
                          <div className="report-meta">
                            <div className="meta-row">
                              <strong>Reporter:</strong> {report.reporter.name}
                            </div>
                            <div className="meta-row">
                              <strong>Reported:</strong> {report.reportedUser.name}
                            </div>
                            <div className="meta-row">
                              <strong>Assigned to:</strong> {report.assignedTo}
                            </div>
                            <div className="meta-row">
                              <strong>Started:</strong> {formatTimeAgo(report.reviewStarted)}
                            </div>
                            {report.evidence.length > 0 && (
                              <div className="evidence-count">
                                📎 {report.evidence.length} evidence file{report.evidence.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Resolved Column */}
          <div className="kanban-column">
            <div className="column-header resolved">
              <h3>✅ Resolved ({filterReports(reports.resolved).length})</h3>
            </div>
            <Droppable droppableId="resolved">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`column-content ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                >
                  {filterReports(reports.resolved).map((report, index) => (
                    <Draggable key={report.id} draggableId={report.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`report-card resolved ${snapshot.isDragging ? 'dragging' : ''}`}
                          onClick={() => handleReportClick(report)}
                        >
                          <div className="card-header">
                            <div className="type-badge">
                              <span className="type-icon">{getTypeIcon(report.type)}</span>
                              <span className="type-text">{report.type}</span>
                            </div>
                            <div className="outcome-badge">
                              {report.outcome === 'warning_issued' && '⚠️'}
                              {report.outcome === 'account_suspended' && '🚫'}
                              {report.outcome === 'resolved_amicably' && '🤝'}
                              {report.outcome === 'pending' && '⏳'}
                            </div>
                          </div>
                          <h4 className="report-title">{report.title}</h4>
                          <div className="report-meta">
                            <div className="meta-row">
                              <strong>Reporter:</strong> {report.reporter.name}
                            </div>
                            <div className="meta-row">
                              <strong>Reported:</strong> {report.reportedUser.name}
                            </div>
                            <div className="meta-row">
                              <strong>Resolved:</strong> {formatTimeAgo(report.resolvedAt)}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>

      {/* Report Detail Modal */}
      {showModal && selectedReport && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedReport.title}</h3>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="report-details">
                <div className="detail-section">
                  <h4>Report Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Type:</strong>
                      <span className="type-badge">
                        {getTypeIcon(selectedReport.type)} {selectedReport.type}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Priority:</strong>
                      <span 
                        className="priority-badge"
                        style={{ color: getPriorityColor(selectedReport.priority) }}
                      >
                        {selectedReport.priority}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Reported At:</strong>
                      <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
                    </div>
                    {selectedReport.assignedTo && (
                      <div className="detail-item">
                        <strong>Assigned To:</strong>
                        <span>{selectedReport.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Involved Parties</h4>
                  <div className="parties-grid">
                    <div className="party-card">
                      <h5>Reporter</h5>
                      <p><strong>Name:</strong> {selectedReport.reporter.name}</p>
                      <p><strong>Email:</strong> {selectedReport.reporter.email}</p>
                      <p><strong>Role:</strong> {selectedReport.reporter.role}</p>
                    </div>
                    <div className="party-card">
                      <h5>Reported User</h5>
                      <p><strong>Name:</strong> {selectedReport.reportedUser.name}</p>
                      <p><strong>Email:</strong> {selectedReport.reportedUser.email}</p>
                      <p><strong>Role:</strong> {selectedReport.reportedUser.role}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Description</h4>
                  <p className="description-text">{selectedReport.description}</p>
                </div>

                {selectedReport.evidence && selectedReport.evidence.length > 0 && (
                  <div className="detail-section">
                    <h4>Evidence ({selectedReport.evidence.length})</h4>
                    <div className="evidence-list">
                      {selectedReport.evidence.map((file, index) => (
                        <div key={index} className="evidence-item">
                          📎 {file}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.resolution && (
                  <div className="detail-section">
                    <h4>Resolution</h4>
                    <p className="resolution-text">{selectedReport.resolution}</p>
                    <p className="resolved-time">
                      Resolved on {new Date(selectedReport.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Close</button>
              {selectedReport.assignedTo && !selectedReport.resolvedAt && (
                <button className="btn-primary">Update Status</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsKanban;
