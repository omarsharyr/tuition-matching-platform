// frontend/src/components/AdminSidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = ({ isCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/admin/dashboard',
      description: 'Overview & KPIs'
    },
    {
      id: 'verification',
      label: 'Verification Queue',
      icon: '✅',
      path: '/admin/verification',
      description: 'Doc review & approval',
      badge: '5' // Example pending count
    },
    {
      id: 'users',
      label: 'Users',
      icon: '👥',
      path: '/admin/users-management',
      description: 'User management'
    },
    {
      id: 'jobs',
      label: 'Jobs & Apps',
      icon: '💼',
      path: '/admin/jobs-moderation',
      description: 'Moderation & controls'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: '🚨',
      path: '/admin/reports',
      description: 'Disputes & issues',
      badge: '2'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      path: '/admin/analytics',
      description: 'Insights & trends'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      path: '/admin/settings',
      description: 'System configuration'
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: '📋',
      path: '/admin/audit',
      description: 'Activity tracking'
    }
  ];

  return (
    <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="brand-icon">🖥️</span>
          {!isCollapsed && <span className="brand-text">Admin Panel</span>}
        </div>
        <div className="header-actions">
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {sidebarItems.map(item => (
            <li key={item.id} className="nav-item">
              <NavLink 
                to={item.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
                title={isCollapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                )}
                {!isCollapsed && item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">👨‍💼</div>
          {!isCollapsed && (
            <div className="user-details">
              <div className="user-name">Platform Admin</div>
              <div className="user-role">Administrator</div>
            </div>
          )}
        </div>
        <button 
          className="logout-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <span className="logout-icon">🚀</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
