import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import './AdminAuditLogs.css';

const AdminAuditLogs = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);
  
  // Filters
  const [filters, setFilters] = useState({
    dateRange: '7days',
    userType: 'all',
    action: 'all',
    searchQuery: ''
  });

  // Mock audit log data
  const mockLogs = [
    {
      id: 1,
      timestamp: '2024-01-15T10:30:00Z',
      userId: 'USR001',
      userName: 'John Admin',
      userType: 'admin',
      action: 'USER_CREATED',
      description: 'Created new tutor account for Sarah Wilson',
      target: 'TUT045',
      targetType: 'tutor',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      details: {
        email: 'sarah.wilson@email.com',
        role: 'tutor',
        subjects: ['Mathematics', 'Physics']
      }
    },
    {
      id: 2,
      timestamp: '2024-01-15T09:45:00Z',
      userId: 'USR002',
      userName: 'Mike Student',
      userType: 'student',
      action: 'TUITION_POST_CREATED',
      description: 'Created new tuition post for Class 10 Mathematics',
      target: 'POST123',
      targetType: 'post',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
      status: 'success',
      details: {
        subject: 'Mathematics',
        class: 'Class 10',
        budget: 8000,
        location: 'Dhanmondi'
      }
    },
    {
      id: 3,
      timestamp: '2024-01-15T08:20:00Z',
      userId: 'TUT001',
      userName: 'Emily Tutor',
      userType: 'tutor',
      action: 'DOCUMENT_UPLOADED',
      description: 'Uploaded verification document',
      target: 'DOC789',
      targetType: 'document',
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      status: 'success',
      details: {
        documentType: 'Academic Certificate',
        fileName: 'masters_certificate.pdf',
        fileSize: '2.3MB'
      }
    },
    {
      id: 4,
      timestamp: '2024-01-15T07:15:00Z',
      userId: 'USR001',
      userName: 'John Admin',
      userType: 'admin',
      action: 'USER_SUSPENDED',
      description: 'Suspended user account due to policy violation',
      target: 'USR050',
      targetType: 'user',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      details: {
        reason: 'Inappropriate content',
        duration: '7 days',
        previousWarnings: 2
      }
    },
    {
      id: 5,
      timestamp: '2024-01-14T16:30:00Z',
      userId: 'STU001',
      userName: 'Alice Student',
      userType: 'student',
      action: 'APPLICATION_SUBMITTED',
      description: 'Applied for Mathematics tutoring',
      target: 'APP456',
      targetType: 'application',
      ipAddress: '192.168.1.120',
      userAgent: 'Mozilla/5.0 (Android 11; Mobile)',
      status: 'success',
      details: {
        tutorId: 'TUT030',
        subject: 'Mathematics',
        rate: 6000
      }
    },
    {
      id: 6,
      timestamp: '2024-01-14T14:45:00Z',
      userId: 'USR001',
      userName: 'John Admin',
      userType: 'admin',
      action: 'SETTINGS_UPDATED',
      description: 'Updated platform commission rates',
      target: 'SETTINGS',
      targetType: 'settings',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      details: {
        oldCommission: 15,
        newCommission: 18,
        changedBy: 'John Admin'
      }
    },
    {
      id: 7,
      timestamp: '2024-01-14T12:20:00Z',
      userId: 'TUT002',
      userName: 'Robert Tutor',
      userType: 'tutor',
      action: 'LOGIN_FAILED',
      description: 'Failed login attempt - incorrect password',
      target: 'AUTH',
      targetType: 'authentication',
      ipAddress: '192.168.1.125',
      userAgent: 'Mozilla/5.0 (Linux; Android 10)',
      status: 'failed',
      details: {
        attempts: 3,
        lastSuccessfulLogin: '2024-01-13T08:30:00Z',
        accountLocked: false
      }
    },
    {
      id: 8,
      timestamp: '2024-01-14T10:10:00Z',
      userId: 'USR001',
      userName: 'John Admin',
      userType: 'admin',
      action: 'DOCUMENT_APPROVED',
      description: 'Approved tutor verification documents',
      target: 'TUT025',
      targetType: 'tutor',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      details: {
        documentsApproved: ['Academic Certificate', 'ID Card'],
        reviewTime: '15 minutes',
        notes: 'All documents verified successfully'
      }
    },
    // Add more mock logs for pagination demo
    ...Array.from({ length: 50 }, (_, index) => ({
      id: 9 + index,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      userId: `USR${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
      userName: ['John Admin', 'Alice Student', 'Bob Tutor', 'Carol Admin', 'David Student'][Math.floor(Math.random() * 5)],
      userType: ['admin', 'student', 'tutor'][Math.floor(Math.random() * 3)],
      action: ['USER_LOGIN', 'USER_LOGOUT', 'POST_CREATED', 'POST_UPDATED', 'DOCUMENT_UPLOADED', 'PAYMENT_PROCESSED'][Math.floor(Math.random() * 6)],
      description: `System activity #${index + 9}`,
      target: `TAR${String(index + 9).padStart(3, '0')}`,
      targetType: ['user', 'post', 'document', 'payment'][Math.floor(Math.random() * 4)],
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (System Generated)',
      status: Math.random() > 0.1 ? 'success' : 'failed',
      details: { generated: true }
    }))
  ];

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...logs];
    
    // Date range filter
    const now = new Date();
    const dateRanges = {
      'today': 1,
      '7days': 7,
      '30days': 30,
      '90days': 90
    };
    
    if (filters.dateRange !== 'all' && dateRanges[filters.dateRange]) {
      const cutoffDate = new Date(now.getTime() - dateRanges[filters.dateRange] * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(log => new Date(log.timestamp) >= cutoffDate);
    }
    
    // User type filter
    if (filters.userType !== 'all') {
      filtered = filtered.filter(log => log.userType === filters.userType);
    }
    
    // Action filter
    if (filters.action !== 'all') {
      filtered = filtered.filter(log => log.action === filters.action);
    }
    
    // Search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.userName.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.userId.toLowerCase().includes(query)
      );
    }
    
    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [logs, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const getActionIcon = (action) => {
    const icons = {
      'USER_CREATED': '👤',
      'USER_SUSPENDED': '🚫',
      'USER_LOGIN': '🔐',
      'USER_LOGOUT': '🚪',
      'LOGIN_FAILED': '❌',
      'TUITION_POST_CREATED': '📝',
      'POST_CREATED': '📄',
      'POST_UPDATED': '✏️',
      'DOCUMENT_UPLOADED': '📎',
      'DOCUMENT_APPROVED': '✅',
      'APPLICATION_SUBMITTED': '📋',
      'SETTINGS_UPDATED': '⚙️',
      'PAYMENT_PROCESSED': '💳'
    };
    return icons[action] || '📊';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'failed': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'User Type', 'Action', 'Description', 'Status', 'IP Address'],
      ...filteredLogs.map(log => [
        formatTimestamp(log.timestamp),
        log.userName,
        log.userType,
        log.action,
        log.description,
        log.status,
        log.ipAddress
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="audit-container">
        <AdminSidebar isCollapsed={sidebarCollapsed} toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className={`audit-content ${sidebarCollapsed ? 'expanded' : 'normal'}`}>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading audit logs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-container">
      <AdminSidebar isCollapsed={sidebarCollapsed} toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`audit-content ${sidebarCollapsed ? 'expanded' : 'normal'}`}>
        
        {/* Header */}
        <div className="audit-header">
          <div className="header-left">
            <h1>Audit Logs</h1>
            <p>Track all system activities and user actions</p>
          </div>
          <button onClick={exportLogs} className="export-button">
            📊 Export Logs
          </button>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>

            <div className="filter-group">
              <label>User Type</label>
              <select
                value={filters.userType}
                onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value }))}
              >
                <option value="all">All Users</option>
                <option value="admin">Admin</option>
                <option value="tutor">Tutor</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              >
                <option value="all">All Actions</option>
                <option value="USER_CREATED">User Created</option>
                <option value="USER_LOGIN">User Login</option>
                <option value="USER_LOGOUT">User Logout</option>
                <option value="POST_CREATED">Post Created</option>
                <option value="DOCUMENT_UPLOADED">Document Uploaded</option>
                <option value="SETTINGS_UPDATED">Settings Updated</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search logs..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              />
            </div>
          </div>

          <div className="filters-summary">
            <span>Showing {filteredLogs.length} of {logs.length} logs</span>
            {Object.values(filters).some(filter => filter !== 'all' && filter !== '') && (
              <button
                onClick={() => setFilters({
                  dateRange: 'all',
                  userType: 'all',
                  action: 'all',
                  searchQuery: ''
                })}
                className="clear-filters"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Logs Table */}
        <div className="logs-table-container">
          <div className="logs-table">
            <div className="table-header">
              <div>Time</div>
              <div>User</div>
              <div>Action</div>
              <div>Description</div>
              <div>Status</div>
              <div>Details</div>
            </div>

            <div className="table-body">
              {currentLogs.map(log => (
                <div key={log.id} className="table-row">
                  <div className="log-time">
                    {formatTimestamp(log.timestamp)}
                  </div>
                  
                  <div className="log-user">
                    <div className="user-info">
                      <span className="user-name">{log.userName}</span>
                      <span className={`user-type ${log.userType}`}>
                        {log.userType}
                      </span>
                    </div>
                    <span className="user-id">{log.userId}</span>
                  </div>
                  
                  <div className="log-action">
                    <span className="action-icon">{getActionIcon(log.action)}</span>
                    <span className="action-name">{log.action.replace(/_/g, ' ')}</span>
                  </div>
                  
                  <div className="log-description">
                    {log.description}
                  </div>
                  
                  <div className="log-status">
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: getStatusColor(log.status) + '20',
                        color: getStatusColor(log.status),
                        border: `1px solid ${getStatusColor(log.status)}40`
                      }}
                    >
                      {log.status}
                    </span>
                  </div>
                  
                  <div className="log-details">
                    <button 
                      className="details-button"
                      onClick={() => {
                        // Show details modal (implement as needed)
                        console.log('Log details:', log);
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-button"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              const isVisible = 
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2);
              
              if (!isVisible) {
                if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                  return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                }
                return null;
              }
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`page-button ${currentPage === pageNumber ? 'active' : ''}`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="page-button"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
