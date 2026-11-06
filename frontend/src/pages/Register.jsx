import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Shield, GraduationCap, ArrowRight } from 'lucide-react';
import Alert from '../components/Alert';
import { StudentIllustration, AdminIllustration } from '../components/AuthIllustrations';

const Register = ({ defaultRole }) => {
  const navigate = useNavigate();
  const { role: routeRole } = useParams();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  // Determine current role: route param > prop > query param > default 'student'
  const roleFromQuery = searchParams.get('role');
  const initialRole = (routeRole || defaultRole || roleFromQuery || 'student').toLowerCase();
  const [role, setRole] = useState(initialRole === 'admin' ? 'admin' : 'student');

  useEffect(() => {
    if (routeRole) {
      setRole(routeRole.toLowerCase() === 'admin' ? 'admin' : 'student');
    }
  }, [routeRole]);

  const isAdmin = role === 'admin';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    navigate(`/register/${newRole}`, { replace: true });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPassword = formData.password.trim();
    const cleanConfirmPassword = formData.confirmPassword.trim();

    if (!cleanName || !cleanEmail || !cleanPassword || !cleanConfirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (cleanPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isAdmin) {
        // Admin registration
        await register({
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
          role: 'admin',
        });
        navigate('/admin-dashboard');
      } else {
        // Student registration - ensure rollNumber is derived from email or input
        const emailPrefix = cleanEmail.includes('@')
          ? cleanEmail.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '')
          : cleanEmail.toUpperCase().replace(/[^A-Z0-9]/g, '');

        const derivedRoll = emailPrefix.length >= 3
          ? emailPrefix
          : `STU${Date.now().toString().slice(-6)}`;

        await register({
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
          role: 'student',
          rollNumber: derivedRoll,
          department: 'Computer Science & Engineering',
          semester: 1,
          section: 'A',
        });
        navigate('/student-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-page-wrapper ${isAdmin ? 'admin-theme' : 'student-theme'}`}>
      <div className="auth-card-container">
        {/* Left Side: Role Illustration Panel */}
        <div className={`auth-illustration-side ${isAdmin ? 'admin-bg' : 'student-bg'}`}>
          <div className="auth-illustration-content">
            <div className="auth-role-tag">
              {isAdmin ? (
                <>
                  <Shield size={16} />
                  <span>Admin Registration</span>
                </>
              ) : (
                <>
                  <GraduationCap size={16} />
                  <span>Student Registration</span>
                </>
              )}
            </div>

            <div className="auth-illustration-graphic">
              {isAdmin ? <AdminIllustration /> : <StudentIllustration />}
            </div>

            <div className="auth-illustration-caption">
              <h3>{isAdmin ? 'Faculty Administration' : 'Join the Examination Portal'}</h3>
              <p>
                {isAdmin
                  ? 'Create an administrative account to oversee evaluations and publish digital marks.'
                  : 'Register your student credentials to view semester results and download official digital grade cards.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form Panel */}
        <div className="auth-form-side">
          {/* Role Toggle Switcher */}
          <div className="auth-role-switcher" role="tablist">
            <button
              type="button"
              className={`role-switch-btn ${!isAdmin ? 'active student' : ''}`}
              onClick={() => handleRoleChange('student')}
              role="tab"
              aria-selected={!isAdmin}
            >
              <GraduationCap size={16} />
              <span>Student</span>
            </button>
            <button
              type="button"
              className={`role-switch-btn ${isAdmin ? 'active admin' : ''}`}
              onClick={() => handleRoleChange('admin')}
              role="tab"
              aria-selected={isAdmin}
            >
              <Shield size={16} />
              <span>Admin</span>
            </button>
          </div>

          <div className="auth-form-header">
            <h1 className="auth-heading">Register</h1>
            <p className="auth-subheading">
              {isAdmin ? 'Create your admin account' : 'Create your student account'}
            </p>
          </div>

          {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Full Name Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                name="name"
                className="form-input"
                required
                placeholder={isAdmin ? 'e.g. Prof. Ramesh Kumar' : 'e.g. Rahul Sharma'}
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                autoFocus
              />
            </div>

            {/* Email Address Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                name="email"
                className="form-input"
                required
                placeholder={isAdmin ? 'admin@sves.org.in' : '2024cs001@sves.org.in'}
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-password">
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  required
                  placeholder="Create a strong password (min 6 chars)"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm-password">
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-input"
                  required
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Register Submit Button */}
            <button
              type="submit"
              className={`auth-submit-btn ${isAdmin ? 'admin-btn' : 'student-btn'}`}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Already have an account? Login Link */}
          <div className="auth-footer-link">
            <span>Already have an account? </span>
            <Link
              to={isAdmin ? '/login/admin' : '/login/student'}
              className={`auth-accent-link ${isAdmin ? 'admin-color' : 'student-color'}`}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
