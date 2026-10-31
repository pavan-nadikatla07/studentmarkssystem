import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resultAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import { getGradeBadgeStyle } from '../utils/gradingConfig';
import { Printer, Download, GraduationCap, CheckCircle2, ShieldCheck } from 'lucide-react';
import Alert from '../components/Alert';

const ResultSummary = () => {
  const { user, student } = useAuth();
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Default to semester in URL param, or fallback to student's semester or 4
  const semParam = searchParams.get('semester');
  const [selectedSemester, setSelectedSemester] = useState(semParam ? Number(semParam) : null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await resultAPI.getAll();
        if (res.success) {
          setResults(res.data);
          if (!selectedSemester && res.data.length > 0) {
            const maxSem = Math.max(...res.data.map((r) => r.semester));
            setSelectedSemester(maxSem);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const semestersAvailable = [...new Set(results.map((r) => r.semester))].sort((a, b) => b - a);
  const activeSem = selectedSemester || (semestersAvailable.length > 0 ? semestersAvailable[0] : 4);
  const currentSemesterResults = results.filter((r) => r.semester === Number(activeSem));

  // Calculations
  const totalSubjects = currentSemesterResults.length;
  const totalMarks = currentSemesterResults.reduce((acc, curr) => acc + curr.marks, 0);
  const maxMarks = totalSubjects * 100;
  const percentage = totalSubjects > 0 ? ((totalMarks / maxMarks) * 100).toFixed(2) : 0;
  const sgpa = currentSemesterResults.length > 0 ? currentSemesterResults[0].SGPA : 0.0;
  const hasFailed = currentSemesterResults.some((r) => r.marks < 40);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main>
        {/* Action Header (Hidden in Print) */}
        <div
          className="card-header no-print"
          style={{
            marginBottom: '1.5rem',
            background: 'white',
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Official Result Summary</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
              Academic transcript &amp; verified mark statement
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {semestersAvailable.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Semester:</span>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
                  value={activeSem}
                  onChange={(e) => setSelectedSemester(Number(e.target.value))}
                >
                  {semestersAvailable.map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            )}

            <button onClick={handlePrint} className="btn btn-primary">
              <Printer size={16} /> Download / Print Result Summary
            </button>
          </div>
        </div>

        {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Compiling official mark statement...</p>
          </div>
        ) : currentSemesterResults.length === 0 ? (
          <div className="card empty-state">
            <GraduationCap className="empty-icon" />
            <h3>No result summary available</h3>
            <p>No marks have been recorded for Semester {activeSem}.</p>
          </div>
        ) : (
          /* Official Mark Sheet Document Container */
          <div
            className="card print-area"
            style={{
              padding: '2.5rem',
              background: '#ffffff',
              border: '2px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {/* University Title Header */}
            <div
              style={{
                textAlign: 'center',
                borderBottom: '2px solid #0f172a',
                paddingBottom: '1.5rem',
                marginBottom: '1.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem',
                }}
              >
                <div
                  style={{
                    background: '#0f172a',
                    color: 'white',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    display: 'flex',
                  }}
                >
                  <GraduationCap size={28} />
                </div>
                <div>
                  <h1
                    style={{
                      fontSize: '1.6rem',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: '#0f172a',
                      marginBottom: '0.1rem',
                    }}
                  >
                    University Institute of Technology
                  </h1>
                  <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, letterSpacing: '0.08em' }}>
                    CONTROLLER OF EXAMINATIONS &bull; AUTONOMOUS ACADEMIC EVALUATION
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'inline-block',
                  background: '#f1f5f9',
                  padding: '0.35rem 1.25rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginTop: '0.5rem',
                  border: '1px solid #cbd5e1',
                }}
              >
                SEMESTER {activeSem} EXAMINATION RESULT SUMMARY &bull; SESSION 2024-2025
              </div>
            </div>

            {/* Student Information Grid */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1.25rem 1.5rem',
                marginBottom: '2rem',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  fontSize: '0.92rem',
                }}
              >
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Candidate Name
                  </span>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                    {user?.name}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Roll Number
                  </span>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', fontFamily: 'monospace' }}>
                    {student?.rollNumber || '2024CS001'}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Department
                  </span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {student?.department || 'Computer Science & Engineering'}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Semester &amp; Section
                  </span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    Semester {activeSem} &bull; Section {student?.section || 'A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="table-container" style={{ marginBottom: '2rem' }}>
              <table className="table" style={{ border: '1px solid #cbd5e1' }}>
                <thead style={{ background: '#f1f5f9' }}>
                  <tr>
                    <th style={{ width: '80px', textAlign: 'center' }}>S.No</th>
                    <th style={{ width: '130px' }}>Subject Code</th>
                    <th>Course Title</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Max Marks</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Marks Secured</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Grade</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Grade Point</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSemesterResults.map((item, idx) => {
                    const badgeStyle = getGradeBadgeStyle(item.grade);
                    const point =
                      item.grade === 'O' ? 10 :
                      item.grade === 'A+' ? 9 :
                      item.grade === 'A' ? 8 :
                      item.grade === 'B+' ? 7 :
                      item.grade === 'B' ? 6 :
                      item.grade === 'P' ? 5 : 0;

                    return (
                      <tr key={item.resultId}>
                        <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{item.subjectCode}</td>
                        <td style={{ fontWeight: 500 }}>{item.subjectName}</td>
                        <td style={{ textAlign: 'center', color: '#64748b' }}>100</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>
                          {item.marks}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="grade-badge" style={badgeStyle}>
                            {item.grade}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{point}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary & Evaluation Block */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                background: '#f8fafc',
                padding: '1.25rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '2.5rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Total Subjects
                </span>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>
                  {totalSubjects}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Total Marks
                </span>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>
                  {totalMarks} / {maxMarks}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Percentage
                </span>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>
                  {percentage}%
                </div>
              </div>

              <div style={{ background: '#eff6ff', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                <span style={{ fontSize: '0.78rem', color: '#1e40af', textTransform: 'uppercase', fontWeight: 700 }}>
                  Semester SGPA
                </span>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1d4ed8' }}>
                  {sgpa.toFixed(2)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Final Result Status
                </span>
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: hasFailed ? '#dc2626' : '#059669',
                    marginTop: '0.2rem',
                  }}
                >
                  {hasFailed ? 'FAIL / REAPPEAR' : 'PASSED (FIRST CLASS)'}
                </div>
              </div>
            </div>

            {/* Official Authentication Signatures */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: '1px dashed #cbd5e1',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.2rem' }}>
                  Date of Declaration: {new Date().toLocaleDateString('en-GB')}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#059669', fontSize: '0.8rem', fontWeight: 600 }}>
                  <ShieldCheck size={14} /> Digitally Authenticated Record
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '35px' }}></div>
                <div style={{ borderTop: '1px solid #0f172a', width: '220px', paddingTop: '0.4rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  Controller of Examinations
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>University Examination Branch</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResultSummary;
