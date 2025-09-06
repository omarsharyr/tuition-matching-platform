// frontend/src/pages/tutor/TutorEarnings.jsx
import React, { useState } from 'react';
import TutorSidebar from '../../components/TutorSidebar';
import './TutorEarnings.css';

const TutorEarnings = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="tutor-earnings-container">
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
      
      <div className={`tutor-earnings-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <div className="page-header">
          <h1>Earnings & Analytics</h1>
          <p>Track your income and teaching performance</p>
        </div>
        
        <div className="coming-soon-card">
          <div className="coming-soon-icon">💰</div>
          <h2>Earnings Dashboard - Coming Soon!</h2>
          <p>
            This feature will provide comprehensive earning analytics and financial 
            tracking for your tutoring business.
          </p>
          <div className="feature-preview">
            <h3>What's Coming:</h3>
            <ul>
              <li>Monthly and yearly earning reports</li>
              <li>Session-wise payment tracking</li>
              <li>Payment history and receipts</li>
              <li>Tax reporting and summaries</li>
              <li>Performance analytics and insights</li>
              <li>Withdrawal and payout management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorEarnings;
