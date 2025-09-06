// frontend/src/pages/student/StudentNotifications.jsx
import React, { useState } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import NotificationCenter from '../../components/NotificationCenter';
import './StudentNotifications.css';

export default function StudentNotifications() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="student-notifications-container">
      <StudentSidebar 
        isCollapsed={sidebarCollapsed} 
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className={`student-notifications-main ${sidebarCollapsed ? 'expanded' : ''}`}>
        {/* Header */}
        <div className="page-header">
          <h1>📧 Notifications</h1>
          <p>Stay updated with all your applications, messages, and platform updates</p>
        </div>

        {/* Notification Center */}
        <div className="notifications-wrapper">
          <NotificationCenter />
        </div>
      </div>
    </div>
  );
}
