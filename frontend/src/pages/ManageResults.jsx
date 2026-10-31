import React, { useState, useEffect } from 'react';
import { studentAPI, resultAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import { calculateGradeFrontend, getGradeBadgeStyle } from '../utils/gradingConfig';
import {
  BRANCHES,
  ROMAN_SEMESTERS,
  getCoursesForBranchAndSemester,
  getBranchFromDepartment,
} from '../data/curriculumData';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  BookPlus,
  Users,
  GraduationCap,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

const ManageResults = () => {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Tab state: 'results' or 'students'
  const [activeTab, setActiveTab] = useState('results');

  // Filter and Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);

  // Active items for edit/delete
  const [currentResult, setCurrentResult] = useState(null);
  const [editingStudentRecord, setEditingStudentRecord] = useState(null);

  // Form states for Result Entry (Module 1, 2, 3, 4, 5)
  const [resultFormData, setResultFormData] = useState({
    studentId: '',
    branch: 'CSE',
    semester: 1,
    selectedSubjectId: '',
    subjectCode: '',
    subjectName: '',
    marks: '',
  });

  // Form states for Add Student
  const [studentFormData, setStudentFormData] = useState({
    studentName: '',
    rollNumber: '',
    department: 'Computer Science & Engineering',
    semester: 1,
    section: 'A',
  });

  // Form states for Edit Student / Promote Semester
  const [editStudentFormData, setEditStudentFormData] = useState({
    studentName: '',
    rollNumber: '',
    department: 'Computer Science & Engineering',
    semester: 1,
    section: 'A',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resResults, resStudents] = await Promise.all([
        resultAPI.getAll(),
        studentAPI.getAll(),
      ]);

      if (resResults.success) setResults(resResults.data);
      if (resStudents.success) {
        setStudents(resStudents.data);
        if (resStudents.data.length > 0 && !resultFormData.studentId) {
          const first = resStudents.data[0];
          const firstBranch = getBranchFromDepartment(first.department);
          const firstSem = Number(first.semester) || 1;
          setResultFormData((prev) => ({
            ...prev,
            studentId: first.studentId,
            branch: firstBranch,
            semester: firstSem,
          }));
        }
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load records' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Currently selected student in Add Result Modal
  const selectedStudent =
    students.find((s) => s.studentId === resultFormData.studentId) ||
    (students.length > 0 ? students[0] : null);

  // Maximum semester marks can be entered for (student's enrolled semester)
  const maxAllowedSemester = selectedStudent ? Number(selectedStudent.semester) : 1;

  // Available subjects based strictly on selected Branch & Semester
  const availableCourses = getCoursesForBranchAndSemester(
    resultFormData.branch,
    resultFormData.semester
  );

  // Student being edited in Edit Result Modal
  const editingStudent =
    students.find((s) => s.studentId === currentResult?.studentId) ||
    currentResult?.student;

  const editMaxSemester = editingStudent
    ? Number(editingStudent.semester)
    : currentResult
    ? Number(currentResult.semester)
    : 8;

  // Available subjects for Edit Modal
  const editAvailableCourses = getCoursesForBranchAndSemester(
    resultFormData.branch,
    resultFormData.semester
  );

  // Handle student change in Add Result Modal
  const handleStudentSelect = (newStudentId) => {
    if (!newStudentId) {
      setResultFormData((prev) => ({ ...prev, studentId: '' }));
      return;
    }
    const chosen = students.find((s) => s.studentId === newStudentId);
    if (!chosen) return;

    const studentBranch = getBranchFromDepartment(chosen.department);
    const branchChanged = studentBranch !== resultFormData.branch;

    let subId = resultFormData.selectedSubjectId;
    let subCode = resultFormData.subjectCode;
    let subName = resultFormData.subjectName;

    // Reset subject selection if branch changed
    if (branchChanged) {
      const currentSem = Number(resultFormData.semester);
      if (currentSem === 7) {
        subId = 'PROJECT';
        subCode = 'PROJECT';
        subName = 'Project';
      } else if (currentSem === 8) {
        subId = 'INTERNSHIP';
        subCode = 'INTERNSHIP';
        subName = 'Internship';
      } else {
        subId = '';
        subCode = '';
        subName = '';
      }
    }

    setResultFormData((prev) => ({
      ...prev,
      studentId: newStudentId,
      branch: branchChanged ? studentBranch : prev.branch,
      selectedSubjectId: subId,
      subjectCode: subCode,
      subjectName: subName,
    }));
  };

  // Handle Branch change
  const handleBranchChange = (newBranch) => {
    const currentSem = Number(resultFormData.semester);
    let subId = '';
    let subCode = '';
    let subName = '';

    if (currentSem === 7) {
      // Semester VII special rule: Project only
      subId = 'PROJECT';
      subCode = 'PROJECT';
      subName = 'Project';
    } else if (currentSem === 8) {
      // Semester VIII special rule: Internship only
      subId = 'INTERNSHIP';
      subCode = 'INTERNSHIP';
      subName = 'Internship';
    }

    // Auto-select a candidate belonging to this new branch if current candidate is in another branch
    const branchStudents = students.filter(
      (s) => getBranchFromDepartment(s.department) === newBranch
    );
    const currentStudent = students.find((s) => s.studentId === resultFormData.studentId);
    let nextStudentId = '';
    if (currentStudent && getBranchFromDepartment(currentStudent.department) === newBranch) {
      nextStudentId = currentStudent.studentId;
    } else if (branchStudents.length > 0) {
      nextStudentId = branchStudents[0].studentId;
    }

    setResultFormData((prev) => ({
      ...prev,
      branch: newBranch,
      studentId: nextStudentId,
      selectedSubjectId: subId,
      subjectCode: subCode,
      subjectName: subName,
    }));
  };

  // Handle Semester change
  const handleSemesterChange = (newSemValue) => {
    const newSem = Number(newSemValue);
    let subId = '';
    let subCode = '';
    let subName = '';

    if (newSem === 7) {
      // Semester VII special rule: Project only
      subId = 'PROJECT';
      subCode = 'PROJECT';
      subName = 'Project';
    } else if (newSem === 8) {
      // Semester VIII special rule: Internship only
      subId = 'INTERNSHIP';
      subCode = 'INTERNSHIP';
      subName = 'Internship';
    }

    setResultFormData((prev) => ({
      ...prev,
      semester: newSem,
      selectedSubjectId: subId,
      subjectCode: subCode,
      subjectName: subName,
    }));
  };

  // Two-way linked Course Code & Course Name change handler
  const handleSubjectSelect = (chosenInternalId) => {
    if (!chosenInternalId) {
      setResultFormData((prev) => ({
        ...prev,
        selectedSubjectId: '',
        subjectCode: '',
        subjectName: '',
      }));
      return;
    }

    const coursesList = isEditModalOpen ? editAvailableCourses : availableCourses;
    const foundCourse = coursesList.find((c) => c.internalId === chosenInternalId);

    if (foundCourse) {
      setResultFormData((prev) => ({
        ...prev,
        selectedSubjectId: foundCourse.internalId,
        subjectCode: foundCourse.code || foundCourse.internalId,
        subjectName: foundCourse.name,
      }));
    }
  };

  // Open Add Result Modal with optional preselected student
  const openAddModal = (presetStudentId = null) => {
    let targetStudent = null;
    if (presetStudentId) {
      targetStudent = students.find((s) => s.studentId === presetStudentId);
    } else if (resultFormData.studentId) {
      targetStudent = students.find((s) => s.studentId === resultFormData.studentId);
    }
    if (!targetStudent && students.length > 0) {
      targetStudent = students[0];
    }

    const studentBranch = targetStudent
      ? getBranchFromDepartment(targetStudent.department)
      : (resultFormData.branch || 'CSE');
    const targetSem = targetStudent ? Number(targetStudent.semester) : (Number(resultFormData.semester) || 1);

    let subId = '';
    let subCode = '';
    let subName = '';
    if (targetSem === 7) {
      subId = 'PROJECT';
      subCode = 'PROJECT';
      subName = 'Project';
    } else if (targetSem === 8) {
      subId = 'INTERNSHIP';
      subCode = 'INTERNSHIP';
      subName = 'Internship';
    }

    setResultFormData({
      studentId: targetStudent ? targetStudent.studentId : '',
      branch: studentBranch,
      semester: targetSem,
      selectedSubjectId: subId,
      subjectCode: subCode,
      subjectName: subName,
      marks: '',
    });
    setIsAddModalOpen(true);
  };

  // Filtered results list with Branch, Semester, and Search filters
  const filteredResults = results.filter((item) => {
    const studentName = item.student?.studentName || '';
    const rollNumber = item.student?.rollNumber || item.studentId || '';
    const studentDept = item.student?.department || '';
    const studentBranch = getBranchFromDepartment(studentDept);

    const searchMatch =
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(searchTerm.toLowerCase());

    const semMatch =
      semesterFilter === 'all' || item.semester === Number(semesterFilter);

    const branchMatch =
      branchFilter === 'all' || studentBranch === branchFilter;

    return searchMatch && semMatch && branchMatch;
  });

  // Filtered students list for Students Tab
  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const branch = getBranchFromDepartment(s.department);
    const branchMatch = branchFilter === 'all' || branch === branchFilter;
    const termMatch =
      s.studentName.toLowerCase().includes(term) ||
      s.rollNumber.toLowerCase().includes(term) ||
      s.department.toLowerCase().includes(term);

    return branchMatch && termMatch;
  });

  // Handle Add Result Submit
  const handleAddResult = async (e) => {
    e.preventDefault();
    const marksNum = Number(resultFormData.marks);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
      setAlert({ type: 'error', message: 'Marks must be a valid number between 0 and 100' });
      return;
    }

    if (!resultFormData.studentId) {
      setAlert({ type: 'error', message: 'Please select a candidate student to record marks for.' });
      return;
    }

    const requestedSem = Number(resultFormData.semester);
    let finalCode = resultFormData.subjectCode;
    let finalName = resultFormData.subjectName;

    if (requestedSem === 7) {
      finalCode = 'PROJECT';
      finalName = 'Project';
    } else if (requestedSem === 8) {
      finalCode = 'INTERNSHIP';
      finalName = 'Internship';
    }

    if (!finalCode || !finalName) {
      setAlert({
        type: 'error',
        message: 'Please select a valid Course Code / Course Name from the curriculum dropdown.',
      });
      return;
    }

    try {
      const res = await resultAPI.create({
        studentId: resultFormData.studentId,
        semester: requestedSem,
        subjectCode: finalCode.trim().toUpperCase(),
        subjectName: finalName.trim(),
        marks: marksNum,
      });

      if (res.success) {
        setAlert({
          type: 'success',
          message: `Examination result recorded successfully for ${finalName} (${finalCode})!`,
        });
        setIsAddModalOpen(false);
        const activeStudent =
          students.find((s) => s.studentId === resultFormData.studentId) || students[0];
        const activeBranch = activeStudent
          ? getBranchFromDepartment(activeStudent.department)
          : (resultFormData.branch || 'CSE');
        const activeSem = activeStudent ? Number(activeStudent.semester) : 1;

        setResultFormData({
          studentId: activeStudent ? activeStudent.studentId : '',
          branch: activeBranch,
          semester: activeSem,
          selectedSubjectId: '',
          subjectCode: '',
          subjectName: '',
          marks: '',
        });
        fetchData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to add result' });
    }
  };

  // Open Edit Result Modal
  const openEditModal = (resItem) => {
    setCurrentResult(resItem);
    const targetStudent =
      students.find((s) => s.studentId === resItem.studentId) || resItem.student;
    const studentBranch = targetStudent
      ? getBranchFromDepartment(targetStudent.department)
      : 'CSE';
    const sem = Number(resItem.semester);

    let subId = '';
    if (sem === 7) {
      subId = 'PROJECT';
    } else if (sem === 8) {
      subId = 'INTERNSHIP';
    } else {
      const semCourses = getCoursesForBranchAndSemester(studentBranch, sem);
      const match = semCourses.find(
        (c) =>
          (c.code && c.code.toUpperCase() === resItem.subjectCode?.toUpperCase()) ||
          c.internalId === resItem.subjectCode ||
          c.name.toLowerCase() === resItem.subjectName?.toLowerCase()
      );
      subId = match ? match.internalId : '';
    }

    setResultFormData({
      studentId: resItem.studentId,
      branch: studentBranch,
      semester: sem,
      selectedSubjectId: subId,
      subjectCode: resItem.subjectCode,
      subjectName: resItem.subjectName,
      marks: resItem.marks,
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Result Submit
  const handleEditResult = async (e) => {
    e.preventDefault();
    const marksNum = Number(resultFormData.marks);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
      setAlert({ type: 'error', message: 'Marks must be a valid number between 0 and 100' });
      return;
    }

    const requestedSem = Number(resultFormData.semester);
    let finalCode = resultFormData.subjectCode;
    let finalName = resultFormData.subjectName;

    if (requestedSem === 7) {
      finalCode = 'PROJECT';
      finalName = 'Project';
    } else if (requestedSem === 8) {
      finalCode = 'INTERNSHIP';
      finalName = 'Internship';
    }

    if (!finalCode || !finalName) {
      setAlert({
        type: 'error',
        message: 'Please select a valid Course Code / Course Name from the curriculum dropdown.',
      });
      return;
    }

    try {
      const res = await resultAPI.update(currentResult.resultId || currentResult._id, {
        marks: marksNum,
        subjectName: finalName.trim(),
        subjectCode: finalCode.trim().toUpperCase(),
        semester: requestedSem,
      });

      if (res.success) {
        setAlert({ type: 'success', message: 'Result updated successfully!' });
        setIsEditModalOpen(false);
        setCurrentResult(null);
        fetchData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update result' });
    }
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (resItem) => {
    setCurrentResult(resItem);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Result
  const handleDeleteResult = async () => {
    if (!currentResult) return;
    try {
      const res = await resultAPI.delete(currentResult.resultId || currentResult._id);
      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Result removed successfully!' });
        setIsDeleteModalOpen(false);
        setCurrentResult(null);
        fetchData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to delete result' });
    }
  };

  // Handle Create Student Submit
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await studentAPI.create({
        studentName: studentFormData.studentName.trim(),
        rollNumber: studentFormData.rollNumber.trim().toUpperCase(),
        department: studentFormData.department,
        semester: Number(studentFormData.semester),
        section: studentFormData.section.trim().toUpperCase(),
      });

      if (res.success) {
        setAlert({
          type: 'success',
          message: `Student ${res.data.studentName} enrolled in Semester ${res.data.semester}! Marks can now be entered for Semester 1 to ${res.data.semester}.`,
        });
        setIsStudentModalOpen(false);
        setStudentFormData({
          studentName: '',
          rollNumber: '',
          department: 'Computer Science & Engineering',
          semester: 1,
          section: 'A',
        });
        fetchData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to create student' });
    }
  };

  // Open Edit Student Modal
  const openEditStudentModal = (studentItem) => {
    setEditingStudentRecord(studentItem);
    setEditStudentFormData({
      studentName: studentItem.studentName,
      rollNumber: studentItem.rollNumber,
      department: studentItem.department,
      semester: Number(studentItem.semester),
      section: studentItem.section,
    });
    setIsEditStudentModalOpen(true);
  };

  // Handle Update / Promote Student Submit
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await studentAPI.update(
        editingStudentRecord.studentId || editingStudentRecord._id,
        {
          studentName: editStudentFormData.studentName.trim(),
          rollNumber: editStudentFormData.rollNumber.trim().toUpperCase(),
          department: editStudentFormData.department,
          semester: Number(editStudentFormData.semester),
          section: editStudentFormData.section.trim().toUpperCase(),
        }
      );

      if (res.success) {
        setAlert({
          type: 'success',
          message: `Student ${res.data.studentName} updated to Semester ${res.data.semester}! You can now enter marks up to Semester ${res.data.semester}.`,
        });
        setIsEditStudentModalOpen(false);
        setEditingStudentRecord(null);
        fetchData();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update student' });
    }
  };

  // Dynamic preview of grade while entering marks
  const liveGrade = calculateGradeFrontend(resultFormData.marks);
  const liveGradeStyle = getGradeBadgeStyle(liveGrade);

  // Check if current semester in form is special (VII or VIII)
  const isSpecialSem7 = Number(resultFormData.semester) === 7;
  const isSpecialSem8 = Number(resultFormData.semester) === 8;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main>
        {/* Header and Actions */}
        <div className="card-header" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.65rem' }}>Manage Student Results &amp; Marks</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
              Academic marks-entry interface with branch-semester curriculum mapping and two-way course synchronization
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => setIsStudentModalOpen(true)} className="btn btn-secondary">
              <UserPlus size={16} /> Add Student
            </button>
            <button onClick={() => openAddModal()} className="btn btn-primary">
              <Plus size={16} /> Enter Result / Marks
            </button>
          </div>
        </div>

        {alert.message && (
          <Alert
            type={alert.type}
            message={alert.message}
            onDismiss={() => setAlert({ type: '', message: '' })}
          />
        )}

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '0.75rem',
          }}
        >
          <button
            onClick={() => setActiveTab('results')}
            className={`btn ${activeTab === 'results' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <BookPlus size={15} />
            <span>Examination Results ({results.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Users size={15} />
            <span>Enrolled Students &amp; Current Semesters ({students.length})</span>
          </button>
        </div>

        {/* Tab 1: Results View */}
        {activeTab === 'results' && (
          <>
            {/* Search & Filter Bar (Branch + Semester + Search) */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
              <div className="form-row" style={{ alignItems: 'center' }}>
                <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search candidate, roll number, course code (e.g. V23CST04), or title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                  <select
                    className="form-select"
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                  >
                    <option value="all">All Branches</option>
                    {BRANCHES.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.code} ({b.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                  <select
                    className="form-select"
                    value={semesterFilter}
                    onChange={(e) => setSemesterFilter(e.target.value)}
                  >
                    <option value="all">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {ROMAN_SEMESTERS[s]} ({s})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  Recorded Results ({filteredResults.length} Entries)
                </h3>
              </div>

              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Fetching records from MongoDB...</p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="empty-state">
                  <BookPlus className="empty-icon" />
                  <h3>No results match your criteria</h3>
                  <p>Click "Enter Result / Marks" to upload new student marks.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Roll No</th>
                        <th>Branch</th>
                        <th>Sem</th>
                        <th>Course Code &amp; Title</th>
                        <th>Marks</th>
                        <th>Grade</th>
                        <th>SGPA</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((item) => {
                        const badgeStyle = getGradeBadgeStyle(item.grade);
                        const bCode = getBranchFromDepartment(item.student?.department || '');
                        return (
                          <tr key={item.resultId || item._id}>
                            <td>
                              <strong>{item.student?.studentName || 'Student'}</strong>
                            </td>
                            <td>
                              <code>{item.student?.rollNumber || item.studentId}</code>
                            </td>
                            <td>
                              <span
                                style={{
                                  background: '#e0e7ff',
                                  color: '#3730a3',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                }}
                              >
                                {bCode}
                              </span>
                            </td>
                            <td>
                              <span
                                style={{
                                  background: 'var(--color-bg)',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontWeight: 600,
                                  fontSize: '0.82rem',
                                }}
                              >
                                Sem {ROMAN_SEMESTERS[item.semester] || item.semester}
                              </span>
                            </td>
                            <td>
                              <strong>{item.subjectCode}</strong>: {item.subjectName}
                            </td>
                            <td>
                              <strong>{item.marks}</strong> / 100
                            </td>
                            <td>
                              <span className="grade-badge" style={badgeStyle}>
                                {item.grade}
                              </span>
                            </td>
                            <td>{item.SGPA ? item.SGPA.toFixed(2) : '-'}</td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="btn btn-secondary btn-sm"
                                  title="Update Marks"
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => openDeleteModal(item)}
                                  className="btn btn-danger btn-sm"
                                  title="Delete Result"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab 2: Enrolled Students & Current Semesters View */}
        {activeTab === 'students' && (
          <>
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
              <div className="form-row" style={{ alignItems: 'center' }}>
                <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search enrolled students by name, roll number, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                  <select
                    className="form-select"
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                  >
                    <option value="all">All Branches</option>
                    {BRANCHES.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.code} ({b.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Enrolled Candidates ({filteredStudents.length} Students)</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                    Select candidate to enter examination marks or promote current enrolled semester.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Fetching students from MongoDB...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="empty-state">
                  <Users className="empty-icon" />
                  <h3>No students found</h3>
                  <p>Click "Add Student" above to enroll a new candidate.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Candidate Name</th>
                        <th>Roll Number</th>
                        <th>Branch &amp; Department</th>
                        <th>Sec</th>
                        <th>Current Enrolled Semester</th>
                        <th>Evaluation Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s) => {
                        const bCode = getBranchFromDepartment(s.department);
                        return (
                          <tr key={s.studentId}>
                            <td>
                              <strong>{s.studentName}</strong>
                            </td>
                            <td>
                              <code>{s.rollNumber}</code>
                            </td>
                            <td>
                              <span
                                style={{
                                  background: '#e0e7ff',
                                  color: '#3730a3',
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  marginRight: '0.4rem',
                                }}
                              >
                                {bCode}
                              </span>
                              {s.department}
                            </td>
                            <td>{s.section}</td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: 'var(--radius-full)',
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  fontWeight: 700,
                                  fontSize: '0.82rem',
                                  border: '1px solid #bfdbfe',
                                }}
                              >
                                <GraduationCap size={14} /> Semester {ROMAN_SEMESTERS[s.semester] || s.semester} ({s.semester})
                              </span>
                            </td>
                            <td>
                              <span
                                style={{
                                  fontSize: '0.82rem',
                                  color: '#15803d',
                                  background: '#f0fdf4',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontWeight: 600,
                                  border: '1px solid #bbf7d0',
                                }}
                              >
                                Semesters I–VIII Available
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => openEditStudentModal(s)}
                                  className="btn btn-secondary btn-sm"
                                  title="Promote or update student's current semester"
                                >
                                  <Edit2 size={13} /> Update / Promote Sem
                                </button>
                                <button
                                  onClick={() => openAddModal(s.studentId)}
                                  className="btn btn-primary btn-sm"
                                  title="Enter marks for this student"
                                >
                                  <Plus size={13} /> Enter Marks
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal: Add Result (Module 1, 2, 3, 4, 5, 6, 7, 8) */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Student Examination Result"
        >
          <form onSubmit={handleAddResult}>
            {/* 1. Branch & Semester Selection (Section 1) */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="result-branch-select">
                  1. Branch *
                </label>
                <select
                  id="result-branch-select"
                  className="form-select"
                  value={resultFormData.branch}
                  onChange={(e) => handleBranchChange(e.target.value)}
                >
                  {BRANCHES.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} — {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label
                  className="form-label"
                  htmlFor="result-semester-select"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>2. Semester *</span>
                  {selectedStudent && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--color-primary)',
                        fontWeight: 700,
                      }}
                    >
                      Enrolled: Sem {ROMAN_SEMESTERS[selectedStudent.semester] || selectedStudent.semester}
                    </span>
                  )}
                </label>
                <select
                  id="result-semester-select"
                  className="form-select"
                  value={resultFormData.semester}
                  onChange={(e) => handleSemesterChange(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {ROMAN_SEMESTERS[s]} ({s}) {selectedStudent && Number(selectedStudent.semester) === s ? '★ (Enrolled)' : ''}
                      {s === 7 ? ' — Project Only' : ''}
                      {s === 8 ? ' — Internship Only' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Candidate / Student Selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="result-student-select">
                Candidate / Student * ({resultFormData.branch})
              </label>
              <select
                id="result-student-select"
                className="form-select"
                required
                value={resultFormData.studentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
              >
                <option value="">-- Select Candidate in {resultFormData.branch} --</option>
                {/* Candidates in the selected branch */}
                {students
                  .filter((s) => getBranchFromDepartment(s.department) === resultFormData.branch)
                  .map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.studentName} ({s.rollNumber}) &bull; Enrolled: Sem {ROMAN_SEMESTERS[s.semester] || s.semester} &bull; Sec {s.section}
                    </option>
                  ))}
                {/* Other branches grouped */}
                {students.filter((s) => getBranchFromDepartment(s.department) !== resultFormData.branch).length > 0 && (
                  <optgroup label="Candidates from Other Branches">
                    {students
                      .filter((s) => getBranchFromDepartment(s.department) !== resultFormData.branch)
                      .map((s) => {
                        const bCode = getBranchFromDepartment(s.department);
                        return (
                          <option key={s.studentId} value={s.studentId}>
                            {s.studentName} ({s.rollNumber}) &bull; [{bCode}] &bull; Sem {ROMAN_SEMESTERS[s.semester] || s.semester}
                          </option>
                        );
                      })}
                  </optgroup>
                )}
              </select>
              {selectedStudent && (
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                  Candidate Roll: <strong>{selectedStudent.rollNumber}</strong> &bull; Dept: <strong>{selectedStudent.department}</strong> &bull; Current Semester: <strong>Sem {ROMAN_SEMESTERS[selectedStudent.semester] || selectedStudent.semester}</strong>
                </div>
              )}
            </div>

            {/* Special Rule: Semester VII (Section 3) */}
            {isSpecialSem7 && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '1px solid #86efac',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#15803d', fontWeight: 700 }}>
                  <Sparkles size={18} />
                  <span>Semester VII Special Rule: Final Year Project</span>
                </div>
                <div
                  style={{
                    marginTop: '0.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'white',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 600 }}>
                    Official Subject Name:
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#14532d' }}>
                    Project
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '0.5rem', marginBottom: 0 }}>
                  Course Code and Course Name dropdowns are hidden for Semester VII. Marks are evaluated directly out of 100 for Project.
                </p>
              </div>
            )}

            {/* Special Rule: Semester VIII (Section 4) */}
            {isSpecialSem8 && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '1px solid #93c5fd',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1d4ed8', fontWeight: 700 }}>
                  <Sparkles size={18} />
                  <span>Semester VIII Special Rule: Full-Semester Internship</span>
                </div>
                <div
                  style={{
                    marginTop: '0.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'white',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: 600 }}>
                    Official Subject Name:
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>
                    Internship
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#1d4ed8', marginTop: '0.5rem', marginBottom: 0 }}>
                  Course Code and Course Name dropdowns are hidden for Semester VIII. Marks are evaluated directly out of 100 for Internship.
                </p>
              </div>
            )}

            {/* Semesters I to VI: Two-Way Linked Course Code and Course Name (Section 2, 6, 7, 8) */}
            {!isSpecialSem7 && !isSpecialSem8 && (
              <>
                {availableCourses.length === 0 ? (
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      marginBottom: '1.25rem',
                      color: '#b45309',
                      fontSize: '0.88rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      <Info size={16} /> No subjects registered for {resultFormData.branch} Semester {ROMAN_SEMESTERS[resultFormData.semester] || resultFormData.semester}
                    </div>
                    <p style={{ marginTop: '0.35rem', fontSize: '0.82rem', color: '#92400e', marginBottom: 0 }}>
                      (Curriculum details for this branch/semester were not present in the supplied dataset).
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="form-row">
                      {/* Course Code Dropdown */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="result-course-code">
                          3. Course Code *
                        </label>
                        <select
                          id="result-course-code"
                          className="form-select"
                          required
                          value={resultFormData.selectedSubjectId}
                          onChange={(e) => handleSubjectSelect(e.target.value)}
                        >
                          <option value="">-- Select Course Code --</option>
                          {availableCourses.map((c) => (
                            <option key={c.internalId} value={c.internalId}>
                              {c.code ? c.code : `${c.name} (No official code)`}
                            </option>
                          ))}
                        </select>
                        <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                          Selecting code auto-updates Course Name
                        </span>
                      </div>

                      {/* Course Name Dropdown */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="result-course-name">
                          4. Course Name *
                        </label>
                        <select
                          id="result-course-name"
                          className="form-select"
                          required
                          value={resultFormData.selectedSubjectId}
                          onChange={(e) => handleSubjectSelect(e.target.value)}
                        >
                          <option value="">-- Select Course Name --</option>
                          {availableCourses.map((c) => (
                            <option key={c.internalId} value={c.internalId}>
                              {c.name} {c.code ? `(${c.code})` : ''}
                            </option>
                          ))}
                        </select>
                        <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                          Selecting title auto-updates Course Code
                        </span>
                      </div>
                    </div>

                    {resultFormData.selectedSubjectId && (
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.6rem 0.85rem',
                          marginBottom: '1rem',
                          fontSize: '0.84rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#334155',
                        }}
                      >
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Linked Subject:</span>
                        <span>
                          <strong>{resultFormData.subjectCode}</strong> &bull; {resultFormData.subjectName}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Marks Entry (Section 5) */}
            <div className="form-row" style={{ alignItems: 'flex-end', marginTop: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">Marks (0 - 100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  required
                  placeholder="e.g. 85"
                  value={resultFormData.marks}
                  onChange={(e) =>
                    setResultFormData({ ...resultFormData, marks: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Calculated Grade</label>
                <div style={{ height: '42px', display: 'flex', alignItems: 'center' }}>
                  <span className="grade-badge" style={liveGradeStyle}>
                    {liveGrade}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Result &amp; Update SGPA
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Edit Result (Module 3 : Result Management) */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Update Examination Marks"
        >
          <form onSubmit={handleEditResult}>
            <div className="form-group">
              <label className="form-label">Candidate</label>
              <input
                type="text"
                className="form-input"
                disabled
                value={`${currentResult?.student?.studentName || ''} (${
                  currentResult?.student?.rollNumber || currentResult?.studentId || ''
                })`}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-branch-select">
                  1. Branch *
                </label>
                <select
                  id="edit-branch-select"
                  className="form-select"
                  value={resultFormData.branch}
                  onChange={(e) => handleBranchChange(e.target.value)}
                >
                  {BRANCHES.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} — {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label
                  className="form-label"
                  htmlFor="edit-semester-select"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>2. Semester *</span>
                  {editingStudent && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--color-primary)',
                        fontWeight: 700,
                      }}
                    >
                      Enrolled: Sem {ROMAN_SEMESTERS[editingStudent.semester] || editingStudent.semester}
                    </span>
                  )}
                </label>
                <select
                  id="edit-semester-select"
                  className="form-select"
                  value={resultFormData.semester}
                  onChange={(e) => handleSemesterChange(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {ROMAN_SEMESTERS[s]} ({s}) {editingStudent && Number(editingStudent.semester) === s ? '★ (Enrolled)' : ''}
                      {s === 7 ? ' — Project Only' : ''}
                      {s === 8 ? ' — Internship Only' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Special Rules in Edit Modal */}
            {isSpecialSem7 && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '1px solid #86efac',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#15803d', fontWeight: 700 }}>
                  <Sparkles size={18} />
                  <span>Semester VII Special Rule: Final Year Project</span>
                </div>
                <div
                  style={{
                    marginTop: '0.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'white',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 600 }}>
                    Official Subject Name:
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#14532d' }}>
                    Project
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '0.5rem', marginBottom: 0 }}>
                  Course Code and Course Name dropdowns are hidden for Semester VII. Marks are evaluated directly out of 100 for Project.
                </p>
              </div>
            )}

            {isSpecialSem8 && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '1px solid #93c5fd',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1d4ed8', fontWeight: 700 }}>
                  <Sparkles size={18} />
                  <span>Semester VIII Special Rule: Full-Semester Internship</span>
                </div>
                <div
                  style={{
                    marginTop: '0.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'white',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: 600 }}>
                    Official Subject Name:
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>
                    Internship
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#1d4ed8', marginTop: '0.5rem', marginBottom: 0 }}>
                  Course Code and Course Name dropdowns are hidden for Semester VIII. Marks are evaluated directly out of 100 for Internship.
                </p>
              </div>
            )}

            {!isSpecialSem7 && !isSpecialSem8 && (
              <>
                {editAvailableCourses.length === 0 ? (
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      marginBottom: '1.25rem',
                      color: '#b45309',
                      fontSize: '0.88rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      <Info size={16} /> No subjects registered for {resultFormData.branch} Semester {ROMAN_SEMESTERS[resultFormData.semester] || resultFormData.semester}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-course-code">
                          3. Course Code *
                        </label>
                        <select
                          id="edit-course-code"
                          className="form-select"
                          required
                          value={resultFormData.selectedSubjectId}
                          onChange={(e) => handleSubjectSelect(e.target.value)}
                        >
                          <option value="">-- Select Course Code --</option>
                          {editAvailableCourses.map((c) => (
                            <option key={c.internalId} value={c.internalId}>
                              {c.code ? c.code : `${c.name} (No official code)`}
                            </option>
                          ))}
                        </select>
                        <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                          Selecting code auto-updates Course Name
                        </span>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="edit-course-name">
                          4. Course Name *
                        </label>
                        <select
                          id="edit-course-name"
                          className="form-select"
                          required
                          value={resultFormData.selectedSubjectId}
                          onChange={(e) => handleSubjectSelect(e.target.value)}
                        >
                          <option value="">-- Select Course Name --</option>
                          {editAvailableCourses.map((c) => (
                            <option key={c.internalId} value={c.internalId}>
                              {c.name} {c.code ? `(${c.code})` : ''}
                            </option>
                          ))}
                        </select>
                        <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                          Selecting title auto-updates Course Code
                        </span>
                      </div>
                    </div>

                    {resultFormData.selectedSubjectId && (
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.6rem 0.85rem',
                          marginBottom: '1rem',
                          fontSize: '0.84rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#334155',
                        }}
                      >
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Linked Subject:</span>
                        <span>
                          <strong>{resultFormData.subjectCode}</strong> &bull; {resultFormData.subjectName}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            <div className="form-row" style={{ alignItems: 'flex-end' }}>
              <div className="form-group">
                <label className="form-label">Marks (0 - 100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  required
                  value={resultFormData.marks}
                  onChange={(e) =>
                    setResultFormData({ ...resultFormData, marks: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Calculated Grade</label>
                <div style={{ height: '42px', display: 'flex', alignItems: 'center' }}>
                  <span className="grade-badge" style={liveGradeStyle}>
                    {liveGrade}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update Marks &amp; Recalculate SGPA
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Delete Confirmation */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Result Deletion"
        >
          <div>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>
                  Are you sure you want to delete this result?
                </h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                  This will permanently delete the examination mark entry for{' '}
                  <strong>{currentResult?.subjectCode}</strong> ({currentResult?.subjectName}) of{' '}
                  <strong>
                    {currentResult?.student?.studentName || currentResult?.studentId}
                  </strong>{' '}
                  and automatically recalculate the student's semester SGPA.
                </p>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleDeleteResult} className="btn btn-danger">
                Yes, Delete Result
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal: Add Student */}
        <Modal
          isOpen={isStudentModalOpen}
          onClose={() => setIsStudentModalOpen(false)}
          title="Add New Student Record"
        >
          <form onSubmit={handleCreateStudent}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Vikas Gupta"
                value={studentFormData.studentName}
                onChange={(e) =>
                  setStudentFormData({ ...studentFormData, studentName: e.target.value })
                }
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Roll Number *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. 2024CS019"
                  value={studentFormData.rollNumber}
                  onChange={(e) =>
                    setStudentFormData({ ...studentFormData, rollNumber: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Section *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. A"
                  maxLength="2"
                  value={studentFormData.section}
                  onChange={(e) =>
                    setStudentFormData({ ...studentFormData, section: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  className="form-select"
                  value={studentFormData.department}
                  onChange={(e) =>
                    setStudentFormData({ ...studentFormData, department: e.target.value })
                  }
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                  <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                  <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering (MECH)</option>
                  <option value="Civil Engineering">Civil Engineering (CIVIL)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Enrolled Semester *</label>
                <select
                  className="form-select"
                  value={studentFormData.semester}
                  onChange={(e) =>
                    setStudentFormData({ ...studentFormData, semester: Number(e.target.value) })
                  }
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {ROMAN_SEMESTERS[s]} ({s})
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '0.25rem',
                    display: 'block',
                  }}
                >
                  When entering marks, only this semester and earlier semesters will be selectable. Future semesters will be locked.
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Student Record
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Edit Student / Promote Semester */}
        <Modal
          isOpen={isEditStudentModalOpen}
          onClose={() => setIsEditStudentModalOpen(false)}
          title="Update Student Profile & Enrolled Semester"
        >
          <form onSubmit={handleUpdateStudent}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                required
                value={editStudentFormData.studentName}
                onChange={(e) =>
                  setEditStudentFormData({ ...editStudentFormData, studentName: e.target.value })
                }
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Roll Number *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={editStudentFormData.rollNumber}
                  onChange={(e) =>
                    setEditStudentFormData({ ...editStudentFormData, rollNumber: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Section *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  maxLength="2"
                  value={editStudentFormData.section}
                  onChange={(e) =>
                    setEditStudentFormData({ ...editStudentFormData, section: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  className="form-select"
                  value={editStudentFormData.department}
                  onChange={(e) =>
                    setEditStudentFormData({ ...editStudentFormData, department: e.target.value })
                  }
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                  <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                  <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering (MECH)</option>
                  <option value="Civil Engineering">Civil Engineering (CIVIL)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Enrolled Semester *</label>
                <select
                  className="form-select"
                  value={editStudentFormData.semester}
                  onChange={(e) =>
                    setEditStudentFormData({
                      ...editStudentFormData,
                      semester: Number(e.target.value),
                    })
                  }
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {ROMAN_SEMESTERS[s]} ({s})
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--color-primary)',
                    marginTop: '0.25rem',
                    display: 'block',
                    fontWeight: 500,
                  }}
                >
                  Promoting to a new semester (e.g. from Sem 2 to 3) unlocks that semester for marks entry.
                </span>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setIsEditStudentModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save &amp; Update Semester
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default ManageResults;
