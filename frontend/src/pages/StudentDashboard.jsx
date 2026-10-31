import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resultAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { getGradeBadgeStyle } from '../utils/gradingConfig';
import {
  GraduationCap,
  Award,
  BookOpen,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Download
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, student } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentResults = async () => {
      try {
        setLoading(true);
        // GET /results automatically scopes to student's own records via backend authMiddleware
        const res = await resultAPI.getAll();
        if (res.success) {
          setResults(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentResults();
  }, []);

  // Compute stats
  const latestSemester = results.length > 0 ? Math.max(...results.map((r) => r.semester)) : student?.semester || 1;
  const currentSemResults = results.filter((r) => r.semester === latestSemester);
  const latestSGPA = currentSemResults.length > 0 ? currentSemResults[0].SGPA : 0;
  const totalSubjects = currentSemResults.length;
  const passedSubjects = currentSemResults.filter((r) => r.marks >= 40).length;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main>
        {/* Welcome Header */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: 'white',
            marginBottom: '1.5rem',
            padding: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#93c5fd', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                <GraduationCap size={16} /> Student Academic Dashboard
              </div>
              <h2 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                Welcome back, {user?.name}!
              </h2>
              <div style={{ color: '#cbd5e1', fontSize: '0.92rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span><strong>Roll Number:</strong> {student?.rollNumber || 'N/A'}</span>
                <span><strong>Department:</strong> {student?.department || 'Engineering'}</span>
                <span><strong>Section:</strong> {student?.section || 'A'}</span>
              </div>
            </div>

            <Link to="/result-summary" className="btn btn-primary btn-sm">
              <Download size={15} /> Download Result Summary
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            icon={Award}
            color="green"
            label="Current SGPA"
            value={latestSGPA > 0 ? latestSGPA.toFixed(2) : 'N/A'}
            subtext={`Semester ${latestSemester} Evaluation`}
          />
          <StatCard
            icon={BookOpen}
            color="blue"
            label="Enrolled Subjects"
            value={totalSubjects}
            subtext={`Active in Sem ${latestSemester}`}
          />
          <StatCard
            icon={TrendingUp}
            color="purple"
            label="Passed Subjects"
            value={`${passedSubjects} / ${totalSubjects}`}
            subtext="Passing threshold >= 40%"
          />
          <StatCard
            icon={Calendar}
            color="amber"
            label="Current Semester"
            value={`Sem ${student?.semester || latestSemester}`}
            subtext="Academic Year 2024-25"
          />
        </div>

        {/* Quick Access Action Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <Link to="/my-results" className="btn btn-secondary" style={{ flex: 1 }}>
            <Layers size={16} /> View Semester Results <ArrowRight size={16} />
          </Link>
          <Link to="/subject-wise-marks" className="btn btn-secondary" style={{ flex: 1 }}>
            <BookOpen size={16} /> View Subject-wise Marks <ArrowRight size={16} />
          </Link>
          <Link to="/result-summary" className="btn btn-secondary" style={{ flex: 1 }}>
            <FileText size={16} /> Open Official Grade Card <ArrowRight size={16} />
          </Link>
        </div>

        {/* Latest Semester Marks Preview Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Marks Overview (Semester {latestSemester})</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                Latest published grades and evaluation points
              </p>
            </div>
            <Link to="/subject-wise-marks" className="btn btn-secondary btn-sm">
              View Detailed Breakdown
            </Link>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Fetching examination records...</p>
            </div>
          ) : currentSemResults.length === 0 ? (
            <div className="empty-state">
              <BookOpen className="empty-icon" />
              <h3>No results published yet</h3>
              <p>Examination marks have not yet been uploaded for your current semester.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Subject Name</th>
                    <th>Marks (100)</th>
                    <th>Grade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSemResults.map((r) => {
                    const badgeStyle = getGradeBadgeStyle(r.grade);
                    const isPass = r.marks >= 40;
                    return (
                      <tr key={r.resultId}>
                        <td><strong>{r.subjectCode}</strong></td>
                        <td>{r.subjectName}</td>
                        <td><strong>{r.marks}</strong> / 100</td>
                        <td>
                          <span className="grade-badge" style={badgeStyle}>
                            {r.grade}
                          </span>
                        </td>
                        <td>
                          <span
                            className="grade-badge"
                            style={{
                              backgroundColor: isPass ? '#dcfce7' : '#fee2e2',
                              color: isPass ? '#15803d' : '#b91c1c',
                            }}
                          >
                            {isPass ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
