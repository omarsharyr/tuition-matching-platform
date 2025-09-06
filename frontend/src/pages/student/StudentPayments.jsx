// frontend/src/pages/student/StudentPayments.jsx
import React, { useState } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import './StudentPayments.css';

const StudentPayments = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="student-payments-container">
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
      
      <div className={`student-payments-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <div className="page-header">
          <h1>Payments & Billing</h1>
          <p>Manage your payment history and billing information</p>
        </div>
        
        <div className="coming-soon-card">
          <div className="coming-soon-icon">💳</div>
          <h2>Payment System - Coming Soon!</h2>
          <p>
            This feature will provide comprehensive payment and billing management 
            for your tuition services and transactions.
          </p>
          <div className="feature-preview">
            <h3>What's Coming:</h3>
            <ul>
              <li>Payment history and transaction tracking</li>
              <li>Multiple payment method support</li>
              <li>Invoice generation and download</li>
              <li>Automatic billing for recurring services</li>
              <li>Payment disputes and refund management</li>
              <li>Financial analytics and reporting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPayments;
