import React from "react";
import { Routes, Route } from "react-router-dom";

// Public pages
import Landing from "./pages/Landing";
import RegisterStudent from "./pages/RegisterStudent";
import RegisterTutor from "./pages/RegisterTutor";
import LoginStudent from "./pages/LoginStudent";
import LoginTutor from "./pages/LoginTutor";
import LoginAdmin from "./pages/LoginAdmin";
import Forbidden from "./pages/Forbidden";
import Debug from "./pages/Debug";
import AdminTest from "./pages/AdminTest";
import PublicJobBrowser from "./pages/PublicJobBrowser";
import TestRoute from "./pages/TestRoute";
import AuthDebug from "./pages/AuthDebug";
import NavigationTest from "./pages/NavigationTest";
import DirectJobBoard from "./pages/DirectJobBoard";

// Dashboards (role)
import DashboardStudent from "./pages/student/StudentDashboardNew";
import StudentPostDetail from "./pages/student/StudentPostDetail";
import MyPosts from "./pages/student/MyPosts";
import ApplicationsManagement from "./pages/student/ApplicationsManagement";
import StudentMessages from "./pages/student/StudentMessages";
import FindTutors from "./pages/student/FindTutors";
import StudentPayments from "./pages/student/StudentPayments";
import StudentProfile from "./pages/student/StudentProfile";
import StudentNotifications from "./pages/student/StudentNotifications";
import DashboardTutor from "./pages/tutor/TutorDashboardNew";
import TutorJobBoard from "./pages/tutor/TutorJobBoard";
import TutorApplications from "./pages/tutor/TutorApplications";
import TutorStudents from "./pages/tutor/TutorStudents";
import TutorSchedule from "./pages/tutor/TutorSchedule";
import TutorMessages from "./pages/tutor/TutorMessages";
import TutorEarnings from "./pages/tutor/TutorEarnings";
import TutorProfile from "./pages/tutor/TutorProfile";
import TutorNotifications from "./pages/tutor/TutorNotifications";
import DashboardAdmin from "./pages/admin/AdminDashboard";

// Chat
import ChatRoom from "./pages/ChatRoom";

// Admin subpages
import AdminVerify from "./pages/admin/AdminVerify";
import AdminVerification from "./pages/admin/AdminVerification";
import AdminUsersManagement from "./pages/admin/AdminUsersManagement";
import AdminJobsModeration from "./pages/admin/AdminJobsModeration";
import AdminReportsKanban from "./pages/admin/AdminReportsKanban";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

import PrivateRoute from "./components/PrivateRoute";

// Import global styles
import "./styles/global.css";

