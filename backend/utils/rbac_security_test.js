// rbac_security_test.js - Comprehensive Role-Based Security Verification
const http = require('http');

const request = (url, options = {}, body = null) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
};

const runSecurityTests = async () => {
  console.log('================================================================');
  console.log(' STRICT ROLE-BASED ACCESS CONTROL (RBAC) SECURITY TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  const assert = (condition, category, testName, detail = '') => {
    if (condition) {
      console.log(`[PASS] [${category}] ${testName}`);
      passed++;
      results.push({ category, test: testName, status: 'PASS' });
    } else {
      console.error(`[FAIL] [${category}] ${testName} - ${detail}`);
      failed++;
      results.push({ category, test: testName, status: 'FAIL', detail });
    }
  };

  try {
    // -------------------------------------------------------------
    // 0. AUTHENTICATION SETUP
    // -------------------------------------------------------------
    // Student 1: Rahul Sharma (2024CS001, studentId: STU-2024-001)
    const student1Login = await request('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: '2024cs001@sves.org.in',
      password: 'student123',
    });
    const student1Token = student1Login.data?.token;
    assert(student1Login.status === 200 && student1Token, 'AUTH', 'Student 1 (Rahul) Login & Token Retrieval');

    // Admin: Dr. Ramesh Kumar (admin@sves.org.in)
    const adminLogin = await request('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: 'admin@sves.org.in',
      password: 'adminpassword123',
    });
    const adminToken = adminLogin.data?.token;
    assert(adminLogin.status === 200 && adminToken, 'AUTH', 'Admin Login & Token Retrieval');

    // Admin fetches all results to find a result belonging to Student 2 (Priya)
    const adminResultsRes = await request('http://localhost:5000/api/results', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const allResults = adminResultsRes.data?.data || [];
    const student2Result = allResults.find((r) => r.studentId !== 'STU-2024-001') || allResults[1] || allResults[0];
    const student1Result = allResults.find((r) => r.studentId === 'STU-2024-001') || allResults[0];

    // -------------------------------------------------------------
    // 1. STUDENT PERMISSION ENFORCEMENT
    // -------------------------------------------------------------
    console.log('\n--- VERIFYING STUDENT RESTRICTIONS ---');

    // 1.1 Student viewing own profile via GET /api/auth/me
    const studentProfileRes = await request('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(
      studentProfileRes.status === 200 && studentProfileRes.data.user.role === 'student',
      'STUDENT',
      'Student can view their own profile via GET /api/auth/me (HTTP 200)'
    );

    // 1.2 Student viewing own student record via GET /api/students/:id
    const ownStudentId = studentProfileRes.data.student?.studentId || 'STU-2024-001';
    const studentOwnRec = await request(`http://localhost:5000/api/students/${ownStudentId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(
      studentOwnRec.status === 200 && studentOwnRec.data.data.studentId === ownStudentId,
      'STUDENT',
      'Student can view their own student record by ID (HTTP 200)'
    );

    // 1.3 Student viewing own results via GET /api/results
    const studentResultsRes = await request('http://localhost:5000/api/results', {
      method: 'GET',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const studentReturnedIds = (studentResultsRes.data?.data || []).map((r) => r.studentId);
    const onlyOwnResults = studentReturnedIds.every((id) => id === ownStudentId);
    assert(
      studentResultsRes.status === 200 && onlyOwnResults,
      'STUDENT',
      'Student can ONLY view their own results in GET /api/results (HTTP 200)'
    );

    // 1.4 Student attempting to query another student's results
    const studentQueryOther = await request('http://localhost:5000/api/results?studentId=STU-2024-002', {
      method: 'GET',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(
      studentQueryOther.status === 403,
      'STUDENT',
      'Student querying another student\'s results is blocked (HTTP 403 Forbidden)'
    );

    // 1.5 Student attempting to view another student's specific result via GET /api/results/:id
    if (student2Result) {
      const studentViewOtherResult = await request(`http://localhost:5000/api/results/${student2Result.resultId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(
        studentViewOtherResult.status === 403,
        'STUDENT',
        `Student viewing other student's result (${student2Result.resultId}) is blocked (HTTP 403 Forbidden)`
      );
    }

    // 1.6 Student viewing own specific result via GET /api/results/:id
    if (student1Result) {
      const studentViewOwnResult = await request(`http://localhost:5000/api/results/${student1Result.resultId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(
        studentViewOwnResult.status === 200,
        'STUDENT',
        `Student viewing own specific result (${student1Result.resultId}) is permitted (HTTP 200)`
      );
    }

    // 1.7 Student attempting to add/upload marks via POST /api/results
    const studentAddResult = await request('http://localhost:5000/api/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Token}`,
      },
    }, {
      studentId: ownStudentId,
      subjectCode: 'HACK101',
      subjectName: 'Unauthorized Exam Upload',
      marks: 99,
      semester: 4,
    });
    assert(
      studentAddResult.status === 403,
      'STUDENT',
      'Student attempting to add/upload marks is blocked (HTTP 403 Forbidden)'
    );

    // 1.8 Student attempting to edit/update marks via PUT /api/results/:id
    if (student1Result) {
      const studentUpdateResult = await request(`http://localhost:5000/api/results/${student1Result.resultId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${student1Token}`,
        },
      }, {
        marks: 100,
      });
      assert(
        studentUpdateResult.status === 403,
        'STUDENT',
        'Student attempting to edit/update marks is blocked (HTTP 403 Forbidden)'
      );
    }

    // 1.9 Student attempting to delete marks via DELETE /api/results/:id
    if (student1Result) {
      const studentDeleteResult = await request(`http://localhost:5000/api/results/${student1Result.resultId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert(
        studentDeleteResult.status === 403,
        'STUDENT',
        'Student attempting to delete marks is blocked (HTTP 403 Forbidden)'
      );
    }

    // 1.10 Student attempting to access all students list via GET /api/students
    const studentListAll = await request('http://localhost:5000/api/students', {
      method: 'GET',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(
      studentListAll.status === 403,
      'STUDENT',
      'Student attempting to list all students via GET /api/students is blocked (HTTP 403 Forbidden)'
    );

    // 1.11 Student attempting to view another student's profile via GET /api/students/:id
    const studentViewOtherProfile = await request('http://localhost:5000/api/students/STU-2024-002', {
      method: 'GET',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(
      studentViewOtherProfile.status === 403,
      'STUDENT',
      'Student attempting to view another student\'s profile is blocked (HTTP 403 Forbidden)'
    );

    // 1.12 Student attempting to create student record via POST /api/students
    const studentCreateStudent = await request('http://localhost:5000/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Token}`,
      },
    }, {
      rollNumber: '2024CS999',
      studentName: 'Hacker Student',
      department: 'Computer Science & Engineering',
      semester: 4,
      section: 'A',
    });
    assert(
      studentCreateStudent.status === 403,
      'STUDENT',
      'Student attempting to create a student record is blocked (HTTP 403 Forbidden)'
    );

    // 1.13 Student attempting to update student record via PUT /api/students/:id
    const studentUpdateStudent = await request(`http://localhost:5000/api/students/${ownStudentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1Token}`,
      },
    }, {
      studentName: 'Modified Name',
    });
    assert(
      studentUpdateStudent.status === 403,
      'STUDENT',
      'Student attempting to update a student record is blocked (HTTP 403 Forbidden)'
    );

    // 1.14 Student attempting to delete student record via DELETE /api/students/:id
    const studentDeleteStudent = await request(`http://localhost:5000/api/students/${ownStudentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(
      studentDeleteStudent.status === 403,
      'STUDENT',
      'Student attempting to delete a student record is blocked (HTTP 403 Forbidden)'
    );

    // 1.15 Student attempting to access Admin Semester Reports API via GET /api/results/reports/semester
    const studentReports = await request('http://localhost:5000/api/results/reports/semester', {
      method: 'GET',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(
      studentReports.status === 403,
      'STUDENT',
      'Student attempting to access Admin reports API is blocked (HTTP 403 Forbidden)'
    );

    // -------------------------------------------------------------
    // 2. ADMIN PERMISSION ENFORCEMENT
    // -------------------------------------------------------------
    console.log('\n--- VERIFYING ADMIN PERMISSIONS ---');

    // 2.1 Admin viewing all students via GET /api/students
    const adminStudentsRes = await request('http://localhost:5000/api/students', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminStudentsRes.status === 200 && Array.isArray(adminStudentsRes.data.data),
      'ADMIN',
      `Admin can view all students (Count: ${adminStudentsRes.data.count}) (HTTP 200)`
    );

    // 2.2 Admin viewing all results via GET /api/results
    assert(
      adminResultsRes.status === 200 && Array.isArray(allResults),
      'ADMIN',
      `Admin can view all results across students (Count: ${adminResultsRes.data.count}) (HTTP 200)`
    );

    // 2.3 Admin viewing any single student by ID
    const adminSingleStudent = await request('http://localhost:5000/api/students/STU-2024-002', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminSingleStudent.status === 200 && adminSingleStudent.data.data.studentId === 'STU-2024-002',
      'ADMIN',
      'Admin can view any student profile (STU-2024-002) (HTTP 200)'
    );

    // 2.4 Admin adding a student via POST /api/students
    const testAdminRoll = `TEST${Date.now().toString().slice(-4)}`;
    const adminAddStudent = await request('http://localhost:5000/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    }, {
      rollNumber: testAdminRoll,
      studentName: 'Admin Created Student',
      department: 'Information Technology',
      semester: 3,
      section: 'B',
    });
    assert(
      adminAddStudent.status === 201 && adminAddStudent.data.data.rollNumber === testAdminRoll,
      'ADMIN',
      `Admin can add a new student (Roll: ${testAdminRoll}) (HTTP 201)`
    );
    const createdStudentId = adminAddStudent.data.data.studentId;

    // 2.5 Admin updating student record via PUT /api/students/:id
    const adminUpdateStudent = await request(`http://localhost:5000/api/students/${createdStudentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    }, {
      studentName: 'Admin Updated Student Name',
    });
    assert(
      adminUpdateStudent.status === 200 && adminUpdateStudent.data.data.studentName === 'Admin Updated Student Name',
      'ADMIN',
      'Admin can update student details (HTTP 200)'
    );

    // 2.6 Admin uploading marks via POST /api/results
    const testSubjectCode = `SUB${Date.now().toString().slice(-4)}`;
    const adminAddMarks = await request('http://localhost:5000/api/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    }, {
      studentId: createdStudentId,
      subjectCode: testSubjectCode,
      subjectName: 'Computer Architecture & Microprocessors',
      marks: 88,
      semester: 3,
    });
    assert(
      adminAddMarks.status === 201 && adminAddMarks.data.data.grade === 'A+',
      'ADMIN',
      'Admin can upload marks with auto-calculated grade (HTTP 201)'
    );
    const createdResultId = adminAddMarks.data.data.resultId;

    // 2.7 Admin editing/updating marks via PUT /api/results/:id
    const adminUpdateMarks = await request(`http://localhost:5000/api/results/${createdResultId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    }, {
      marks: 96,
    });
    assert(
      adminUpdateMarks.status === 200 && adminUpdateMarks.data.data.grade === 'O',
      'ADMIN',
      'Admin can edit and update marks with automatic grade recalculation (HTTP 200)'
    );

    // 2.8 Admin viewing aggregate semester reports via GET /api/results/reports/semester
    const adminReports = await request('http://localhost:5000/api/results/reports/semester', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminReports.status === 200 && Array.isArray(adminReports.data.data.semesterSummary),
      'ADMIN',
      'Admin can view aggregate semester reports & pass rate analytics (HTTP 200)'
    );

    // 2.9 Admin deleting marks via DELETE /api/results/:id
    const adminDeleteMarks = await request(`http://localhost:5000/api/results/${createdResultId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminDeleteMarks.status === 200 && adminDeleteMarks.data.success,
      'ADMIN',
      'Admin can delete marks (HTTP 200)'
    );

    // 2.10 Admin deleting student record via DELETE /api/students/:id
    const adminDeleteStudent = await request(`http://localhost:5000/api/students/${createdStudentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminDeleteStudent.status === 200 && adminDeleteStudent.data.success,
      'ADMIN',
      'Admin can delete student records (HTTP 200)'
    );

    console.log('\n================================================================');
    console.log(` RBAC SECURITY TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal error during security test suite:', err);
    process.exit(1);
  }
};

runSecurityTests();

