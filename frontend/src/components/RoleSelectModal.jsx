import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { StudentAvatar, AdminAvatar } from './AuthIllustrations';

/**
 * RoleSelectModal - Centered popup for role selection (Student vs Admin)
 * Used for both Login and Register flows
 */
const RoleSelectModal = ({ isOpen, mode = 'login', onClose }) => {
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLogin = mode === 'login';
  const heading = isLogin ? 'Login' : 'Register';

  const handleSelectRole = (role) => {
    onClose();
    if (isLogin) {
      navigate(`/login/${role}`);
    } else {
      navigate(`/register/${role}`);
    }
  };

  return (
    <div className="role-modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="role-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="role-modal-close-btn"
          aria-label="Close"
          title="Close"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="role-modal-header">
          <h2 className="role-modal-title">{heading}</h2>
          <p className="role-modal-subtitle">Select Your Role</p>
        </div>

        {/* Two Role Selection Cards */}
        <div className="role-cards-grid">
          {/* Student Role Card */}
          <div
            className="role-card student-card"
            onClick={() => handleSelectRole('student')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectRole('student');
              }
            }}
          >
            <div className="role-avatar-wrapper student">
              <StudentAvatar size={88} />
            </div>
            <h3 className="role-card-label">Student</h3>
            <p className="role-card-desc">
              {isLogin ? 'View semester grades and examination marksheets' : 'Register your student portal account'}
            </p>
            <button
              type="button"
              className="role-continue-btn student-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectRole('student');
              }}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Admin Role Card */}
          <div
            className="role-card admin-card"
            onClick={() => handleSelectRole('admin')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectRole('admin');
              }
            }}
          >
            <div className="role-avatar-wrapper admin">
              <AdminAvatar size={88} />
            </div>
            <h3 className="role-card-label">Admin</h3>
            <p className="role-card-desc">
              {isLogin ? 'Publish marks, manage students and exam results' : 'Register administrative faculty account'}
            </p>
            <button
              type="button"
              className="role-continue-btn admin-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectRole('admin');
              }}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectModal;

