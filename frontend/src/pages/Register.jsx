import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, GraduationCap, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Alert from '../components/Alert';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    department: 'Computer Science & Engineering',
    semester: 4,
    section: 'A',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // When roll number changes, auto-generate official SVES college email
      if (name === 'rollNumber') {
        const cleanRoll = value.trim().toLowerCase();
        updated.email = cleanRoll ? `${cleanRoll}@sves.org.in` : '';
      }
      return updated;
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanRollNumber = formData.rollNumber.trim().toUpperCase();
    if (!cleanRollNumber) {
      setError('Please provide a valid Student Roll Number');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    // Official SVES college email: <rollNumber>@sves.org.in
    const officialCollegeEmail = `${cleanRollNumber.toLowerCase()}@sves.org.in`;

    try {
      await register({
        name: formData.name.trim(),
        email: officialCollegeEmail,
        password: formData.password.trim(),
        role: 'student',
        rollNumber: cleanRollNumber,
        department: formData.department,
        semester: Number(formData.semester),
        section: formData.section.trim().toUpperCase(),
      });

      navigate('/student-dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '1rem auto' }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <UserPlus size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Student Registration</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
            Create your student portal account to access semester grades
          </p>
        </div>

        {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Roll Number *</label>
              <input
                type="text"
                name="rollNumber"
                className="form-input"
                required
                placeholder="e.g. 2024CS001"
                value={formData.rollNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Official College Email *</label>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                Format: &lt;ROLL_NUMBER&gt;@sves.org.in
              </span>
            </div>
            <input
              type="email"
              name="email"
              className="form-input"
              required
              readOnly
              style={{ backgroundColor: 'var(--color-bg-subtle, #f8fafc)', cursor: 'default' }}
              placeholder="Auto-generated from Roll Number (e.g. 2024cs001@sves.org.in)"
              value={formData.email}
              onChange={handleChange}
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Your college email is automatically assigned as <code>{formData.rollNumber ? `${formData.rollNumber.trim().toLowerCase()}@sves.org.in` : '<rollnumber>@sves.org.in'}</code>.
            </span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                name="department"
                className="form-select"
                value={formData.department}
                onChange={handleChange}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Current Semester *</label>
              <select
                name="semester"
                className="form-select"
                value={formData.semester}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Your currently enrolled semester. Examination records can only be entered up to this semester.
              </span>
            </div>

            <div className="form-group" style={{ maxWidth: '100px' }}>
              <label className="form-label">Section *</label>
              <input
                type="text"
                name="section"
                className="form-input"
                maxLength="2"
                required
                value={formData.section}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="register-password" className="form-label">Password *</label>
              <div className="password-input-wrapper">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  required
                  placeholder="Minimum 6 characters"
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
                  aria-pressed={showPassword}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-confirmPassword" className="form-label">Confirm Password *</label>
              <div className="password-input-wrapper">
                <input
                  id="register-confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-input"
                  required
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  aria-pressed={showConfirmPassword}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Log in to portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
