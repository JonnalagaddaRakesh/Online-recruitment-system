import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import { ProtectedRoute, GuestOnlyRoute } from './components/common/ProtectedRoute';

// Public & Applicant Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobListPage from './pages/JobListPage';
import JobDetailsPage from './pages/JobDetailsPage';
import ApplyJobPage from './pages/ApplyJobPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import ApplicantProfilePage from './pages/ApplicantProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages & Layout
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import AdminJobCreatePage from './pages/admin/AdminJobCreatePage';
import AdminJobEditPage from './pages/admin/AdminJobEditPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminApplicationDetailPage from './pages/admin/AdminApplicationDetailPage';
import AdminApplicantsPage from './pages/admin/AdminApplicantsPage';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />

          {/* Guest Only Routes (Redirect if logged in) */}
          <Route
            path="/login"
            element={
              <GuestOnlyRoute>
                <LoginPage />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnlyRoute>
                <RegisterPage />
              </GuestOnlyRoute>
            }
          />

          {/* Protected Applicant Routes */}
          <Route
            path="/jobs/:id/apply"
            element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <ApplyJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <MyApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['applicant', 'admin']}>
                <ApplicantProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="jobs" element={<AdminJobsPage />} />
            <Route path="jobs/create" element={<AdminJobCreatePage />} />
            <Route path="jobs/:id/edit" element={<AdminJobEditPage />} />
            <Route path="applications" element={<AdminApplicationsPage />} />
            <Route path="applications/:id" element={<AdminApplicationDetailPage />} />
            <Route path="applicants" element={<AdminApplicantsPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
