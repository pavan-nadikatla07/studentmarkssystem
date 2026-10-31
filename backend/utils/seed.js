require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Result = require('../models/Result');
const { calculateGrade, calculateSGPA } = require('./grading');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/exam_portal';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding!');

    // Clear existing collections
    await User.deleteMany({});
    await Student.deleteMany({});
    await Result.deleteMany({});
    console.log('Cleared existing collections (Users, Students, Results).');

    // 1. Create Admin User
    const adminUser = await User.create({
      userId: 'USR-ADMIN-01',
      name: 'Dr. Ramesh Kumar (Exam Controller)',
      email: 'admin@sves.org.in',
      password: 'adminpassword123',
      role: 'admin',
    });
    console.log(`Admin created: ${adminUser.email} / adminpassword123`);

    // 2. Create Students & Users with SVES College Email format: <rollNumber>@sves.org.in
    const studentsRaw = [
      {
        userId: 'USR-STU-001',
        studentId: 'STU-2024-001',
        rollNumber: '2024CS001',
        studentName: 'Rahul Sharma',
        email: '2024cs001@sves.org.in',
        password: 'student123',
        department: 'Computer Science & Engineering',
        semester: 4,
        section: 'A',
      },
      {
        userId: 'USR-STU-002',
        studentId: 'STU-2024-002',
        rollNumber: '2024CS002',
        studentName: 'Priya Patel',
        email: '2024cs002@sves.org.in',
        password: 'student123',
        department: 'Computer Science & Engineering',
        semester: 4,
        section: 'A',
      },
      {
        userId: 'USR-STU-003',
        studentId: 'STU-2024-003',
        rollNumber: '2024EC015',
        studentName: 'Amit Verma',
        email: '2024ec015@sves.org.in',
        password: 'student123',
        department: 'Electronics & Communication',
        semester: 4,
        section: 'B',
      },
    ];

    for (const s of studentsRaw) {
      await User.create({
        userId: s.userId,
        name: s.studentName,
        email: s.email,
        password: s.password,
        role: 'student',
      });

      await Student.create({
        studentId: s.studentId,
        rollNumber: s.rollNumber,
        studentName: s.studentName,
        department: s.department,
        semester: s.semester,
        section: s.section,
        userId: s.userId,
      });
    }
    console.log('Created 3 Student user accounts and student records.');

    // 3. Create Sample Results
    // Rahul's Semester 4 results
    const rahulMarks = [
      { subjectCode: 'CS401', subjectName: 'Data Structures & Algorithms', marks: 92 },
      { subjectCode: 'CS402', subjectName: 'Database Management Systems', marks: 88 },
      { subjectCode: 'CS403', subjectName: 'Operating Systems', marks: 85 },
      { subjectCode: 'CS404', subjectName: 'Computer Networks', marks: 78 },
      { subjectCode: 'CS405', subjectName: 'Software Engineering', marks: 90 },
    ];

    // Priya's Semester 4 results
    const priyaMarks = [
      { subjectCode: 'CS401', subjectName: 'Data Structures & Algorithms', marks: 95 },
      { subjectCode: 'CS402', subjectName: 'Database Management Systems', marks: 94 },
      { subjectCode: 'CS403', subjectName: 'Operating Systems', marks: 91 },
      { subjectCode: 'CS404', subjectName: 'Computer Networks', marks: 89 },
      { subjectCode: 'CS405', subjectName: 'Software Engineering', marks: 96 },
    ];

    // Amit's Semester 4 results
    const amitMarks = [
      { subjectCode: 'EC401', subjectName: 'Signals & Systems', marks: 74 },
      { subjectCode: 'EC402', subjectName: 'Analog Electronic Circuits', marks: 68 },
      { subjectCode: 'EC403', subjectName: 'Microprocessors & Microcontrollers', marks: 82 },
      { subjectCode: 'EC404', subjectName: 'Electromagnetic Field Theory', marks: 64 },
      { subjectCode: 'EC405', subjectName: 'Control Systems', marks: 71 },
    ];

    // Function to calculate SGPA and insert batch
    const insertResults = async (studentId, list, semester) => {
      const prepared = list.map((item, index) => {
        const grade = calculateGrade(item.marks);
        return {
          resultId: `RES-${studentId.slice(-3)}-${semester}-${index + 1}`,
          studentId,
          subjectCode: item.subjectCode,
          subjectName: item.subjectName,
          marks: item.marks,
          grade,
          semester,
        };
      });

      const sgpa = calculateSGPA(prepared);

      const finalRecords = prepared.map((r) => ({
        ...r,
        SGPA: sgpa,
      }));

      await Result.insertMany(finalRecords);
      return sgpa;
    };

    const rahulSgpa = await insertResults('STU-2024-001', rahulMarks, 4);
    const priyaSgpa = await insertResults('STU-2024-002', priyaMarks, 4);
    const amitSgpa = await insertResults('STU-2024-003', amitMarks, 4);

    // Also add Semester 3 results for Rahul to test semester selection!
    const rahulSem3 = [
      { subjectCode: 'CS301', subjectName: 'Discrete Mathematics', marks: 84 },
      { subjectCode: 'CS302', subjectName: 'Digital Logic Design', marks: 80 },
      { subjectCode: 'CS303', subjectName: 'Object Oriented Programming', marks: 89 },
      { subjectCode: 'CS304', subjectName: 'Computer Organization', marks: 76 },
    ];
    await insertResults('STU-2024-001', rahulSem3, 3);

    console.log(`Results inserted. Rahul Sem 4 SGPA: ${rahulSgpa}, Priya Sem 4 SGPA: ${priyaSgpa}, Amit Sem 4 SGPA: ${amitSgpa}`);
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
