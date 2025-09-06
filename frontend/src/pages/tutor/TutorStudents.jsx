// frontend/src/pages/tutor/TutorStudents.jsx
import React, { useState } from 'react';
import TutorSidebar from '../../components/TutorSidebar';
import './TutorStudents.css';

const TutorStudents = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="tutor-students-container">
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
      
      <div className={`tutor-students-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <div className="page-header">
          <h1>My Students</h1>
          <p>Manage your current students and track their progress</p>
        </div>
        
        <div className="coming-soon-card">
          <div className="coming-soon-icon">👥</div>
          <h2>Student Management - Coming Soon!</h2>
          <p>
            This feature will help you manage your current students, track their progress,
            and maintain detailed records of your teaching sessions.
          </p>
          <div className="feature-preview">
            <h3>What's Coming:</h3>
            <ul>
              <li>Student profiles and academic records</li>
              <li>Progress tracking and assessments</li>
              <li>Session history and attendance</li>
              <li>Performance analytics and reports</li>
              <li>Parent communication tools</li>
              <li>Assignment and homework management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorStudents;
