import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  FileText,
  Shield,
  Layers,
  GraduationCap
} from 'lucide-react';

const Sidebar = () => {
  const { isStudent, isAdmin, student } = useAuth();

  return (
    <aside className="sidebar">
      {isStudent && (
        <>
          <div style={{ marginBottom: '1.25rem', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 600 }}>
              Roll Number
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-secondary)' }}>
              {student?.rollNumber || 'Enrolled Student'}
            </div>
          </div>

          <div className="sidebar-title">Student Portal</div>
          <ul className="sidebar-menu">
            <li>
              <NavLink
                to="/student-dashboard"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} /> Student Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/my-results"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <CheckSquare size={18} /> My Results
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/subject-wise-marks"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <BookOpen size={18} /> Subject-wise Marks
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/result-summary"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <FileText size={18} /> Result Summary
              </NavLink>
            </li>
          </ul>
        </>
      )}

      {isAdmin && (
        <>
          <div className="sidebar-title">Administration</div>
          <ul className="sidebar-menu">
            <li>
              <NavLink
                to="/admin-dashboard"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Shield size={18} /> Admin Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/manage-results"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Layers size={18} /> Manage Results
              </NavLink>
            </li>
          </ul>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
