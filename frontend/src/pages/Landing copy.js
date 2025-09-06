// src/pages/Landing.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Landing.css";

export default function Landing() {
  const nav = useNavigate();

  // Change to "/student/register" and "/tutor/register" if you want register-first
  const TARGETS = {
    student: "/student/login",
    tutor: "/tutor/login",
  };

  const go = (role) => nav(TARGETS[role]);

  return (
    <div className="landing">
      <header className="landing-header">
        <h1>Tuition Match</h1>
      </header>

      <main className="landing-main">
        <div className="landing-container">
          <h2 className="landing-title">Choose your role</h2>
          <p className="landing-subtitle">
            Continue as a Student/Guardian or as a Tutor.
          </p>

          <div className="landing-cards">
            <button
              className="landing-card"
              onClick={() => go("student")}
              aria-label="Continue as Student or Guardian"
            >
              <div className="landing-badge">Student / Guardian</div>
              <div className="landing-card-title">Find a Tutor</div>
              <div className="landing-card-desc">
                Post your tuition needs and review applicants.
              </div>
            </button>

            <button
              className="landing-card"
              onClick={() => go("tutor")}
              aria-label="Continue as Tutor"
            >
              <div className="landing-badge">Tutor</div>
              <div className="landing-card-title">Find Tuition Jobs</div>
              <div className="landing-card-desc">
                Browse matching posts and apply quickly.
              </div>
            </button>
          </div>

          <p className="landing-hint">
            You’ll choose <b>login or register</b> on the next page.
          </p>
        </div>
      </main>
    </div>
  );
}
