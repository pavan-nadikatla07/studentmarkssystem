import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { resultAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import { getGradeBadgeStyle } from '../utils/gradingConfig';
import { BookOpen, Search, Filter, CheckCircle2, XCircle } from 'lucide-react';
import Alert from '../components/Alert';

const SubjectWiseMarks = () => {
  const { user, student } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
        setError(err.message || 'Failed to load subject-wise marks');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const semesters = [...new Set(results.map((r) => r.semester))].sort();

  const filteredResults = results.filter((item) => {
    const matchesSearch =
      item.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester =
      selectedSemester === 'all' || item.semester === Number(selectedSemester);
    return matchesSearch && matchesSemester;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main>
        <div className="card-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.65rem' }}>Subject-wise Marks &amp; Grades</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
              Detailed course score breakdown and academic credits for {user?.name}
            </p>
          </div>
        </div>

        {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

        {/* Filter Controls */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
          <div className="form-row" style={{ alignItems: 'center' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by subject code (e.g. CS401) or course name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
              <select
                className="form-select"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <option value="all">All Semesters</option>
                {semesters.map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading course marks...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="card empty-state">
            <BookOpen className="empty-icon" />
            <h3>No subjects found</h3>
            <p>Try adjusting your search criteria or semester filter.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Marks Obtained</th>
                  <th>Max Marks</th>
                  <th>Grade</th>
                  <th>SGPA Ref</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((sub) => {
                  const badgeStyle = getGradeBadgeStyle(sub.grade);
                  const isPass = sub.marks >= 40;
                  return (
                    <tr key={sub.resultId}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                          Sem {sub.semester}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem' }}>
                          {sub.subjectCode}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{sub.subjectName}</td>
                      <td>
                        <strong style={{ fontSize: '1rem' }}>{sub.marks}</strong>
                      </td>
                      <td style={{ color: 'var(--color-text-light)' }}>100</td>
                      <td>
                        <span className="grade-badge" style={badgeStyle}>
                          {sub.grade}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>
                        {sub.SGPA ? sub.SGPA.toFixed(2) : '-'}
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          {isPass ? (
                            <span style={{ color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <CheckCircle2 size={16} /> PASS
                            </span>
                          ) : (
                            <span style={{ color: '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <XCircle size={16} /> FAIL
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default SubjectWiseMarks;
