import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// 9 Pages required by PDF
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import MyResults from './pages/MyResults';
import SubjectWiseMarks from './pages/SubjectWiseMarks';
import ResultSummary from './pages/ResultSummary';
import AdminDashboard from './pages/AdminDashboard';
import ManageResults from './pages/ManageResults';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Student Protected Routes */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-results"
            element={
              <ProtectedRoute allowedRole="student">
                <MyResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subject-wise-marks"
            element={
              <ProtectedRoute allowedRole="student">
                <SubjectWiseMarks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/result-summary"
            element={
              <ProtectedRoute allowedRole="student">
                <ResultSummary />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-results"
            element={
              <ProtectedRoute allowedRole="admin">
                <ManageResults />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
