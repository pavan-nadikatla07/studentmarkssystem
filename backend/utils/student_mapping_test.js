// student_mapping_test.js - Verification of Mandatory Fields & Automatic Student Record Mapping
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

const runMappingTests = async () => {
  console.log('========================================================================');
  console.log(' RUNNING STUDENT REGISTRATION & AUTOMATIC RECORD MAPPING TEST SUITE');
  console.log('========================================================================\n');

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
    // 0. Admin Login to setup an unlinked student record for testing mapping
    const adminLoginRes = await request('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: 'admin@sves.org.in',
      password: 'adminpassword123',
    });
    const adminToken = adminLoginRes.data?.token;
    assert(adminLoginRes.status === 200 && adminToken, 'Admin Login for Pre-test Setup');

    // 1. Mandatory Fields Validation Tests
    console.log('\n--- 1. MANDATORY FIELDS VALIDATION TESTS ---');

    // 1a. Missing Student Name
    const missNameRes = await request('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      rollNumber: '2024CS991',
      branch: 'Computer Science & Engineering',
      semester: 4,
      email: 'noname@sves.org.in',
      password: 'password123',
      role: 'student',
    });
    assert(missNameRes.status === 400, 'Rejects registration when Student Name is missing');

    // 1b. Missing Roll Number
    const missRollRes = await request('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'Test Student',
      branch: 'Computer Science & Engineering',
      semester: 4,
      email: 'noroll@sves.org.in',
      password: 'password123',
      role: 'student',
    });
    assert(missRollRes.status === 400, 'Rejects registration when Roll Number is missing');

    // 1c. Missing Branch
    const missBranchRes = await request('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'Test Student',
      rollNumber: '2024CS992',
      semester: 4,
      email: 'nobranch@sves.org.in',
      password: 'password123',
      role: 'student',
    });
    assert(missBranchRes.status === 400, 'Rejects registration when Branch is missing');

    // 1d. Invalid Branch
    const invalidBranchRes = await request('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'Test Student',
      rollNumber: '2024CS993',
      branch: 'Invalid Astronomy Engineering',
      semester: 4,
      email: 'badbranch@sves.org.in',
      password: 'password123',
      role: 'student',
    });
    assert(invalidBranchRes.status === 400, 'Rejects registration with invalid Branch');

    // 1e. Missing / Invalid Semester (< 1 or > 8)
    const badSemRes = await request('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'Test Student',
      rollNumber: '2024CS994',
      branch: 'Computer Science & Engineering',
      semester: 12,
      email: 'badsem@sves.org.in',
      password: 'password123',
      role: 'student',
    });
    assert(badSemRes.status === 400, 'Rejects registration with invalid Semester (> 8)');

    // 1f. Missing / Short Password (< 6 chars)
    const shortPassRes = await request('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'Test Student',
      rollNumber: '2024CS995',
      branch: 'Computer Science & Engineering',
      semester: 4,
      email: 'shortpass@sves.org.in',
      password: '123',
      role: 'student',
    });
    assert(shortPassRes.status === 400, 'Rejects registration with password < 6 characters');

    // -------------------------------------------------------------------------
    // 2. CASE 2: NEW ROLL NUMBER -> CREATE STUDENT + LOGIN
    // -------------------------------------------------------------------------
    console.log('\n--- 2. CASE 2: NEW ROLL NUMBER -> CREATE STUDENT + LOGIN ---');
    const newRoll = `2024CS${Date.now().toString().slice(-4)}`;
    const newStudentEmail = `${newRoll.toLowerCase()}@sves.org.in`;

    const newRegRes = await request('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'Aditya Rao',
      rollNumber: newRoll,
      branch: 'Computer Science & Engineering',
      semester: 3,
      email: newStudentEmail,
      password: 'securepassword123',
      role: 'student',
    });
    assert(
      newRegRes.status === 201 &&
      newRegRes.data.student.rollNumber === newRoll &&
      newRegRes.data.student.studentName === 'Aditya Rao' &&
      newRegRes.data.student.department === 'Computer Science & Engineering' &&
      newRegRes.data.student.semester === 3,
      `New Roll Number creates new student record (${newRoll})`
    );
    const createdStudentDbId = newRegRes.data.student._id;
    const createdUserStudentRef = newRegRes.data.user.student;
    assert(
      createdUserStudentRef && String(createdUserStudentRef) === String(createdStudentDbId),
      'User account is properly referenced to created Student ObjectId'
    );

    // Verify login with newly registered student
    const newLoginRes = await request('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: newStudentEmail,
      password: 'securepassword123',
    });
    assert(
      newLoginRes.status === 200 &&
      newLoginRes.data.student.rollNumber === newRoll &&
      newLoginRes.data.student.studentName === 'Aditya Rao',
      'Successful Login for new student returns correct linked Student Profile'
    );

    // Verify /api/auth/me returns linked student profile
    const newMeRes = await request('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${newLoginRes.data.token}` },
    });
    assert(
      newMeRes.status === 200 &&
      newMeRes.data.student &&
      newMeRes.data.student.rollNumber === newRoll,
      'GET /api/auth/me returns linked student profile'
    );

    // -------------------------------------------------------------------------
    // 3. CASE 1: EXISTING ROLL NUMBER -> MAP TO EXISTING STUDENT RECORD
    // -------------------------------------------------------------------------
    console.log('\n--- 3. CASE 1: EXISTING ROLL NUMBER -> MAP LOGIN TO EXISTING STUDENT ---');

    // Step 3a: Admin pre-populates a student record in database (without user account yet)
    const preRoll = `PRE${Date.now().toString().slice(-4)}`;
    const preStudentRes = await request('http://localhost:5000/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    }, {
      rollNumber: preRoll,
      studentName: 'Meera Nambiar',
      department: 'Electronics & Communication',
      semester: 5,
      section: 'A',
    });
    assert(preStudentRes.status === 201, `Admin pre-enrolled student (${preRoll}) in database`);
    const preStudentId = preStudentRes.data.data.studentId;
    const preStudentMongoId = preStudentRes.data.data._id;

    // Step 3b: Admin enters an examination result for this pre-enrolled student
    const preResultRes = await request('http://localhost:5000/api/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    }, {
      studentId: preStudentId,
      subjectCode: 'EC501',
      subjectName: 'VLSI Design & Embedded Systems',
      marks: 91,
      semester: 5,
    });
    assert(preResultRes.status === 201, 'Admin uploaded marks for pre-enrolled student');

    // Step 3c: Student Meera registers herself with matching details
    const meeraEmail = `${preRoll.toLowerCase()}@sves.org.in`;
    const meeraRegRes = await request('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'Meera Nambiar',
      rollNumber: preRoll,
      branch: 'Electronics & Communication',
      semester: 5,
      email: meeraEmail,
      password: 'meerapassword123',
      role: 'student',
    });
    assert(
      meeraRegRes.status === 201,
      `Registration with existing matching Roll Number succeeds (HTTP 201)`
    );
    assert(
      String(meeraRegRes.data.student._id) === String(preStudentMongoId),
      'Linked account mapped to EXACT existing student record (NO duplicate student created)'
    );

    // Step 3d: Verify that Meera logs in and immediately sees her pre-existing exam results
    const meeraLoginRes = await request('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: meeraEmail,
      password: 'meerapassword123',
    });
    assert(meeraLoginRes.status === 200, 'Meera logs in successfully');

    const meeraResultsRes = await request('http://localhost:5000/api/results', {
      method: 'GET',
      headers: { Authorization: `Bearer ${meeraLoginRes.data.token}` },
    });
    assert(
      meeraResultsRes.status === 200 &&
      meeraResultsRes.data.count === 1 &&
      meeraResultsRes.data.data[0].subjectCode === 'EC501' &&
      meeraResultsRes.data.data[0].grade === 'O',
      'Pre-existing academic marks and SGPA are fully preserved upon account mapping'
    );

    // -------------------------------------------------------------------------
    // 4. MISMATCHED DETAILS & DUPLICATE REGISTRATION CHECKS
    // -------------------------------------------------------------------------
    console.log('\n--- 4. MISMATCHED DETAILS & DUPLICATE CHECKS ---');

    // Step 4a: Admin pre-populates another student record
    const mismatchRoll = `MIS${Date.now().toString().slice(-4)}`;
    await request('http://localhost:5000/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    }, {
      rollNumber: mismatchRoll,
      studentName: 'Sanjay Reddy',
      department: 'Mechanical Engineering',
      semester: 6,
      section: 'B',
    });

    // 4b. Mismatched Name: Attempt to register with wrong name
    const wrongNameRes = await request('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'Wrong Imposter Name',
      rollNumber: mismatchRoll,
      branch: 'Mechanical Engineering',
      semester: 6,
      email: 'wrongname@sves.org.in',
      password: 'password123',
      role: 'student',
    });
    assert(
      wrongNameRes.status === 400 && wrongNameRes.data.message.includes('Student Name'),
      'Rejects registration when Student Name conflicts with existing record'
    );

    // 4c. Mismatched Branch: Attempt to register with wrong branch
    const wrongBranchRes = await request('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'Sanjay Reddy',
      rollNumber: mismatchRoll,
      branch: 'Civil Engineering', // Real is Mechanical
      semester: 6,
      email: 'wrongbranch@sves.org.in',
      password: 'password123',
      role: 'student',
    });
    assert(
      wrongBranchRes.status === 400 && wrongBranchRes.data.message.includes('Branch'),
      'Rejects registration when Branch conflicts with existing record'
    );

    // 4d. Mismatched Semester: Attempt to register with wrong semester
    const wrongSemRes = await request('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'Sanjay Reddy',
      rollNumber: mismatchRoll,
      branch: 'Mechanical Engineering',
      semester: 2, // Real is 6
      email: 'wrongsem@sves.org.in',
      password: 'password123',
      role: 'student',
    });
    assert(
      wrongSemRes.status === 400 && wrongSemRes.data.message.includes('Semester'),
      'Rejects registration when Semester conflicts with existing record'
    );

    // 4e. Duplicate Registration for already-linked student:
    // Attempting to register again with Meera's roll number (which is already linked)
    const dupMeeraRes = await request('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'Meera Nambiar',
      rollNumber: preRoll,
      branch: 'Electronics & Communication',
      semester: 5,
      email: 'another_meera_email@sves.org.in',
      password: 'password123',
      role: 'student',
    });
    assert(
      dupMeeraRes.status === 400 && dupMeeraRes.data.message.includes('already registered and linked'),
      'Rejects duplicate registration for an already-linked student record'
    );

    // 4f. Duplicate Email check
    const dupEmailRes = await request('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'New Person',
      rollNumber: `NEW${Date.now().toString().slice(-4)}`,
      branch: 'Information Technology',
      semester: 1,
      email: meeraEmail, // Already in use by Meera
      password: 'password123',
      role: 'student',
    });
    assert(
      dupEmailRes.status === 400 && dupEmailRes.data.message.includes('email'),
      'Rejects registration when email is already registered'
    );

    // -------------------------------------------------------------------------
    // 5. EXISTING USERS COMPATIBILITY
    // -------------------------------------------------------------------------
    console.log('\n--- 5. EXISTING USERS COMPATIBILITY ---');

    // 5a. Seed Student 1 (Rahul) continues to log in without error
    const rahulLoginRes = await request('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: '2024cs001@sves.org.in',
      password: 'student123',
    });
    assert(
      rahulLoginRes.status === 200 && rahulLoginRes.data.student.rollNumber === '2024CS001',
      'Existing seed student (Rahul - 2024CS001) logs in without migration errors'
    );

    // 5b. Seed Student 2 (Priya) logs in using Roll Number directly
    const priyaRollLogin = await request('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: '2024CS002',
      password: 'student123',
    });
    assert(
      priyaRollLogin.status === 200 && priyaRollLogin.data.student.rollNumber === '2024CS002',
      'Existing seed student (Priya - 2024CS002) logs in via Roll Number without error'
    );

    // 5c. Admin User continues to log in and manage students/results
    const adminCheckRes = await request('http://localhost:5000/api/students', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminCheckRes.status === 200 && adminCheckRes.data.count >= 3,
      'Admin continues to view all students without migration errors'
    );

    console.log('\n========================================================================');
    console.log(` STUDENT MAPPING TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
};

runMappingTests();

