/**
 * admin_roll_autofill_test.js
 * Verification test suite for Admin Roll Number Autofill & Result Entry
 */
const http = require('http');

const request = (url, options = {}, data = null) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body),
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: body,
          });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const assert = (condition, category, message) => {
  if (condition) {
    console.log(`[PASS] [${category}] ${message}`);
  } else {
    console.error(`[FAIL] [${category}] ${message}`);
    process.exitCode = 1;
  }
};

(async () => {
  console.log('========================================================================');
  console.log(' RUNNING ADMIN ROLL NUMBER AUTOFILL & RESULT ENTRY TEST SUITE');
  console.log('========================================================================\n');

  try {
    // 1. Authenticate Admin
    const adminLogin = await request('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: 'admin@sves.org.in',
      password: 'adminpassword123',
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'AUTH', 'Admin Login Successful');
    const adminToken = adminLogin.data.token;

    // 2. Authenticate Student (Rahul)
    const studentLogin = await request('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: '2024cs001@sves.org.in',
      password: 'student123',
    });
    assert(studentLogin.status === 200 && studentLogin.data.token, 'AUTH', 'Student Login Successful');
    const studentToken = studentLogin.data.token;

    console.log('\n--- 1. GET /api/students/roll/:rollNumber ENDPOINT TESTS ---');

    // Test 1: Admin queries existing student by Roll Number (uppercase)
    const rollQueryUpper = await request('http://localhost:5000/api/students/roll/2024CS001', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      rollQueryUpper.status === 200 &&
      rollQueryUpper.data.success === true &&
      rollQueryUpper.data.data.rollNumber === '2024CS001' &&
      rollQueryUpper.data.data.studentName === 'Rahul Sharma' &&
      rollQueryUpper.data.data.department === 'Computer Science & Engineering',
      'ROLL_LOOKUP',
      'Admin fetches student record by Roll Number (2024CS001)'
    );

    // Test 2: Admin queries existing student by lowercase roll number (case insensitivity)
    const rollQueryLower = await request('http://localhost:5000/api/students/roll/2024cs001', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      rollQueryLower.status === 200 &&
      rollQueryLower.data.data.rollNumber === '2024CS001',
      'ROLL_LOOKUP',
      'Roll Number lookup is case-insensitive (2024cs001 -> 2024CS001)'
    );

    // Test 3: Admin queries non-existent roll number
    const rollQueryMissing = await request('http://localhost:5000/api/students/roll/NONEXISTENT999', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      rollQueryMissing.status === 404 &&
      rollQueryMissing.data.success === false,
      'ROLL_LOOKUP',
      'Returns HTTP 404 with clear message for non-existent roll number'
    );

    // Test 4: Student token attempts to access /api/students/roll/:rollNumber
    const studentRollAttempt = await request('http://localhost:5000/api/students/roll/2024CS001', {
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      studentRollAttempt.status === 403 &&
      studentRollAttempt.data.success === false,
      'SECURITY',
      'Student forbidden from accessing /api/students/roll/:rollNumber (HTTP 403)'
    );

    // Test 5: Unauthenticated access to /api/students/roll/:rollNumber
    const unauthRollAttempt = await request('http://localhost:5000/api/students/roll/2024CS001', {
      method: 'GET',
    });
    assert(
      unauthRollAttempt.status === 401,
      'SECURITY',
      'Unauthenticated request blocked (HTTP 401)'
    );

    console.log('\n--- 2. ADMIN RESULT ENTRY WITH ROLL NUMBER TESTS ---');

    // Test 6: Create result using rollNumber directly
    const testSubjectCode = `TEST${Math.floor(100 + Math.random() * 900)}`;
    const createWithRoll = await request('http://localhost:5000/api/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    }, {
      rollNumber: '2024CS001',
      semester: 1,
      subjectCode: testSubjectCode,
      subjectName: 'Test Subject Autofill',
      marks: 88,
    });
    assert(
      createWithRoll.status === 201 &&
      createWithRoll.data.success === true &&
      createWithRoll.data.data.grade === 'A+' &&
      createWithRoll.data.data.marks === 88,
      'RESULT_ENTRY',
      `Admin successfully records result using rollNumber (Code: ${testSubjectCode}, Grade: A+)`
    );

    // Test 7: Duplicate result rejection
    const duplicateAttempt = await request('http://localhost:5000/api/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    }, {
      rollNumber: '2024CS001',
      semester: 1,
      subjectCode: testSubjectCode,
      subjectName: 'Test Subject Autofill',
      marks: 90,
    });
    assert(
      duplicateAttempt.status === 400 &&
      duplicateAttempt.data.success === false,
      'VALIDATION',
      'Rejects duplicate result submission for same student, subject, and semester (HTTP 400)'
    );

    // Cleanup the test result
    if (createWithRoll.data?.data?.resultId) {
      await request(`http://localhost:5000/api/results/${createWithRoll.data.data.resultId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      console.log(`[CLEANUP] Deleted test result ${createWithRoll.data.data.resultId}`);
    }

    console.log('\n========================================================================');
    console.log(' ALL ADMIN ROLL AUTOFILL TESTS COMPLETED SUCCESSFULLY');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exitCode = 1;
  }
})();