export default function App() {
  return (
    <div className="App">
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Registration routes (new paths) */}
        <Route path="/register/student" element={<RegisterStudent />} />
        <Route path="/register/tutor" element={<RegisterTutor />} />

        {/* Legacy registration routes (redirect to new paths) */}
        <Route path="/student/register" element={<RegisterStudent />} />
        <Route path="/tutor/register" element={<RegisterTutor />} />

        {/* Login routes */}
        <Route path="/login/student" element={<LoginStudent />} />
        <Route path="/login/tutor" element={<LoginTutor />} />
        <Route path="/login/admin" element={<LoginAdmin />} />

        {/* Public job browser for testing */}
        <Route path="/public-jobs" element={<PublicJobBrowser />} />
        
        {/* Test route for debugging */}
        <Route path="/test-route" element={<TestRoute />} />
        
        {/* Auth debug route */}
        <Route path="/auth-debug" element={<AuthDebug />} />
        
        {/* Navigation test route */}
        <Route path="/nav-test" element={<NavigationTest />} />
        
        {/* Direct job board test */}
        <Route path="/direct-jobs" element={<DirectJobBoard />} />

        {/* Legacy login routes */}
        <Route path="/student/login" element={<LoginStudent />} />
        <Route path="/tutor/login" element={<LoginTutor />} />

        {/* Student Dashboard */}
        <Route
          path="/student/dashboard"
          element={
            <PrivateRoute role="student">
              <DashboardStudent />
            </PrivateRoute>
          }
        />
        <Route
          path="/student/posts/:id"
          element={
            <PrivateRoute role="student">
              <StudentPostDetail />
            </PrivateRoute>
          }
        />
        
        {/* Student Job Management */}
        <Route
          path="/s/jobs"
          element={
            <PrivateRoute role="student">
              <MyPosts />
            </PrivateRoute>
          }
        />
        
        {/* Student Applications Management */}
        <Route
          path="/s/applications"
          element={
            <PrivateRoute role="student">
              <ApplicationsManagement />
            </PrivateRoute>
          }
        />
        
        {/* Student Messages */}
        <Route
          path="/s/messages"
          element={
            <PrivateRoute role="student">
              <StudentMessages />
            </PrivateRoute>
          }
        />

        {/* Student Notifications */}
        <Route
          path="/s/notifications"
          element={
            <PrivateRoute role="student">
              <StudentNotifications />
            </PrivateRoute>
          }
        />

        {/* Student Find Tutors */}
        <Route
          path="/student/find-tutors"
          element={
            <PrivateRoute role="student">
              <FindTutors />
            </PrivateRoute>
          }
        />

        {/* Student Payments */}
        <Route
          path="/student/payments"
          element={
            <PrivateRoute role="student">
              <StudentPayments />
            </PrivateRoute>
          }
        />

        {/* Student Profile */}
        <Route
          path="/student/profile"
          element={
            <PrivateRoute role="student">
              <StudentProfile />
            </PrivateRoute>
          }
        />

        {/* Chat Room */}
        <Route
          path="/chat/:roomId"
          element={
            <PrivateRoute>
              <ChatRoom />
            </PrivateRoute>
          }
        />

        {/* Tutor Dashboard */}
        <Route
          path="/tutor/dashboard"
          element={
            <PrivateRoute role="tutor">
              <DashboardTutor />
            </PrivateRoute>
          }
        />

        {/* Tutor Job Board */}
        <Route
          path="/tutor/jobs"
          element={
            <PrivateRoute role="tutor">
              <TutorJobBoard />
            </PrivateRoute>
          }
        />
        
        {/* Debug route without PrivateRoute */}
        <Route
          path="/tutor/jobs-debug"
          element={<TutorJobBoard />}
        />

        {/* Tutor Applications */}
        <Route
          path="/tutor/applications"
          element={
            <PrivateRoute role="tutor">
              <TutorApplications />
            </PrivateRoute>
          }
        />

        {/* Tutor Students */}
        <Route
          path="/tutor/students"
          element={
            <PrivateRoute role="tutor">
              <TutorStudents />
            </PrivateRoute>
          }
        />

        {/* Tutor Schedule */}
        <Route
          path="/tutor/schedule"
          element={
            <PrivateRoute role="tutor">
              <TutorSchedule />
            </PrivateRoute>
          }
        />

        {/* Tutor Messages */}
        <Route
          path="/tutor/messages"
          element={
            <PrivateRoute role="tutor">
              <TutorMessages />
            </PrivateRoute>
          }
        />

        {/* Tutor Notifications */}
        <Route
          path="/tutor/notifications"
          element={
            <PrivateRoute role="tutor">
              <TutorNotifications />
            </PrivateRoute>
          }
        />

        {/* Tutor Earnings */}
        <Route
          path="/tutor/earnings"
          element={
            <PrivateRoute role="tutor">
              <TutorEarnings />
            </PrivateRoute>
          }
        />

        {/* Tutor Profile */}
        <Route
          path="/tutor/profile"
          element={
            <PrivateRoute role="tutor">
              <TutorProfile />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute role="admin">
              <DashboardAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/verify"
          element={
            <PrivateRoute role="admin">
              <AdminVerify />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/verification"
          element={
            <PrivateRoute role="admin">
              <AdminVerification />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users-management"
          element={
            <PrivateRoute role="admin">
              <AdminUsersManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/jobs-moderation"
          element={
            <PrivateRoute role="admin">
              <AdminJobsModeration />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <PrivateRoute role="admin">
              <AdminReportsKanban />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute role="admin">
              <AdminUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <PrivateRoute role="admin">
              <AdminJobs />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <PrivateRoute role="admin">
              <AdminApplications />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <PrivateRoute role="admin">
              <AdminReviews />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <PrivateRoute role="admin">
              <AdminAnalytics />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <PrivateRoute role="admin">
              <AdminSettings />
            </PrivateRoute>
          }
        />

        {/* Access Control */}
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="/admin-test" element={<AdminTest />} />

        {/* Legacy admin route */}
        <Route
          path="/dashboard/admin"
          element={
            <PrivateRoute role="admin">
              <DashboardAdmin />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </div>
  );
}
