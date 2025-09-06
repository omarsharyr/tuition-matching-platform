// frontend/src/pages/tutor/TutorSchedule.jsx
import React, { useState } from 'react';
import TutorSidebar from '../../components/TutorSidebar';
import './TutorSchedule.css';

const TutorSchedule = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="tutor-schedule-container">
      <TutorSidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      {/* Mobile overlay */}
      {!isSidebarCollapsed && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
      
      <div className={`tutor-schedule-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <div className="page-header">
          <h1>Schedule Management</h1>
          <p>Manage your availability and teaching sessions</p>
        </div>
        
        <div className="coming-soon-card">
          <div className="coming-soon-icon">📅</div>
          <h2>Schedule System - Coming Soon!</h2>
          <p>
            This feature will provide comprehensive scheduling tools to manage your 
            teaching availability and coordinate sessions with students.
          </p>
          <div className="feature-preview">
            <h3>What's Coming:</h3>
            <ul>
              <li>Weekly and monthly calendar views</li>
              <li>Availability setting and time slots</li>
              <li>Session booking and confirmations</li>
              <li>Automatic reminders and notifications</li>
              <li>Reschedule and cancellation management</li>
              <li>Integration with student bookings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorSchedule;
