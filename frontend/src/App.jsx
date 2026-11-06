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
          {/* Public Authentication Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/student-login" element={<Login defaultRole="student" />} />
          <Route path="/admin-login" element={<Login defaultRole="admin" />} />

          <Route path="/register" element={<Register />} />
          <Route path="/register/:role" element={<Register />} />
          <Route path="/student-register" element={<Register defaultRole="student" />} />
          <Route path="/admin-register" element={<Register defaultRole="admin" />} />

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
