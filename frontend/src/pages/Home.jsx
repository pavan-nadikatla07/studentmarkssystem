import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Award,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  BarChart3,
  LogIn,
  UserPlus
} from 'lucide-react';
import RoleSelectModal from '../components/RoleSelectModal';

const Home = () => {
  const { isAuthenticated, isStudent, isAdmin } = useAuth();
  const [modalMode, setModalMode] = useState(null); // 'login' | 'register' | null

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {/* Hero Section */}
        <section
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '24px',
            padding: '3.5rem 2.5rem',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '750px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(37, 99, 235, 0.25)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '9999px',
                padding: '0.4rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#93c5fd',
                marginBottom: '1.25rem',
              }}
            >
              <Sparkles size={16} /> Inspired by SIH 2025 &bull; AI Smart Education Ecosystem
            </div>

            <h1
              style={{
                fontSize: '2.8rem',
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: '1.25rem',
                color: '#ffffff',
              }}
            >
              Online Examination <br />
              <span style={{ color: '#60a5fa' }}>Result Portal</span>
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                color: '#cbd5e1',
                marginBottom: '2rem',
                lineHeight: 1.6,
              }}
            >
              Secure, centralized, and transparent evaluation portal for engineering students and
              academic administration. View semester marks, calculate SGPA dynamically, and download
              authentic result summaries.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {isAuthenticated ? (
                isStudent ? (
                  <Link to="/student-dashboard" className="btn btn-primary btn-lg">
                    Go to Student Dashboard <ArrowRight size={18} />
                  </Link>
                ) : (
                  <Link to="/admin-dashboard" className="btn btn-primary btn-lg">
                    Go to Admin Dashboard <ArrowRight size={18} />
                  </Link>
                )
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setModalMode('login')}
                    className="btn btn-primary btn-lg"
                    style={{ cursor: 'pointer' }}
                  >
                    <LogIn size={18} />
                    <span>Login</span>
                    <ArrowRight size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalMode('register')}
                    className="btn btn-secondary btn-lg"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                    }}
                  >
                    <UserPlus size={18} />
                    <span>Register</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Official Notice Board */}
        <div
          className="card"
          style={{
            borderLeft: '4px solid var(--color-primary)',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className="user-role-pill admin">Official Notice</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Academic Session 2024-2025</span>
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>
            Semester Examination Results Have Been Published
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)' }}>
            Students can log in with their registered credentials to check their subject-wise marks, SGPA breakdown, and download their official digital grade cards.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <section>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>Portal Highlights</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>Built specifically on the MERN technology stack</p>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="stat-icon blue">
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem' }}>Instant SGPA Calculation</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Accurate 10-point scale grading and SGPA calculations generated instantly upon mark entry.
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="stat-icon green">
                <FileSpreadsheet size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem' }}>Downloadable Grade Cards</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                One-click download and print-ready format matching engineering college marksheets.
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="stat-icon purple">
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem' }}>Role-Based Access Control</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Strict isolation between Student and Administrator modules using signed JWT authentication.
              </p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="stat-icon amber">
                <BarChart3 size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem' }}>Administrative Reports</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Aggregated semester statistics, pass percentage metrics, and subject performance analysis.
              </p>
            </div>
          </div>
        </section>

        {/* Tech Stack Footer Pills */}
        <div className="card" style={{ textAlign: 'center', background: '#f8fafc' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Implemented Architecture
          </h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ padding: '0.4rem 0.9rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem' }}>
              ReactJS &bull; Single Page App
            </span>
            <span style={{ padding: '0.4rem 0.9rem', background: '#dcfce7', color: '#15803d', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem' }}>
              NodeJS + Express &bull; REST API
            </span>
            <span style={{ padding: '0.4rem 0.9rem', background: '#fef3c7', color: '#b45309', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem' }}>
              MongoDB Atlas &bull; Document DB
            </span>
            <span style={{ padding: '0.4rem 0.9rem', background: '#ede9fe', color: '#6d28d9', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem' }}>
              JWT &bull; Secure Authentication
            </span>
          </div>
        </div>
      </div>

      {/* Hero Role Selection Modal */}
      <RoleSelectModal
        isOpen={!!modalMode}
        mode={modalMode || 'login'}
        onClose={() => setModalMode(null)}
      />
    </>
  );
};

export default Home;
