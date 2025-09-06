// src/pages/Landing.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Landing.css";

export default function Landing() {
  const nav = useNavigate();
  // Updated to use login routes
  const TARGETS = {
    student: "/login/student",
    tutor: "/login/tutor",
  };
  const go = (role) => nav(TARGETS[role]);
  
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-header-content">
          <div className="landing-logo">
            <div className="landing-logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1>Tuition Match</h1>
          </div>
        </div>
      </header>
      
      <main className="landing-main">
        <div className="landing-container">
          <div className="landing-hero">
            <h2 className="landing-title">Choose your role</h2>
            <p className="landing-subtitle">
              Continue as a Student/Guardian or as a Tutor.
            </p>
          </div>
          
          <div className="landing-cards">
            <button
              className="landing-card landing-card-student"
              onClick={() => go("student")}
              aria-label="Continue as Student or Guardian"
            >
              <div className="landing-card-header">
                <div className="landing-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="landing-card-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <div className="landing-badge">Student / Guardian</div>
              <div className="landing-card-title">Find a Tutor</div>
              <div className="landing-card-desc">
                Post your tuition needs and review applicants.
              </div>
            </button>

            <button
              className="landing-card landing-card-tutor"
              onClick={() => go("tutor")}
              aria-label="Continue as Tutor"
            >
              <div className="landing-card-header">
                <div className="landing-card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 10V6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V10C3.1 10 4 10.9 4 12S3.1 14 2 14V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V14C20.9 14 20 13.1 20 12S20.9 10 22 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 16L12 12L11 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="landing-card-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <div className="landing-badge">Tutor</div>
              <div className="landing-card-title">Find Tuition Jobs</div>
              <div className="landing-card-desc">
                Browse matching posts and apply quickly.
              </div>
            </button>
          </div>
          
          <p className="landing-hint">
            You'll choose <b>login or register</b> on the next page.
          </p>
          
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <a 
              href="/login/admin" 
              style={{ 
                color: '#666', 
                fontSize: '0.9rem', 
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                display: 'inline-block'
              }}
            >
              Admin Login
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}