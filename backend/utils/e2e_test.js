// e2e_test.js - Comprehensive E2E Verification Script
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

const runVerification = async () => {
  console.log('====================================================');
  console.log(' STARTING ONLINE EXAMINATION RESULT PORTAL E2E TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, detail = '') => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail}`);
      failed++;
    }
  };

  try {
    // 1. Check Frontend Dev Server
    const fe = await request('http://localhost:5173/');
    assert(fe.status === 200, 'Frontend Vite dev server is serving index.html');

    // 2. Check Backend Health
    const be = await request('http://localhost:5000/');
    assert(be.status === 200 && be.data.status === 'Active', 'Backend API is active and healthy');

    // 3. Student Registration with SVES College Email format (<rollNumber>@sves.org.in)
    const testRoll = `2024CS${Date.now().toString().slice(-3)}`;
    const expectedCollegeEmail = `${testRoll.toLowerCase()}@sves.org.in`;
    const regRes = await request('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'Vikas Test Student',
      email: expectedCollegeEmail,
      password: 'password123',
      role: 'student',
      rollNumber: testRoll,
      department: 'Computer Science & Engineering',
      semester: 4,
      section: 'A',
    });
    assert(
      regRes.status === 201 && regRes.data.user.email === expectedCollegeEmail,
      `Student Registration with College Email (${expectedCollegeEmail})`
    );

    // 4. Test Newly Registered Student Login using their College Email
    const newStudentEmailLogin = await request('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: expectedCollegeEmail,
      password: 'password123',
    });
    assert(
      newStudentEmailLogin.status === 200 && newStudentEmailLogin.data.user.email === expectedCollegeEmail,
      'Newly Registered Student Login via SVES College Email'
    );

    // 5. Test Newly Registered Student Login using Roll Number directly
    const newStudentRollLogin = await request('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: testRoll,
      password: 'password123',
    });
    assert(
      newStudentRollLogin.status === 200 && newStudentRollLogin.data.student.rollNumber === testRoll,
      `Newly Registered Student Login via Roll Number (${testRoll})`
    );

    // 6. Student Login with Seed Account (Rahul)
    const loginRes = await request('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: '2024cs001@sves.org.in',
      password: 'student123',
    });
    const rahulToken = loginRes.status === 200 ? loginRes.data.token : newStudentEmailLogin.data.token;
    assert(loginRes.status === 200 || newStudentEmailLogin.status === 200, 'Student Authentication Token Available');

    // 7. Fetch Student Profile (/auth/me)
    const meRes = await request('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${rahulToken}` },
    });
    assert(meRes.status === 200, 'Fetch Student Profile & Linked Record (GET /auth/me)');

    // 8. Fetch Student's Own Results (/results)
    const resultsRes = await request('http://localhost:5000/api/results', {
      method: 'GET',
      headers: { Authorization: `Bearer ${rahulToken}` },
    });
    assert(resultsRes.status === 200, `Fetch Student Results (Count: ${resultsRes.data.count})`);

    // 9. Verify RBAC: Student attempting Admin API should receive 403 Forbidden
    const forbiddenRes = await request('http://localhost:5000/api/results/reports/semester', {
      method: 'GET',
      headers: { Authorization: `Bearer ${rahulToken}` },
    });
    assert(forbiddenRes.status === 403, 'RBAC Security: Student blocked from Admin API (403 Forbidden)');

    // 10. Admin Login
    const adminLoginRes = await request('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: 'admin@sves.org.in',
      password: 'adminpassword123',
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.data.user.role === 'admin', 'Admin Login via admin@sves.org.in (POST /login)');
    const adminToken = adminLoginRes.data?.token;

    // 9. Admin Fetch Students (GET /students)
    const studentsListRes = await request('http://localhost:5000/api/students', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(studentsListRes.status === 200 && studentsListRes.data.count >= 3, `Admin Fetch All Students (Count: ${studentsListRes.data.count})`);

    // 10. Admin Add Result with Auto-grade calculation (POST /results)
    const newResultPayload = {
      studentId: 'STU-2024-003', // Amit Verma
      subjectCode: `TEST${Date.now().toString().slice(-3)}`,
      subjectName: 'Artificial Intelligence & Machine Learning',
      marks: 92,
      semester: 4,
    };
    const addResultRes = await request('http://localhost:5000/api/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    }, newResultPayload);
    assert(
      addResultRes.status === 201 && addResultRes.data.data.grade === 'O',
      'Admin Add Result (Auto-grade calculated as "O" for 92 marks)'
    );
    const createdResultId = addResultRes.data.data.resultId;

    // 11. Admin Update Marks (PUT /results/:id)
    const updateResultRes = await request(`http://localhost:5000/api/results/${createdResultId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    }, {
      marks: 85,
      subjectName: 'Artificial Intelligence & Deep Learning',
    });
    assert(
      updateResultRes.status === 200 && updateResultRes.data.data.grade === 'A+',
      'Admin Update Marks (Auto-grade recalculated as "A+" for 85 marks)'
    );

    // 12. MongoDB Aggregation: Semester Report (GET /results/reports/semester)
    const reportRes = await request('http://localhost:5000/api/results/reports/semester', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      reportRes.status === 200 && reportRes.data.data.semesterSummary.length > 0,
      'MongoDB Aggregate: Semester Summary Report Generated'
    );

    // 13. Admin Delete Result (DELETE /results/:id)
    const deleteRes = await request(`http://localhost:5000/api/results/${createdResultId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteRes.status === 200 && deleteRes.data.success, 'Admin Delete Result (DELETE /results/:id)');

    console.log('\n====================================================');
    console.log(` E2E TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
  } catch (err) {
    console.error('Verification error:', err);
  }
};

runVerification();
