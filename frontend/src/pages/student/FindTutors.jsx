// frontend/src/pages/student/FindTutors.jsx
import React, { useState } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import './FindTutors.css';

const FindTutors = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="find-tutors-container">
      <StudentSidebar 
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
      
      <div className={`find-tutors-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <div className="page-header">
          <h1>Find Tutors</h1>
          <p>Browse and hire qualified tutors for your subjects</p>
        </div>
        
        <div className="coming-soon-card">
          <div className="coming-soon-icon">🔍</div>
          <h2>Find Tutors - Coming Soon!</h2>
          <p>
            This feature will allow you to browse through qualified tutors, 
            view their profiles, ratings, and directly hire them for your subjects.
          </p>
          <div className="feature-preview">
            <h3>What's Coming:</h3>
            <ul>
              <li>Advanced tutor search and filtering</li>
              <li>Tutor profiles with ratings and reviews</li>
              <li>Subject-wise tutor recommendations</li>
              <li>Direct hiring and communication</li>
              <li>Price comparison and negotiation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindTutors;
