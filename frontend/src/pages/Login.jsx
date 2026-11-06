import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Shield, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';
import Alert from '../components/Alert';
import { StudentIllustration, AdminIllustration } from '../components/AuthIllustrations';

const Login = ({ defaultRole }) => {
  const navigate = useNavigate();
  const { role: routeRole } = useParams();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

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
  const themeColor = isAdmin ? 'var(--color-admin, #7c3aed)' : 'var(--color-student, #2563eb)';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    navigate(`/login/${newRole}`, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanIdentifier = email.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setError('Please enter both your email address and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login(cleanIdentifier, cleanPassword);
      // Route based on user role returned from API
      if (res.user?.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Fill for Demo & Evaluation
  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
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
                  <span>Admin Portal</span>
                </>
              ) : (
                <>
                  <GraduationCap size={16} />
                  <span>Student Portal</span>
                </>
              )}
            </div>

            <div className="auth-illustration-graphic">
              {isAdmin ? <AdminIllustration /> : <StudentIllustration />}
            </div>

            <div className="auth-illustration-caption">
              <h3>{isAdmin ? 'Academic Administration' : 'Examination Results Portal'}</h3>
              <p>
                {isAdmin
                  ? 'Securely upload marks, publish grade reports, and manage student performance records.'
                  : 'Instant access to your semester results, subject-wise marks breakdown, and digital grade cards.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Panel */}
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
            <h1 className="auth-heading">Login</h1>
            <p className="auth-subheading">
              {isAdmin
                ? 'Sign in with your administrator account'
                : 'Sign in to access your student results'}
            </p>
          </div>

          {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email Address Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">
                Email Address
              </label>
              <input
                id="auth-email"
                type="text"
                className="form-input"
                required
                placeholder={
                  isAdmin
                    ? 'e.g. admin@sves.org.in'
                    : 'e.g. 2024cs001@sves.org.in or 2024CS001'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="auth-password">
                  Password
                </label>
              </div>
              <div className="password-input-wrapper">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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

            {/* Submit Button */}
            <button
              type="submit"
              className={`auth-submit-btn ${isAdmin ? 'admin-btn' : 'student-btn'}`}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Login'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Don't have an account? Register Link */}
          <div className="auth-footer-link">
            <span>Don't have an account? </span>
            <Link
              to={isAdmin ? '/register/admin' : '/register/student'}
              className={`auth-accent-link ${isAdmin ? 'admin-color' : 'student-color'}`}
            >
              Register
            </Link>
          </div>

          {/* Quick Demo Credentials for Viva / Evaluation */}
          <div className="auth-demo-section">
            <button
              type="button"
              className="demo-toggle-btn"
              onClick={() => setShowDemo(!showDemo)}
            >
              <span>{showDemo ? 'Hide Quick Demo Accounts' : 'Use Demo Account (1-Click)'}</span>
            </button>

            {showDemo && (
              <div className="demo-accounts-pill-list">
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => fillDemo('admin@sves.org.in', 'adminpassword123')}
                    className="demo-pill-btn admin"
                  >
                    <CheckCircle2 size={14} />
                    <span>Admin: admin@sves.org.in</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => fillDemo('2024cs001@sves.org.in', 'student123')}
                      className="demo-pill-btn student"
                    >
                      <CheckCircle2 size={14} />
                      <span>Student (Rahul): 2024cs001@sves.org.in</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemo('2024CS002', 'student123')}
                      className="demo-pill-btn student"
                    >
                      <CheckCircle2 size={14} />
                      <span>Student (Priya by Roll): 2024CS002</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
