// frontend/src/pages/admin/AdminUsersManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../utils/api';
import './AdminUsersManagement.css';

const AdminUsersManagement = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: 'all', // all, student, tutor, admin
    status: 'all', // all, ACTIVE, INACTIVE, BANNED
    verified: 'all' // all, verified, pending, rejected
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      // Handle the API response structure: { users: [...], pagination: {...} }
      setUsers(response.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]); // Ensure users is always an array
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    // Verification filter
    if (filters.verified !== 'all') {
      if (filters.verified === 'verified') {
        filtered = filtered.filter(user => user.verificationStatus === 'verified' || user.isVerified === true);
      } else if (filters.verified === 'pending') {
        filtered = filtered.filter(user => user.verificationStatus === 'pending');
      } else if (filters.verified === 'rejected') {
        filtered = filtered.filter(user => user.verificationStatus === 'rejected');
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleUserAction = async (userId, action) => {
    try {
      let endpoint = '';
      let successMessage = '';
      
      switch (action) {
        case 'activate':
          endpoint = `/admin/users/${userId}/status`;
          await api.patch(endpoint, { status: 'ACTIVE' });
          successMessage = 'User activated successfully';
          break;
        case 'deactivate':
          endpoint = `/admin/users/${userId}/status`;
          await api.patch(endpoint, { status: 'INACTIVE' });
          successMessage = 'User deactivated successfully';
          break;
        case 'ban':
          endpoint = `/admin/users/${userId}/status`;
          await api.patch(endpoint, { status: 'BANNED' });
          successMessage = 'User banned successfully';
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            endpoint = `/admin/users/${userId}`;
            await api.delete(endpoint);
            successMessage = 'User deleted successfully';
          } else {
            return;
          }
          break;
        case 'verify':
          endpoint = `/admin/users/${userId}/verify`;
          await api.post(endpoint);
          successMessage = 'User verified successfully';
          break;
        default:
          return;
      }
      
      // Refresh users list
      await fetchUsers();
      alert(successMessage);
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      alert(`Failed to ${action} user. Please try again.`);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'ACTIVE': { class: 'status-active', text: 'Active' },
      'INACTIVE': { class: 'status-inactive', text: 'Inactive' },
      'BANNED': { class: 'status-banned', text: 'Banned' }
    };
    const badge = badges[status] || { class: 'status-unknown', text: status };
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const getVerificationBadge = (user) => {
    if (user.role === 'admin') {
      return <span className="verification-badge verified">Admin</span>;
    }
    
    const status = user.verificationStatus || (user.isVerified ? 'verified' : 'pending');
    const badges = {
      'verified': { class: 'verified', text: 'Verified' },
      'pending': { class: 'pending', text: 'Pending' },
      'rejected': { class: 'rejected', text: 'Rejected' }
    };
    const badge = badges[status] || { class: 'unknown', text: 'Unknown' };
    return <span className={`verification-badge ${badge.class}`}>{badge.text}</span>;
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      <div className={`admin-content ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        <header className="admin-header">
          <div className="header-left">
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">Manage users, permissions, and account status</p>
          </div>
          <div className="header-right">
            <div className="user-stats">
              <span className="stat-value">{filteredUsers.length}</span>
              <span className="stat-label">Users Found</span>
            </div>
          </div>
        </header>

        <div className="users-management-container">
          {/* Filters and Search */}
          <div className="filters-section">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filters-row">
              <div className="filter-group">
                <label>Role:</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({...filters, role: e.target.value})}
                  className="filter-select"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="tutor">Tutors</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="BANNED">Banned</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Verification:</label>
                <select
                  value={filters.verified}
                  onChange={(e) => setFilters({...filters, verified: e.target.value})}
                  className="filter-select"
                >
                  <option value="all">All</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="createdAt">Join Date</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="role">Role</option>
                </select>
              </div>
              
              <button
                className={`sort-order-btn ${sortOrder}`}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="users-table-container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">👥</span>
                <h3>No users found</h3>
                <p>Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Verification</th>
                      <th>Join Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="user-row">
                        <td className="user-cell">
                          <div className="user-info">
                            <div className="user-avatar">
                              {user.role === 'admin' ? '👨‍💼' : 
                               user.role === 'tutor' ? '👨‍🏫' : '🎓'}
                            </div>
                            <div className="user-details">
                              <div className="user-name">{user.name}</div>
                              <div className="user-email">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                          </span>
                        </td>
                        <td>{getStatusBadge(user.status)}</td>
                        <td>{getVerificationBadge(user)}</td>
                        <td className="date-cell">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            {user.status === 'ACTIVE' ? (
                              <button
                                className="action-btn deactivate"
                                onClick={() => handleUserAction(user._id, 'deactivate')}
                                title="Deactivate user"
                              >
                                ⏸️
                              </button>
                            ) : (
                              <button
                                className="action-btn activate"
                                onClick={() => handleUserAction(user._id, 'activate')}
                                title="Activate user"
                              >
                                ▶️
                              </button>
                            )}
                            
                            {user.status !== 'BANNED' && (
                              <button
                                className="action-btn ban"
                                onClick={() => handleUserAction(user._id, 'ban')}
                                title="Ban user"
                              >
                                🚫
                              </button>
                            )}
                            
                            {user.verificationStatus === 'pending' && (
                              <button
                                className="action-btn verify"
                                onClick={() => handleUserAction(user._id, 'verify')}
                                title="Verify user"
                              >
                                ✅
                              </button>
                            )}
                            
                            {user.role !== 'admin' && (
                              <button
                                className="action-btn delete"
                                onClick={() => handleUserAction(user._id, 'delete')}
                                title="Delete user"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersManagement;
