import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Shield, GraduationCap, ArrowRight } from 'lucide-react';
import Alert from '../components/Alert';
import { StudentIllustration, AdminIllustration } from '../components/AuthIllustrations';

const AVAILABLE_BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
];

const AVAILABLE_SEMESTERS = [
  { val: 1, label: 'Semester 1 (I)' },
  { val: 2, label: 'Semester 2 (II)' },
  { val: 3, label: 'Semester 3 (III)' },
  { val: 4, label: 'Semester 4 (IV)' },
  { val: 5, label: 'Semester 5 (V)' },
  { val: 6, label: 'Semester 6 (VI)' },
  { val: 7, label: 'Semester 7 (VII)' },
  { val: 8, label: 'Semester 8 (VIII)' },
];

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
    rollNumber: '',
    branch: '',
    semester: '',
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
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // When rollNumber changes in student mode, auto-fill college email if empty or formatted
      if (!isAdmin && name === 'rollNumber') {
        const cleanRoll = value.trim().toLowerCase();
        if (cleanRoll && (!prev.email || prev.email.endsWith('@sves.org.in'))) {
          updated.email = `${cleanRoll}@sves.org.in`;
        }
      }
      return updated;
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPassword = formData.password.trim();
    const cleanConfirmPassword = formData.confirmPassword.trim();
    const cleanRollNumber = formData.rollNumber.trim().toUpperCase();
    const cleanBranch = formData.branch.trim();
    const cleanSemester = formData.semester;

    // Frontend Validations
    if (!cleanName) {
      setError(isAdmin ? 'Please enter your Full Name' : 'Please enter your Student Name');
      return;
    }

    if (!cleanEmail) {
      setError('Please enter your Email Address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isAdmin) {
      // Student-specific mandatory validations
      if (!cleanRollNumber) {
        setError('Please enter your Roll Number');
        return;
      }

      if (cleanRollNumber.length < 3) {
        setError('Please enter a valid Roll Number (e.g. 2024CS001)');
        return;
      }

      if (!cleanBranch) {
        setError('Please select your Branch');
        return;
      }

      if (!cleanSemester) {
        setError('Please select your Current Semester');
        return;
      }
    }

    if (!cleanPassword) {
      setError('Please create a password');
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
        // Student registration with mandatory details
        await register({
          name: cleanName,
          rollNumber: cleanRollNumber,
          branch: cleanBranch,
          department: cleanBranch,
          semester: Number(cleanSemester),
          email: cleanEmail,
          password: cleanPassword,
          role: 'student',
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
            {!isAdmin ? (
              /* STUDENT REGISTRATION FORM - MANDATORY FIELDS */
              <>
                {/* Row 1: Student Name & Roll Number */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="register-name">
                      Student Name *
                    </label>
                    <input
                      id="register-name"
                      type="text"
                      name="name"
                      className="form-input"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="register-rollNumber">
                      Roll Number *
                    </label>
                    <input
                      id="register-rollNumber"
                      type="text"
                      name="rollNumber"
                      className="form-input"
                      required
                      placeholder="e.g. 2024CS001"
                      value={formData.rollNumber}
                      onChange={handleChange}
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Row 2: Branch & Current Semester */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="register-branch">
                      Branch *
                    </label>
                    <select
                      id="register-branch"
                      name="branch"
                      className="form-select"
                      required
                      value={formData.branch}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Branch --</option>
                      {AVAILABLE_BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="register-semester">
                      Current Semester *
                    </label>
                    <select
                      id="register-semester"
                      name="semester"
                      className="form-select"
                      required
                      value={formData.semester}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Semester --</option>
                      {AVAILABLE_SEMESTERS.map((s) => (
                        <option key={s.val} value={s.val}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Email Address */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" htmlFor="register-email">
                      Email Address *
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                      SVES Format: &lt;roll&gt;@sves.org.in
                    </span>
                  </div>
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    className="form-input"
                    required
                    placeholder="2024cs001@sves.org.in"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>

                {/* Row 4: Password & Confirm Password */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="register-password">
                      Password *
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className="form-input"
                        required
                        placeholder="Min 6 characters"
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

                  <div className="form-group">
                    <label className="form-label" htmlFor="register-confirm-password">
                      Confirm Password *
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        id="register-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        className="form-input"
                        required
                        placeholder="Re-enter password"
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
                </div>
              </>
            ) : (
              /* ADMIN REGISTRATION FORM */
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="register-name">
                    Full Name *
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    name="name"
                    className="form-input"
                    required
                    placeholder="e.g. Prof. Ramesh Kumar"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="register-email">
                    Email Address *
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    className="form-input"
                    required
                    placeholder="admin@sves.org.in"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="register-password">
                      Password *
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className="form-input"
                        required
                        placeholder="Min 6 characters"
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

                  <div className="form-group">
                    <label className="form-label" htmlFor="register-confirm-password">
                      Confirm Password *
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        id="register-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        className="form-input"
                        required
                        placeholder="Re-enter password"
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
                </div>
              </>
            )}

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
