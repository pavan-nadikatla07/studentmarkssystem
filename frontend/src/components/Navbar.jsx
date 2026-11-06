import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User, LayoutDashboard, FileText, CheckSquare, Shield } from 'lucide-react';
import RoleSelectModal from './RoleSelectModal';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const [modalMode, setModalMode] = useState(null); // 'login' | 'register' | null

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          {/* Logo & Branding */}
          <Link to="/" className="brand-logo">
            <div className="brand-icon">
              <GraduationCap size={22} />
            </div>
            <span>ExamPortal</span>
          </Link>

          <nav>
            <ul className="nav-links">
              {isAuthenticated ? (
                <>
                  {isStudent && (
                    <>
                      <li>
                        <NavLink
                          to="/student-dashboard"
                          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/my-results"
                          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                          <CheckSquare size={16} /> My Results
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/result-summary"
                          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                          <FileText size={16} /> Summary
                        </NavLink>
                      </li>
                    </>
                  )}

                  {isAdmin && (
                    <>
                      <li>
                        <NavLink
                          to="/admin-dashboard"
                          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                          <Shield size={16} /> Admin Portal
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/manage-results"
                          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                          <FileText size={16} /> Manage Results
                        </NavLink>
                      </li>
                    </>
                  )}

                  <li className="user-badge">
                    <User size={15} color="var(--color-primary)" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                    <span className={`user-role-pill ${user?.role}`}>
                      {user?.role}
                    </span>
                  </li>

                  <li>
                    <button
                      onClick={handleLogout}
                      className="btn btn-secondary btn-sm"
                      title="Sign Out"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </li>
                </>
              ) : (
                /* Exactly two navigation buttons: Login & Register */
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => setModalMode('login')}
                      className="nav-auth-btn nav-login-btn"
                    >
                      Login
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setModalMode('register')}
                      className="nav-auth-btn nav-register-btn"
                    >
                      Register
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* Role Selection Popup Modal */}
      <RoleSelectModal
        isOpen={!!modalMode}
        mode={modalMode || 'login'}
        onClose={() => setModalMode(null)}
      />
    </>
  );
};

export default Navbar;
