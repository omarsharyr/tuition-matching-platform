// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Landing from "./pages/Landing";
import RegisterStudent from "./pages/RegisterStudent";
import RegisterTutor from "./pages/RegisterTutor";
import LoginStudent from "./pages/LoginStudent";
import LoginTutor from "./pages/LoginTutor";
import DashboardPlaceholder from "./pages/DashboardPlaceholder";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing */}
          <Route path="/" element={<Landing />} />

          {/* Student Routes */}
          <Route path="/student/register" element={<RegisterStudent />} />
          <Route path="/student/login" element={<LoginStudent />} />

          {/* Tutor Routes */}
          <Route path="/tutor/register" element={<RegisterTutor />} />
          <Route path="/tutor/login" element={<LoginTutor />} />

          {/* Protected Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute requireVerified={true}>
                <DashboardPlaceholder />
              </PrivateRoute>
            }
          />

          {/* (Optional) Fallback → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
