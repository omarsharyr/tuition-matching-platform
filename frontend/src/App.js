import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Landing from "./pages/Landing";
import RegisterStudent from "./pages/RegisterStudent";
import RegisterTutor from "./pages/RegisterTutor"; // ✅ imported here
import LoginStudent from "./pages/LoginStudent";
import LoginTutor from "./pages/LoginTutor";
import DashboardPlaceholder from "./pages/DashboardPlaceholder";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Student Routes */}
        <Route path="/student/register" element={<RegisterStudent />} />
        <Route path="/student/login" element={<LoginStudent />} />
        <Route path="/student/login" element={<LoginStudent />} />


        {/* Tutor Routes */}
        <Route path="/tutor/register" element={<RegisterTutor />} /> {/* ✅ hooked */}
        <Route path="/tutor/login" element={<LoginTutor />} />

        {/* Temporary Dashboard */}
        <Route path="/dashboard" element={<DashboardPlaceholder />} />
      </Routes>
    </Router>
  );
}

export default App;
