import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resultAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import { getGradeBadgeStyle } from '../utils/gradingConfig';
import { CheckSquare, Calendar, Award, BookOpen, FileText, ArrowRight } from 'lucide-react';
import Alert from '../components/Alert';

const MyResults = () => {
  const { user, student } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await resultAPI.getAll();
        if (res.success) {
          setResults(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch semester results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Group results by semester
  const semestersAvailable = [...new Set(results.map((r) => r.semester))].sort((a, b) => b - a);

  const filteredResults =
    selectedSemester === 'all'
      ? results
      : results.filter((r) => r.semester === Number(selectedSemester));

  // Compute stats per semester
  const semesterGroups = semestersAvailable.map((sem) => {
    const semItems = results.filter((r) => r.semester === sem);
    const sgpa = semItems.length > 0 ? semItems[0].SGPA : 0;
    const totalMarks = semItems.reduce((sum, item) => sum + item.marks, 0);
    const maxMarks = semItems.length * 100;
    const percentage = semItems.length > 0 ? ((totalMarks / maxMarks) * 100).toFixed(1) : 0;
    const allPassed = semItems.every((item) => item.marks >= 40);

    return {
      semester: sem,
      items: semItems,
      sgpa,
      totalMarks,
      maxMarks,
      percentage,
      allPassed,
    };
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main>
        <div className="card-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.65rem' }}>My Examination Results</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
              Historical semester-wise performance records for {user?.name} ({student?.rollNumber})
            </p>
          </div>

          {/* Filter by semester */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Semester:</label>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="all">All Semesters</option>
              {semestersAvailable.map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading semester results...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="card empty-state">
            <CheckSquare className="empty-icon" />
            <h3>No results recorded</h3>
            <p>You do not currently have any published examination records.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {semesterGroups
              .filter((g) => selectedSemester === 'all' || g.semester === Number(selectedSemester))
              .map((group) => (
                <div key={group.semester} className="card" style={{ padding: '1.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      marginBottom: '1.25rem',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h3 style={{ fontSize: '1.3rem' }}>Semester {group.semester} Results</h3>
                        <span
                          className="grade-badge"
                          style={{
                            backgroundColor: group.allPassed ? '#dcfce7' : '#fee2e2',
                            color: group.allPassed ? '#15803d' : '#b91c1c',
                          }}
                        >
                          {group.allPassed ? 'ALL PASSED' : 'REAPPEAR / BACKLOG'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                        Academic Session 2024-2025 &bull; {group.items.length} Course Subjects
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 600 }}>
                          Semester SGPA
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                          {group.sgpa.toFixed(2)}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 600 }}>
                          Total Marks
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-secondary)' }}>
                          {group.totalMarks} / {group.maxMarks}
                        </div>
                      </div>

                      <Link
                        to={`/result-summary?semester=${group.semester}`}
                        className="btn btn-secondary btn-sm"
                        style={{ marginLeft: '0.5rem' }}
                      >
                        <FileText size={15} /> Result Summary
                      </Link>
                    </div>
                  </div>

                  {/* Table of Subjects */}
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Subject Code</th>
                          <th>Subject Name</th>
                          <th>Marks (100)</th>
                          <th>Grade</th>
                          <th>Grade Point</th>
                          <th>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((sub) => {
                          const badgeStyle = getGradeBadgeStyle(sub.grade);
                          const isPass = sub.marks >= 40;
                          return (
                            <tr key={sub.resultId}>
                              <td><strong>{sub.subjectCode}</strong></td>
                              <td>{sub.subjectName}</td>
                              <td><strong>{sub.marks}</strong></td>
                              <td>
                                <span className="grade-badge" style={badgeStyle}>
                                  {sub.grade}
                                </span>
                              </td>
                              <td>
                                {sub.grade === 'O' ? 10 :
                                 sub.grade === 'A+' ? 9 :
                                 sub.grade === 'A' ? 8 :
                                 sub.grade === 'B+' ? 7 :
                                 sub.grade === 'B' ? 6 :
                                 sub.grade === 'P' ? 5 : 0} / 10
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
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyResults;
