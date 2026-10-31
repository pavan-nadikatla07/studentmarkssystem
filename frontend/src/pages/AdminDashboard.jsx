import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentAPI, resultAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { getGradeBadgeStyle } from '../utils/gradingConfig';
import {
  Users,
  FileCheck2,
  TrendingUp,
  Percent,
  PlusCircle,
  FileText,
  BarChart3,
  Layers,
  ArrowRight
} from 'lucide-react';
import Alert from '../components/Alert';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [semesterReport, setSemesterReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [studentsRes, resultsRes, reportRes] = await Promise.all([
          studentAPI.getAll(),
          resultAPI.getAll(),
          resultAPI.getSemesterReport(),
        ]);

        if (studentsRes.success) setStudents(studentsRes.data);
        if (resultsRes.success) setResults(resultsRes.data);
        if (reportRes.success) setSemesterReport(reportRes.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch admin dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute overview metrics
  const totalStudents = students.length;
  const totalResults = results.length;
  const passingEntries = results.filter((r) => r.marks >= 40).length;
  const overallPassRate = totalResults > 0 ? ((passingEntries / totalResults) * 100).toFixed(1) : '100';

  // Average marks
  const avgMarks =
    totalResults > 0
      ? (results.reduce((acc, curr) => acc + curr.marks, 0) / totalResults).toFixed(1)
      : '0';

  // Recent 5 entries
  const recentEntries = results.slice(-5).reverse();

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main>
        {/* Header */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            color: 'white',
            marginBottom: '1.5rem',
            padding: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#c7d2fe', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                <BarChart3 size={16} /> Examination Administration Panel
              </div>
              <h2 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                Admin Portal &bull; {user?.name}
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem' }}>
                Manage student records, record semester marks, generate aggregate reports, and publish examination evaluations.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/manage-results" className="btn btn-primary btn-sm">
                <Layers size={16} /> Manage Results
              </Link>
            </div>
          </div>
        </div>

        {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

        {/* Statistical Metrics */}
        <div className="stats-grid">
          <StatCard
            icon={Users}
            color="blue"
            label="Total Students"
            value={totalStudents}
            subtext="Enrolled Candidates"
          />
          <StatCard
            icon={FileCheck2}
            color="green"
            label="Total Result Entries"
            value={totalResults}
            subtext="Recorded Subject Scores"
          />
          <StatCard
            icon={Percent}
            color="purple"
            label="Overall Pass Rate"
            value={`${overallPassRate}%`}
            subtext="Scored >= 40 Marks"
          />
          <StatCard
            icon={TrendingUp}
            color="amber"
            label="Mean Examination Score"
            value={`${avgMarks} / 100`}
            subtext="Across All Semesters"
          />
        </div>

        {/* Semester Analytics from MongoDB Aggregate() */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Semester Reports (Generated via MongoDB Aggregate)</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                Aggregated performance metrics, student counts, and pass rates by semester
              </p>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Aggregating semester data...</p>
            </div>
          ) : !semesterReport?.semesterSummary || semesterReport.semesterSummary.length === 0 ? (
            <div className="empty-state">
              <BarChart3 className="empty-icon" />
              <h3>No report data available</h3>
              <p>Add results to see real-time MongoDB aggregation metrics.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>Evaluated Students</th>
                    <th>Total Subject Records</th>
                    <th>Average Score</th>
                    <th>Highest Score</th>
                    <th>Lowest Score</th>
                    <th>Passing Records</th>
                    <th>Pass Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {semesterReport.semesterSummary.map((sem) => (
                    <tr key={sem.semester}>
                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>
                          Semester {sem.semester}
                        </strong>
                      </td>
                      <td>{sem.studentCount} Students</td>
                      <td>{sem.totalEntries} entries</td>
                      <td><strong>{sem.averageMarks}</strong> / 100</td>
                      <td style={{ color: '#059669', fontWeight: 600 }}>{sem.highestMarks}</td>
                      <td style={{ color: '#dc2626', fontWeight: 600 }}>{sem.lowestMarks}</td>
                      <td>{sem.passingCount} passed</td>
                      <td>
                        <span
                          className="grade-badge"
                          style={{
                            backgroundColor: sem.passPercentage >= 75 ? '#dcfce7' : '#fef3c7',
                            color: sem.passPercentage >= 75 ? '#15803d' : '#b45309',
                          }}
                        >
                          {sem.passPercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Result Entries Table & Quick Actions */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Marks Uploaded</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                Most recently updated student records
              </p>
            </div>

            <Link to="/manage-results" className="btn btn-secondary btn-sm">
              View All &amp; Edit <ArrowRight size={14} />
            </Link>
          </div>

          {recentEntries.length === 0 ? (
            <div className="empty-state">
              <FileText className="empty-icon" />
              <h3>No recent results</h3>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Semester</th>
                    <th>Subject</th>
                    <th>Marks</th>
                    <th>Grade</th>
                    <th>SGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEntries.map((r) => {
                    const badgeStyle = getGradeBadgeStyle(r.grade);
                    return (
                      <tr key={r.resultId}>
                        <td><strong>{r.student?.studentName || 'Student'}</strong></td>
                        <td><code>{r.student?.rollNumber || r.studentId}</code></td>
                        <td>Sem {r.semester}</td>
                        <td>
                          <strong>{r.subjectCode}</strong>: {r.subjectName}
                        </td>
                        <td><strong>{r.marks}</strong> / 100</td>
                        <td>
                          <span className="grade-badge" style={badgeStyle}>
                            {r.grade}
                          </span>
                        </td>
                        <td>{r.SGPA ? r.SGPA.toFixed(2) : '-'}</td>
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

export default AdminDashboard;
