// frontend/src/components/TutorSidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import './TutorSidebar.css';

const TutorSidebar = ({ isCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/tutor/dashboard',
      description: 'Overview & Stats'
    },
    {
      id: 'jobs',
      label: 'Job Board',
      icon: '💼',
      path: '/tutor/jobs',
      description: 'Browse opportunities'
    },
    {
      id: 'applications',
      label: 'My Applications',
      icon: '📋',
      path: '/tutor/applications',
      description: 'Applied positions'
    },
    {
      id: 'students',
      label: 'My Students',
      icon: '👥',
      path: '/tutor/students',
      description: 'Current students'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: '📅',
      path: '/tutor/schedule',
      description: 'Manage availability'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: '💬',
      path: '/tutor/messages',
      description: 'Chat with students'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: '🔔',
      path: '/tutor/notifications',
      description: 'Updates & alerts'
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: '💰',
      path: '/tutor/earnings',
      description: 'Income tracking'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      path: '/tutor/profile',
      description: 'Professional settings'
    }
  ];

  return (
    <div className={`tutor-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="brand-icon">👨‍🏫</span>
          {!isCollapsed && <span className="brand-text">Tutor Portal</span>}
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
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">👨‍🏫</div>
          {!isCollapsed && (
            <div className="user-details">
              <div className="user-name">Tutor</div>
              <div className="user-role">Educator</div>
            </div>
          )}
        </div>
        <button 
          className="logout-btn"
          onClick={logout}
          title="Logout"
        >
          <span className="logout-icon">🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default TutorSidebar;
