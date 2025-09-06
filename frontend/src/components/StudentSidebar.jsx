// frontend/src/components/StudentSidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import './StudentSidebar.css';

const StudentSidebar = ({ isCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/student/dashboard',
      description: 'Overview & Stats'
    },
    {
      id: 'posts',
      label: 'My Jobs',
      icon: '📝',
      path: '/s/jobs',
      description: 'Job postings & status'
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: '📋',
      path: '/s/applications',
      description: 'Tutor applications'
    },
    {
      id: 'tutors',
      label: 'Find Tutors',
      icon: '🔍',
      path: '/student/find-tutors',
      description: 'Browse & hire tutors'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: '💬',
      path: '/s/messages',
      description: 'Chat with tutors'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: '🔔',
      path: '/s/notifications',
      description: 'Updates & alerts'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: '💳',
      path: '/student/payments',
      description: 'Payment history'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      path: '/student/profile',
      description: 'Personal settings'
    }
  ];

  return (
    <div className={`student-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="brand-icon">🎓</span>
          {!isCollapsed && <span className="brand-text">Student Portal</span>}
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
          <div className="user-avatar">🎓</div>
          {!isCollapsed && (
            <div className="user-details">
              <div className="user-name">Student</div>
              <div className="user-role">Learning Journey</div>
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

export default StudentSidebar;
