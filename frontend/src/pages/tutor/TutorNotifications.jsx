// frontend/src/pages/tutor/TutorNotifications.jsx
import React, { useState } from 'react';
import TutorSidebar from '../../components/TutorSidebar';
import NotificationCenter from '../../components/NotificationCenter';
import './TutorNotifications.css';

export default function TutorNotifications() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="tutor-notifications-container">
      <TutorSidebar 
        isCollapsed={sidebarCollapsed} 
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className={`tutor-notifications-main ${sidebarCollapsed ? 'expanded' : ''}`}>
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
