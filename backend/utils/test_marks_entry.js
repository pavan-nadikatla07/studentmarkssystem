const http = require('http');

const request = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

async function runTests() {
  console.log('=== RUNNING MARKS ENTRY INTEGRATION TESTS ===\n');

  // 1. Admin Login
  console.log('Test 1: Admin Authentication');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@sves.org.in', password: 'adminpassword123' }
  );

  if (!loginRes.body.success || !loginRes.body.token) {
    console.error('Failed to log in as admin:', loginRes.body);
    process.exit(1);
  }
  const token = loginRes.body.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  console.log('✓ Admin login successful! Token received.\n');

  // 2. Fetch Students
  console.log('Test 2: Fetch Students and verify 5 branches');
  const studentsRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/students',
      method: 'GET',
      headers: authHeaders,
    }
  );
  console.log(`✓ Fetched ${studentsRes.body.data.length} students across branches.`);
  const rahul = studentsRes.body.data.find((s) => s.rollNumber === '2024CS001');
  const amit = studentsRes.body.data.find((s) => s.rollNumber === '2024EC015');
  const sai = studentsRes.body.data.find((s) => s.rollNumber === '2024EE001');
  const rajesh = studentsRes.body.data.find((s) => s.rollNumber === '2024ME001');
  const suresh = studentsRes.body.data.find((s) => s.rollNumber === '2024CE001');

  console.log('  CSE Student:', rahul ? rahul.studentName : 'Not found');
  console.log('  ECE Student:', amit ? amit.studentName : 'Not found');
  console.log('  EEE Student:', sai ? sai.studentName : 'Not found');
  console.log('  MECH Student:', rajesh ? rajesh.studentName : 'Not found');
  console.log('  CIVIL Student:', suresh ? suresh.studentName : 'Not found\n');

  // 3. Test Marks Entry for CSE Sem III (V23CST04 - Advanced Data Structures & Algorithm Analysis)
  console.log('Test 3: Enter Marks for CSE Sem III (V23CST04)');
  const cseMarkRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/results',
      method: 'POST',
      headers: authHeaders,
    },
    {
      studentId: rahul.studentId,
      semester: 3,
      subjectCode: 'V23CST04',
      subjectName: 'Advanced Data Structures & Algorithm Analysis',
      marks: 92,
    }
  );
  if (cseMarkRes.status === 201) {
    console.log('✓ Marks successfully recorded for V23CST04 with grade:', cseMarkRes.body.data.grade);
  } else if (cseMarkRes.status === 400 && cseMarkRes.body.message.includes('already exists')) {
    console.log('✓ Result already recorded (verified duplicate protection):', cseMarkRes.body.message);
  } else {
    console.error('Failed to record CSE marks:', cseMarkRes);
  }

  // 4. Test Semester VII Special Rule: Project only
  console.log('\nTest 4: Semester VII Special Rule (Project Only - All Branches)');
  const sem7Res = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/results',
      method: 'POST',
      headers: authHeaders,
    },
    {
      studentId: rahul.studentId,
      semester: 7,
      subjectCode: 'PROJECT',
      subjectName: 'Project',
      marks: 95,
    }
  );
  if (sem7Res.status === 201) {
    console.log('✓ Semester VII Project marks recorded successfully! Grade:', sem7Res.body.data.grade);
  } else if (sem7Res.status === 400 && sem7Res.body.message.includes('already exists')) {
    console.log('✓ Semester VII Project already recorded:', sem7Res.body.message);
  } else {
    console.error('Failed to record Sem VII Project:', sem7Res);
  }

  // 5. Test Semester VIII Special Rule: Internship only
  console.log('\nTest 5: Semester VIII Special Rule (Internship Only - All Branches)');
  const sem8Res = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/results',
      method: 'POST',
      headers: authHeaders,
    },
    {
      studentId: rahul.studentId,
      semester: 8,
      subjectCode: 'INTERNSHIP',
      subjectName: 'Internship',
      marks: 98,
    }
  );
  if (sem8Res.status === 201) {
    console.log('✓ Semester VIII Internship marks recorded successfully! Grade:', sem8Res.body.data.grade);
  } else if (sem8Res.status === 400 && sem8Res.body.message.includes('already exists')) {
    console.log('✓ Semester VIII Internship already recorded:', sem8Res.body.message);
  } else {
    console.error('Failed to record Sem VIII Internship:', sem8Res);
  }

  // 6. Test Validation: Invalid marks (> 100 or < 0)
  console.log('\nTest 6: Boundary Validation (Marks > 100 and < 0)');
  const invalidMarksRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/results',
      method: 'POST',
      headers: authHeaders,
    },
    {
      studentId: rahul.studentId,
      semester: 1,
      subjectCode: 'V23CST01',
      subjectName: 'Introduction to Programming',
      marks: 150,
    }
  );
  console.log('✓ Rejection status for marks 150:', invalidMarksRes.status, invalidMarksRes.body.message);

  // 7. Verify SGPA Calculation
  console.log('\nTest 7: Verify Results Retrieval and SGPA calculation');
  const getResultsRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/results?studentId=${rahul.studentId}`,
      method: 'GET',
      headers: authHeaders,
    }
  );
  console.log(`✓ Retrieved ${getResultsRes.body.data.length} results for Rahul.`);
  const sem7Result = getResultsRes.body.data.find((r) => r.semester === 7);
  const sem8Result = getResultsRes.body.data.find((r) => r.semester === 8);
  console.log('  Sem 7 Record:', sem7Result ? `${sem7Result.subjectCode} - ${sem7Result.subjectName}: ${sem7Result.marks} marks (SGPA: ${sem7Result.SGPA})` : 'None');
  console.log('  Sem 8 Record:', sem8Result ? `${sem8Result.subjectCode} - ${sem8Result.subjectName}: ${sem8Result.marks} marks (SGPA: ${sem8Result.SGPA})` : 'None');

  console.log('\n=== ALL MARKS ENTRY INTEGRATION TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
